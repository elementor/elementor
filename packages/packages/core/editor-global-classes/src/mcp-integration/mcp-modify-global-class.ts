import { BREAKPOINTS_SCHEMA_URI } from '@elementor/editor-canvas';
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
	classId: z.string().describe( 'The ID of the global class to modify' ),
	props: z
		.record( z.any() )
		.describe(
			'key-value of style-schema PropValues to update the global class with. Available properties at dynamic resource "elementor://styles/schema/{property-name}"'
		),
	breakpoint: z
		.nullable( z.string() )
		.default( null )
		.describe( 'The responsive breakpoint name for which the global class styles should be applied' ),
	customCss: z.string().optional().describe( 'The CSS styles associated with the global class.' ),
};

const handler = async ( params: z.infer< ReturnType< typeof z.object< typeof schema > > > ) => {
	const { classId, props } = params;
	const customCss = params.customCss ? { raw: btoa( params.customCss ) } : null;
	const { update, delete: deleteClass } = globalClassesStylesProvider.actions;
	if ( ! update || ! deleteClass ) {
		throw new Error( 'Update action is not available' );
	}
	const errors: string[] = [];
	const validProps = Object.keys( getStylesSchema() );
	Object.keys( props ).forEach( ( key ) => {
		const propType = getStylesSchema()[ key ];
		if ( ! propType ) {
			errors.push( `Property "${ key }" does not exist in styles schema.` );
			return;
		}
		const { valid, jsonSchema } = Schema.validatePropValue( propType, props[ key ] );
		if ( ! valid ) {
			errors.push( `- Property "${ key }" has invalid value:\n  expected Schema: ${ jsonSchema }\n` );
		}
	} );
	if ( errors.length > 0 ) {
		throw new Error(
			`Errors:\n${ errors.join( '\n' ) }\nAvailable Properties: ${ validProps.join(
				', '
			) }\nNow that you have this information, update your input and try again`
		);
	}
	Object.keys( props ).forEach( ( key ) => {
		props[ key ] = Schema.adjustLlmPropValueSchema( props[ key ], {
			transformers: Utils.globalVariablesLLMResolvers,
		} );
	} );
	const snapshot = structuredClone( globalClassesStylesProvider.actions.all() );
	try {
		update( {
			id: classId,
			variants: [
				{
					custom_css: customCss,
					props,
					meta: {
						breakpoint: params.breakpoint === null ? 'desktop' : ( params.breakpoint as BreakpointId ),
						state: null,
					},
				},
			],
		} );
		await saveGlobalClasses( { context: 'frontend' } );
	} catch ( error ) {
		snapshot.forEach( ( style ) => {
			update( {
				id: style.id,
				variants: style.variants,
			} );
		} );
		await saveGlobalClasses( { context: 'frontend' } );
		throw new Error( `Failed to modify global class: ${ ( error as Error ).message }` );
	}
	return 'ok';
};

export const initModifyGlobalClass = ( reg: MCPRegistryEntry ) => {
	const { addTool } = reg;

	addTool( {
		name: 'modify-global-class',
		requiredResources: [
			{
				description: 'Breakpoints list',
				uri: BREAKPOINTS_SCHEMA_URI,
			},
			{
				description: 'Global classes list',
				uri: GLOBAL_CLASSES_URI,
			},
		],
		modelPreferences: {
			hints: [ { name: 'claude-sonnet' } ],
			intelligencePriority: 0.85,
			speedPriority: 0.6,
		},
		description: `Modify an existing global class within the Elementor editor, allowing users to update styles and properties for consistent design across their website.
# CRITICAL Prequisites:
- Read the style schema at [elementor://styles/schema/{category}] to understand the valid properties and values that can be assigned to the global class.
- Ensure that the global class ID provided exists.
- Prefer style schema over custom_css

## Parameters:
- \`classId\` (string, required): The ID of the global class to be modified.
- \`props\` (object, required): A key-value map of style-schema PropValues that define the new styles for the global class.
- \`customCss\` (string, optional): The CSS styles associated with the global class.

## Example usage:
\`\`\`json
{
  "classId": "existing-class-id",
  "props": {
    "color": {
      "$$type": "color",
      "value": "#00ff00"
    },
  }
}\`\`\`
`,
		schema,
		handler,
	} );
};
