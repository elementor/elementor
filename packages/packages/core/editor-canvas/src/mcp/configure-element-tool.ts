import { type MCPRegistryEntry, zodToJsonSchema } from '@elementor/editor-mcp';
import { z } from '@elementor/schema';

import { doUpdateElementProperty } from './utils/do-update-element-property';
import { getElementSchemaAsZod } from './utils/get-element-configuration-schema';

export const initConfigureElementTool = ( reg: MCPRegistryEntry ) => {
	const { addTool } = reg;

	addTool( {
		name: `get-element-configuration-schema`,
		description: `Retrieve the configuration schema of a specific element type.
		
# When to use this tool
Use this tool when you need to understand the configurable properties of a specific element type on the page.
Before using the 'configure-element' tool, when you do not already have the schema for an element type.

# IMPORTANT
Provide the exact tag name of the element type as it appears in the editor (e.g., e-button, e-heading, etc.).
`,
		schema: {
			elementType: z.string().describe( 'The type of the element to retreive the schema' ),
		},
		outputSchema: {
			schema: z.any().describe( 'The configuration schema of the element' ),
		},
		handler: async ( params ) => {
			const { elementType } = params;
			const { zodSchema } = getElementSchemaAsZod( elementType );
			const schemaObject = z
				.object( zodSchema )
				.optional()
				.describe( `Configuration schema for element type: ${ elementType }` );
			return {
				schema: zodToJsonSchema( schemaObject ),
			};
		},
	} );

	addTool( {
		name: 'configure-element',
		description: `Configure an existing element on the page, or retreiving the configuration schema of an element.

# When to use this tool
Use this tool when you need to change the configuration of an existing element on the page, or when you need to retreive the configuration schema of an element.
You can use multiple property changes at once by providing multiple entries in the propertiesToChange object.

# IMPORTANT
Before making a change to an element, make sure you have the configuration schema, you can use the 'get-element-configuration-schema' tool to retreive the schema if not present.
`,
		schema: {
			propertiesToChange: z
				.record( z.string().describe( 'The property name' ), z.any().describe( "The property's value" ) )
				.describe( 'An object containing property names and their new values to be set on the element' ),
			elementType: z.string().describe( 'The type of the element to retreive the schema' ),
			elementId: z.string().describe( 'The unique id of the element to configure' ),
		},
		outputSchema: {
			success: z
				.boolean()
				.optional()
				.describe(
					'Whether the configuration change was successful, only if propertyName and propertyValue are provided'
				)
				.optional(),
		},
		handler: async ( params ) => {
			const { elementId, propertiesToChange, elementType } = params;
			const toUpdate = Object.entries( propertiesToChange );
			for await ( const [ propertyName, propertyValue ] of toUpdate ) {
				if ( ! propertyName && ! elementId && ! elementType ) {
					throw new Error(
						'propertyName, elementId, elementType are required to configure an element. If you want to retreive the schema, use the get-element-configuration-schema tool.'
					);
				}

				doUpdateElementProperty( {
					elementId,
					elementType,
					propertyName,
					propertyValue,
				} );
			}
			return {
				success: true,
			};
		},
	} );
};
