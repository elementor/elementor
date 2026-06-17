import { BREAKPOINTS_SCHEMA_FULL_URI, convertStyleBlocksToAtomic, type StyleBlock } from '@elementor/editor-canvas';
import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { type Props } from '@elementor/editor-props';
import { type BreakpointId } from '@elementor/editor-responsive';
import { type CustomCss, type StyleDefinitionState } from '@elementor/editor-styles';
import { type StylesProvider } from '@elementor/editor-styles-repository';
import { z } from '@elementor/schema';

import { globalClassesStylesProvider } from '../global-classes-styles-provider';
import { loadExistingClasses } from '../load-existing-classes';
import { saveGlobalClasses } from '../save-global-classes';
import { GLOBAL_CLASSES_URI } from './classes-resource';

const schema = {
	action: z.enum( [ 'create', 'modify', 'delete' ] ).describe( 'Operation to perform' ),
	classId: z
		.string()
		.optional()
		.describe( 'Global class ID (required for modify). Get from elementor://global-classes resource.' ),
	globalClassName: z.string().optional().describe( 'Global class name (required for create)' ),
	style: z
		.object( {
			default: z
				.string()
				.describe( 'Plaintext CSS for the default state. MUST be non-empty — blank strings are rejected.' ),
			hover: z.string().describe( 'Plaintext CSS for the :hover state. optional' ).optional(),
			focus: z.string().describe( 'Plaintext CSS for the :focus state. optional' ).optional(),
			active: z.string().describe( 'Plaintext CSS for the :active state. optional' ).optional(),
		} )
		.describe(
			'Plaintext CSS per pseudo-state. All states are converted in one bulk request; unconvertible declarations are stored as custom CSS.'
		),
	breakpoint: z
		.nullable( z.string().describe( 'Responsive breakpoint name for styles. Defaults to desktop (null).' ) )
		.default( null )
		.describe( 'Responsive breakpoint name for styles. Defaults to desktop (null).' ),
};

const outputSchema = {
	status: z.enum( [ 'ok', 'error' ] ).describe( 'Operation status' ),
	classId: z.string().optional().describe( 'Class ID (returned on create success)' ),
	message: z.string().optional().describe( 'Error details if status is error' ),
};

type InputSchema = z.infer< ReturnType< typeof z.object< typeof schema > > >;
type OutputSchema = z.infer< ReturnType< typeof z.object< typeof outputSchema > > >;

type ConvertedStateStyle = {
	props: Props;
	customCss: CustomCss | null;
};

const handler = async ( input: InputSchema ): Promise< OutputSchema > => {
	const { action, classId: rawClassId, globalClassName, style: rawStyle, breakpoint } = input;
	let classId = rawClassId;
	if ( action === 'create' && ! globalClassName ) {
		return {
			status: 'error',
			message: 'Create requires globalClassName',
		};
	}

	if ( action === 'modify' && ! classId ) {
		return {
			status: 'error',
			message: 'Modify requires classId',
		};
	}

	if ( action === 'delete' && ! classId ) {
		return {
			status: 'error',
			message: 'Delete requires classId',
		};
	}

	const { create, update, delete: deleteClass } = globalClassesStylesProvider.actions;
	if ( ! create || ! update || ! deleteClass ) {
		return {
			status: 'error',
			message: 'Required actions not available',
		};
	}

	const styleBlocks = collectNonEmptyStyleBlocks( rawStyle );

	if ( action !== 'delete' && Object.keys( styleBlocks ).length === 0 ) {
		throw new Error(
			'Style must not be empty. Provide plaintext CSS per state.\n\nExample: style.default = "display: flex; flex-direction: column; gap: 1rem;"'
		);
	}

	let convertedByState: Record< string, ConvertedStateStyle > = {};
	if ( action !== 'delete' ) {
		const conversionResults = await convertStyleBlocksToAtomic( styleBlocks );
		convertedByState = Object.fromEntries(
			Object.entries( conversionResults ).map( ( [ state, { props, customCss } ] ) => [
				state,
				{ props: props as Props, customCss: toStoredCustomCss( customCss ) },
			] )
		);
	}

	const breakpointValue = breakpoint ?? 'desktop';
	let result = {
		status: 'error',
		classId: '',
		message: 'unknown error',
	} as { status: 'error' | 'ok'; message?: string; classId?: string };

	try {
		if ( action === 'delete' ) {
			const deleted = await attemptDelete( {
				classId,
				stylesProvider: globalClassesStylesProvider,
			} );
			if ( deleted ) {
				return { status: 'ok', message: `deleted global class with ID ${ classId }` };
			}
			throw new Error( 'error deleting class' );
		}

		let currentAction = action;
		for await ( const [ state, { props, customCss } ] of Object.entries( convertedByState ) ) {
			switch ( currentAction ) {
				case 'create':
					const newClassId = await attemptCreate( {
						props,
						customCss,
						className: globalClassName,
						stylesProvider: globalClassesStylesProvider,
						breakpoint: breakpointValue as BreakpointId,
						state: state as StyleDefinitionState,
					} );
					if ( newClassId && currentAction === 'create' ) {
						currentAction = 'modify';
						classId = newClassId;
						result = {
							status: 'ok',
							message: `created global class with ID ${ newClassId }`,
						};
						globalClassesStylesProvider.actions.tracking?.( {
							event: 'classCreated',
							executedBy: 'mcp_tool',
							classId: newClassId,
						} );
					} else {
						throw new Error( 'error creating class' );
					}
					break;
				case 'modify':
					const updated = await attemptUpdate( {
						classId,
						props,
						customCss,
						stylesProvider: globalClassesStylesProvider,
						breakpoint: breakpointValue as BreakpointId,
						state: state as StyleDefinitionState,
					} );
					if ( updated ) {
						result = { status: 'ok', classId };
					} else {
						throw new Error( 'error modifying class' );
					}
					break;
				default:
					throw new Error( `Unsupported action ${ action }` );
			}
		}
	} catch ( error ) {
		return {
			status: 'error',
			message: `${ action } failed: ${ ( error as Error ).message || 'Unknown error' }`,
		};
	}
	return result;
};

export const initManageGlobalClasses = ( reg: MCPRegistryEntry ) => {
	const { addTool } = reg;

	addTool( {
		name: 'manage-global-classes',
		requiredResources: [
			{ uri: GLOBAL_CLASSES_URI, description: 'Global classes list' },
			{ uri: BREAKPOINTS_SCHEMA_FULL_URI, description: 'Breakpoints list' },
		],
		description: `Create or modify global classes for reusable design-system styling. Class names must reflect purpose (e.g. heading-primary, button-cta). Create classes BEFORE applying them. Do NOT create classes for one-off styles.

IMPORTANT: style must contain plaintext CSS rules per state — never pass empty strings.
CSS is converted server-side in one bulk request; any declaration that cannot be converted is stored as the class custom CSS.

Example — creating a flex column class:
style.default = "display: flex; flex-direction: column; gap: 1rem;"

Example — hover state:
style.hover = "opacity: 0.85;"`,
		schema,
		outputSchema,
		handler,
	} );
};

type Opts = {
	stylesProvider: StylesProvider;
	className?: string;
	classId?: string;
	breakpoint: BreakpointId;
	props: Props;
	customCss: CustomCss | null;
	state: StyleDefinitionState;
};

async function attemptCreate( opts: Opts ) {
	const { props, customCss, breakpoint, className, stylesProvider, state } = opts;
	const { create, delete: deleteClass } = stylesProvider.actions;
	if ( ! className ) {
		throw new Error( 'Global class name is a required for creation' );
	}
	if ( ! create || ! deleteClass ) {
		throw new Error( 'User is unable to create global classes' );
	}
	const newClassId = create( className, [
		{
			meta: {
				breakpoint,
				state: ( state as string ) === 'default' ? null : state,
			},
			custom_css: customCss,
			props,
		},
	] );
	try {
		await saveGlobalClasses( { context: 'frontend' } );
		return newClassId;
	} catch {
		deleteClass( newClassId );
		throw new Error( 'error creating class' );
	}
}

async function attemptUpdate( opts: Opts ) {
	const { props, customCss, breakpoint, classId, stylesProvider, state } = opts;
	const { updateProps, update } = stylesProvider.actions;
	if ( ! classId ) {
		throw new Error( 'Class ID is required for modification' );
	}
	if ( ! updateProps || ! update ) {
		throw new Error( 'User is unable to update global classes' );
	}
	await loadExistingClasses( [ classId ] );
	const snapshot = structuredClone( stylesProvider.actions.all() );
	try {
		updateProps( {
			id: classId,
			props,
			custom_css: customCss,
			meta: {
				breakpoint,
				state: ( state as string ) === 'default' ? null : state,
			},
		} );
		await saveGlobalClasses( { context: 'frontend' } );
		return true;
	} catch {
		snapshot.forEach( ( style ) => {
			update( {
				id: style.id,
				variants: style.variants,
			} );
		} );
		await saveGlobalClasses( { context: 'frontend' } );
		throw new Error( 'error updating class' );
	}
}

async function attemptDelete( opts: Pick< Opts, 'classId' | 'stylesProvider' > ) {
	const { classId, stylesProvider } = opts;
	const { delete: deleteClass, create } = stylesProvider.actions;
	if ( ! classId ) {
		throw new Error( 'Class ID is required for deletion' );
	}
	if ( ! deleteClass || ! create ) {
		throw new Error( 'User is unable to delete global classes' );
	}
	const snapshot = structuredClone( stylesProvider.actions.all() );
	const targetClass = snapshot.find( ( style ) => style.id === classId );
	if ( ! targetClass ) {
		throw new Error( `Class with ID "${ classId }" not found` );
	}
	deleteClass( classId );
	await saveGlobalClasses( { context: 'frontend' } );
	return true;
}

function collectNonEmptyStyleBlocks( style: InputSchema[ 'style' ] ): Record< string, StyleBlock > {
	const blocks: Record< string, StyleBlock > = {};
	Object.entries( style ).forEach( ( [ state, cssText ] ) => {
		if ( cssText?.trim() ) {
			blocks[ state ] = cssText.trim();
		}
	} );
	return blocks;
}

function toStoredCustomCss( customCss: string ): CustomCss | null {
	if ( ! customCss?.trim() ) {
		return null;
	}
	return { raw: btoa( customCss ) };
}
