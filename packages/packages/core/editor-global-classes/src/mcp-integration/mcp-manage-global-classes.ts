import { BREAKPOINTS_SCHEMA_URI, STYLE_SCHEMA_URI } from '@elementor/editor-canvas';
import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { type Props, Schema } from '@elementor/editor-props';
import { type BreakpointId } from '@elementor/editor-responsive';
import { getStylesSchema, type StyleDefinitionState } from '@elementor/editor-styles';
import { type StylesProvider } from '@elementor/editor-styles-repository';
import { type Utils as IUtils } from '@elementor/editor-variables';
import { z } from '@elementor/schema';

import { globalClassesStylesProvider } from '../global-classes-styles-provider';
import { saveGlobalClasses } from '../save-global-classes';
import { GLOBAL_CLASSES_URI } from './classes-resource';

// TODO: see https://elementor.atlassian.net/browse/ED-22513 for better cross-module access
type XElementor = z.infer< z.ZodAny >;

const schema = {
	action: z.enum( [ 'create', 'modify', 'delete' ] ).describe( 'Operation to perform' ),
	classId: z
		.string()
		.optional()
		.describe( 'Global class ID (required for modify). Get from elementor://global-classes resource.' ),
	globalClassName: z.string().optional().describe( 'Global class name (required for create)' ),
	props: z.object( {
		default: z
			.record( z.any() )
			.describe(
				'key-value of style-schema PropValues. Available properties at dynamic resource "elementor://styles/schema/{property-name}"'
			),
		hover: z
			.record( z.any() )
			.describe( 'key-value of style-schema PropValues, for :hover css state. optional' )
			.optional(),
		focus: z
			.record( z.any() )
			.describe( 'key-value of style-schema PropValues, for :focus css state. optional' )
			.optional(),
		active: z
			.record( z.any() )
			.describe( 'key-value of style-schema PropValues, for :active css state. optional' )
			.optional(),
	} ),
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

const handler = async ( input: InputSchema ): Promise< OutputSchema > => {
	const { action, classId: rawClassId, globalClassName, props: rawProps, breakpoint } = input;
	const propsWithStates = rawProps as unknown as Record< NonNullable< StyleDefinitionState >, Props >;
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

	const errors: string[] = [];
	const stylesSchema = getStylesSchema();
	const validProps = Object.keys( stylesSchema );
	Object.values( propsWithStates ).forEach( ( props ) => {
		Object.keys( props ).forEach( ( key ) => {
			const propType = stylesSchema[ key ];
			if ( ! propType ) {
				errors.push( `Property "${ key }" does not exist in styles schema.` );
				return;
			}
			const { valid, jsonSchema } = Schema.validatePropValue( propType, props[ key ] );
			if ( ! valid ) {
				errors.push( `- Property "${ key }" has invalid value\n  Expected schema: ${ jsonSchema }\n` );
			}
		} );
	} );

	if ( errors.length > 0 ) {
		return {
			status: 'error',
			message: `Validation errors:\n${ errors.join( '\n' ) }\nAvailable Properties: ${ validProps.join(
				', '
			) }\nUpdate your input and try again.`,
		};
	}

	// TODO: see https://elementor.atlassian.net/browse/ED-22513 for better cross-module access
	const Utils = ( ( ( window as XElementor ).elementorV2 as XElementor ).editorVariables as XElementor )
		.Utils as typeof IUtils;
	Object.values( propsWithStates ).forEach( ( props ) => {
		Object.keys( props ).forEach( ( key ) => {
			props[ key ] = Schema.adjustLlmPropValueSchema( props[ key ], {
				transformers: Utils.globalVariablesLLMResolvers,
			} );
		} );
	} );

	const breakpointValue = breakpoint ?? 'desktop';
	let result = {
		status: 'error',
		classId: '',
		message: 'unknown error',
	} as { status: 'error' | 'ok'; message?: string; classId?: string };

	try {
		let currentAction = action;
		for await ( const [ state, props ] of Object.entries( propsWithStates ) ) {
			switch ( currentAction ) {
				case 'create':
					const newClassId = await attemptCreate( {
						props,
						className: globalClassName,
						stylesProvider: globalClassesStylesProvider,
						breakpoint: breakpointValue as BreakpointId,
						state: state as StyleDefinitionState,
					} );
					if ( newClassId && currentAction === 'create' ) {
						// NOTE: for multiple iterations as the state changes, the next execution would be update an existing class
						currentAction = 'modify';
						classId = newClassId;
					}
					result = newClassId
						? {
								status: 'ok',
								message: `created global class with ID ${ newClassId }`,
						  }
						: {
								status: 'error',
								message: 'error creating class',
						  };
					break;
				case 'modify':
					const updated = await attemptUpdate( {
						classId,
						props,
						stylesProvider: globalClassesStylesProvider,
						breakpoint: breakpointValue as BreakpointId,
						state: state as StyleDefinitionState,
					} );
					result = updated
						? { status: 'ok', classId }
						: {
								status: 'error',
								message: 'error modifying class',
						  };
					break;
				case 'delete':
					const deleted = await attemptDelete( {
						classId,
						stylesProvider: globalClassesStylesProvider,
					} );
					result = deleted
						? { status: 'ok', message: `deleted global class with ID ${ classId }` }
						: {
								status: 'error',
								message: 'error deleting class',
						  };
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
			{ uri: STYLE_SCHEMA_URI, description: 'Style schema resources' },
			{ uri: BREAKPOINTS_SCHEMA_URI, description: 'Breakpoints list' },
		],
		modelPreferences: {
			intelligencePriority: 0.85,
			speedPriority: 0.6,
		},
		description: `Manages global classes (create/modify) in Elementor editor. Check [elementor://global-classes] and style schemas first.

CREATE: Requires globalClassName, props. Use semantic naming (heading-primary, button-cta, text-muted). Check existing classes to avoid duplicates. ALWAYS create global classes BEFORE compositions for reusable styles.
MODIFY: Requires classId, props. Get classId from [elementor://global-classes] resource.

Naming pattern: [element-type]-[purpose/variant]-[modifier]
DO NOT create global classes for: one-off styles, layout-specific properties.

Use style schema at [elementor://styles/schema/{category}] for valid props. Errors include exact schema mismatch details.`,
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
	state: StyleDefinitionState;
};

async function attemptCreate( opts: Opts ) {
	const { props, breakpoint, className, stylesProvider, state } = opts;
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
			custom_css: null,
			props,
		},
	] );
	try {
		await saveGlobalClasses( { context: 'frontend' } );
		return newClassId;
	} catch {
		deleteClass( newClassId );
		return null;
	}
}

async function attemptUpdate( opts: Opts ) {
	const { props, breakpoint, classId, stylesProvider, state } = opts;
	const { updateProps, update } = stylesProvider.actions;
	if ( ! classId ) {
		throw new Error( 'Class ID is required for modification' );
	}
	if ( ! updateProps || ! update ) {
		throw new Error( 'User is unable to update global classes' );
	}
	const snapshot = structuredClone( stylesProvider.actions.all() );
	try {
		updateProps( {
			id: classId,
			props,
			meta: {
				breakpoint,
				state,
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
		return false;
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
	try {
		deleteClass( classId );
		await saveGlobalClasses( { context: 'frontend' } );
		return true;
	} catch {
		return false;
	}
}
