import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { Schema } from '@elementor/editor-props';
import { getStylesSchema, isExistingStyleProperty } from '@elementor/editor-styles';
import { z } from '@elementor/schema';

import { globalClassesStylesProvider } from '../global-classes-styles-provider';
import { saveGlobalClasses } from '../save-global-classes';

const inputSchema = {
	globalClassName: z.string().describe( 'The name of the global class to be created' ),
	// customCss: z.string().describe( 'The CSS styles associated with the global class' ).optional(),
	props: z
		.record( z.any() )
		.describe(
			'key-value of style-schema PropValues applied to the global class. Available properties at dynamic resource "elementor://styles/schema/{property-name}"'
		),
	breakpoint: z
		.nullable(
			z
				.enum( [ 'desktop', 'tablet', 'mobile', 'laptop', 'widescreen', 'tablet_extra', 'mobile_extra' ] )
				.describe( 'The responsive breakpoint name for which the global class styles should be applied' )
		)
		.default( null )
		.describe( 'The responsive breakpoint name for which the global class styles should be applied' ),
};

const outputSchema = {
	classId: z.string().describe( 'The unique identifier of the newly created global class' ),
};

type InputSchema = z.infer< ReturnType< typeof z.object< typeof inputSchema > > >;
type OutputSchema = z.infer< ReturnType< typeof z.object< typeof outputSchema > > >;

const handler = async ( input: InputSchema ): Promise< OutputSchema > => {
	const customCss = null; // input.customCss ? { raw: input.customCss } : null;
	const { delete: deleteClass, create } = globalClassesStylesProvider.actions;
	if ( ! create || ! deleteClass ) {
		throw new Error( 'Create action is not available' );
	}
	const validProps = Object.keys( getStylesSchema() );
	const invalidProps = Object.keys( input.props ).filter( ( key ) => ! isExistingStyleProperty( key ) );
	if ( invalidProps.length > 0 ) {
		throw new Error( `Invalid props provided: ${ invalidProps.join( ', ' ) }.
Available Properties: ${ validProps.join( ', ' ) }.
Read [elementor://styles/schema/{property}] resource for it's schema.
Now that you have this information, update your input and try again` );
	}
	Object.keys( input.props ).forEach( ( key ) => {
		input.props[ key ] = Schema.adjustLlmPropValueSchema( input.props[ key ] );
	} );
	const classId = create( input.globalClassName, [
		{
			meta: {
				breakpoint: input.breakpoint === null ? 'desktop' : input.breakpoint,
				state: null,
			},
			custom_css: customCss,
			props: input.props,
		},
	] );
	try {
		await saveGlobalClasses( { context: 'frontend' } );
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch ( err ) {
		deleteClass( classId );
		await saveGlobalClasses( { context: 'frontend' } );
		throw new Error( `Failed to create global class, probably invalid schema values.` );
	}
	return {
		classId,
	};
};

export const initCreateGlobalClass = ( reg: MCPRegistryEntry ) => {
	const { addTool } = reg;

	addTool( {
		description: `Create a new global class within the Elementor editor, allowing users to define reusable styles and properties for consistent design across their website.
      
# Prequisites: CRITICAL
- Read the style schema at [elementor://styles/schema/{category}] to understand the valid properties and values that can be assigned to the global class.
- YOU MUST USE THE STYLE SCHEMA TO BUILD THE "props" PARAMETER CORRECTLY, OTHERWISE THE GLOBAL CLASS CREATION WILL FAIL.
- Ensure that the global class name provided does not already exist to avoid duplication.
- Read the styles schema resource available from 'canvas' mcp to understand the valid properties and values that can be assigned to the global class.

## Parameters:
- \`globalClassName\` (string, required): The name of the global class to be created.
- \`props\` (object, required): A key-value map of style-schema PropValues that define the styles for the global class.
- \`breakpoint\` (string | null, optional): The responsive breakpoint for which the styles should be applied. If null, styles apply to all breakpoints.

## Example usage:
\`\`\`json
{
  "globalClassName": "my-new-class",
  "props": {
    "color": {
      "$$type": "color",
      "value": "#ff0000"
    },
    "fontSize": {
      "$$type": "size",
      "value": {
        "size": {
          "$$type": "number",
          "value": 2.5
        },
        "unit": {
          "$$type": "string",
          "value": "em"
        }
      }
    }
  },
  "breakpoint": "desktop"
}
\`\`\`
`,
		name: 'create-global-class',
		schema: inputSchema,
		outputSchema,
		handler,
	} );
};
