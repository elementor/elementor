import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { Schema } from '@elementor/editor-props';
import { isExistingStyleProperty } from '@elementor/editor-styles';
import { z } from '@elementor/schema';

import { globalClassesStylesProvider } from '../global-classes-styles-provider';
import { saveGlobalClasses } from '../save-global-classes';

const schema = {
	classId: z.string().describe( 'The ID of the global class to modify' ),
	props: z
		.record( z.any() )
		.describe(
			'key-value of style-schema PropValues to update the global class with. Available properties at dynamic resource "elementor://styles/schema/{property-name}"'
		),
	breakpoint: z
		.nullable(
			z
				.enum( [ 'desktop', 'tablet', 'mobile', 'laptop', 'widescreen', 'tablet_extra', 'mobile_extra' ] )
				.describe( 'The responsive breakpoint name for which the global class styles should be applied' )
		)
		.default( null )
		.describe( 'The responsive breakpoint name for which the global class styles should be applied' ),
	customCss: z.string().optional().describe( 'The CSS styles associated with the global class.' ),
};

const handler = async ( params: z.infer< ReturnType< typeof z.object< typeof schema > > > ) => {
	const { classId, props } = params;
	const customCss = params.customCss ? { raw: params.customCss } : null;
	const { update, delete: deleteClass } = globalClassesStylesProvider.actions;
	if ( ! update || ! deleteClass ) {
		throw new Error( 'Update action is not available' );
	}
	const invalidProps = Object.keys( props ).filter( ( key ) => ! isExistingStyleProperty( key ) );
	if ( invalidProps.length > 0 ) {
		throw new Error( `Invalid props provided: ${ invalidProps.join( ', ' ) }.
Available Properties: ${ Object.keys( props ).join( ', ' ) }.
Read [elementor://styles/schema/{property}] resource for it's schema.
Now that you have this information, update your input and try again` );
	}
	Object.keys( props ).forEach( ( key ) => {
		props[ key ] = Schema.adjustLlmPropValueSchema( props[ key ] );
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
						breakpoint: params.breakpoint === null ? 'desktop' : params.breakpoint,
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
		description: `Modify an existing global class within the Elementor editor, allowing users to update styles and properties for consistent design across their website.
# CRITICAL Prequisites:
- Read the style schema at [elementor://styles/schema/{category}] to understand the valid properties and values that can be assigned to the global class.
- YOU MUST USE THE STYLE SCHEMA TO BUILD THE "props" PARAMETER CORRECTLY, OTHERWISE THE GLOBAL CLASS MODIFICATION WILL FAIL.
- Ensure that the global class ID provided exists.
- Try to AVOID CUSTOM CSS, unless the schema failed after several retries

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
