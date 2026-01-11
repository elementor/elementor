import { BREAKPOINTS_SCHEMA_URI, STYLE_SCHEMA_URI } from '@elementor/editor-canvas';
import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { Schema } from '@elementor/editor-props';
import { type BreakpointId } from '@elementor/editor-responsive';
import { getStylesSchema } from '@elementor/editor-styles';
import { Utils } from '@elementor/editor-variables';
import { z } from '@elementor/schema';

import { globalClassesStylesProvider } from '../global-classes-styles-provider';
import { saveGlobalClasses } from '../save-global-classes';
import { GLOBAL_CLASSES_URI } from './classes-resource';

const schema = {
	action: z.enum( [ 'create', 'modify' ] ).describe( 'Operation to perform' ),
	classId: z
		.string()
		.optional()
		.describe( 'Global class ID (required for modify). Get from elementor://global-classes resource.' ),
	globalClassName: z.string().optional().describe( 'Global class name (required for create)' ),
	props: z
		.record( z.any() )
		.describe(
			'key-value of style-schema PropValues. Available properties at dynamic resource "elementor://styles/schema/{property-name}"'
		),
	breakpoint: z
		.nullable(
			z
				.enum( [ 'desktop', 'tablet', 'mobile', 'laptop', 'widescreen', 'tablet_extra', 'mobile_extra' ] )
				.describe( 'Responsive breakpoint name for styles. Defaults to desktop (null).' )
		)
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
	const { action, classId, globalClassName, props, breakpoint } = input;

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

	if ( errors.length > 0 ) {
		return {
			status: 'error',
			message: `Validation errors:\n${ errors.join( '\n' ) }\nAvailable Properties: ${ validProps.join(
				', '
			) }\nUpdate your input and try again.`,
		};
	}

	Object.keys( props ).forEach( ( key ) => {
		props[ key ] = Schema.adjustLlmPropValueSchema( props[ key ], {
			transformers: Utils.globalVariablesLLMResolvers,
		} );
	} );

	const customCss = null;
	const breakpointValue = breakpoint === null ? 'desktop' : breakpoint;

	try {
		if ( action === 'create' ) {
			if ( ! globalClassName ) {
				throw new Error( 'Global class name is required for creation.' );
			}
			const newClassId = create( globalClassName, [
				{
					meta: {
						breakpoint: breakpointValue as BreakpointId,
						state: null,
					},
					custom_css: customCss,
					props,
				},
			] );

			try {
				await saveGlobalClasses( { context: 'frontend' } );
				return { status: 'ok', classId: newClassId };
			} catch {
				deleteClass( newClassId );
				await saveGlobalClasses( { context: 'frontend' } );
				return {
					status: 'error',
					message: 'Failed to create global class, probably invalid schema values.',
				};
			}
		} else {
			if ( ! classId ) {
				throw new Error( 'Class ID is required for modification.' );
			}
			const snapshot = structuredClone( globalClassesStylesProvider.actions.all() );

			try {
				update( {
					id: classId,
					variants: [
						{
							custom_css: customCss,
							props,
							meta: {
								breakpoint: breakpointValue as BreakpointId,
								state: null,
							},
						},
					],
				} );
				await saveGlobalClasses( { context: 'frontend' } );
				return { status: 'ok', classId };
			} catch ( modifyError ) {
				snapshot.forEach( ( style ) => {
					update( {
						id: style.id,
						variants: style.variants,
					} );
				} );
				await saveGlobalClasses( { context: 'frontend' } );
				return {
					status: 'error',
					message: `Failed to modify global class: ${ ( modifyError as Error ).message }`,
				};
			}
		}
	} catch ( error ) {
		return {
			status: 'error',
			message: `${ action } failed: ${ ( error as Error ).message || 'Unknown error' }`,
		};
	}
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
