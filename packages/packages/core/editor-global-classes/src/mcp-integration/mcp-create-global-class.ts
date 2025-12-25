import { STYLE_SCHEMA_URI } from '@elementor/editor-canvas';
import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { Schema } from '@elementor/editor-props';
import { getStylesSchema } from '@elementor/editor-styles';
import { Utils } from '@elementor/editor-variables';
import { z } from '@elementor/schema';

import { globalClassesStylesProvider } from '../global-classes-styles-provider';
import { saveGlobalClasses } from '../save-global-classes';
import { GLOBAL_CLASSES_URI } from './classes-resource';
import { formatWarnings, validateVariableReuse } from './validators/variable-reuse-validator';

export const inputSchema = {
	globalClassName: z.string().describe( 'The name of the global class to be created' ),
	props: z
		.record( z.any() )
		.describe(
			'key-value of style-schema PropValues applied to the global class. Available properties at dynamic resource "elementor://styles/schema/{property-name}"'
		)
		.default( {} ),
	customCss: z
		.string()
		.optional()
		.describe(
			'Additional CSS styles associated with the global class. Use only if you fail to use the schema, specifically backgrounds'
		),
	breakpoint: z
		.nullable(
			z
				.enum( [ 'desktop', 'tablet', 'mobile', 'laptop', 'widescreen', 'tablet_extra', 'mobile_extra' ] )
				.describe( 'The responsive breakpoint name for which the global class styles should be applied' )
		)
		.default( null )
		.describe( 'The responsive breakpoint name for which the global class styles should be applied' ),
	justification: z
		.string()
		.optional()
		.describe(
			'Required when hardcoding color/font values instead of using existing global variables. Explain why existing variables cannot be reused.'
		),
};

const outputSchema = {
	classId: z.string().describe( 'The unique identifier of the newly created global class' ),
};

type InputSchema = z.infer< ReturnType< typeof z.object< typeof inputSchema > > >;
type OutputSchema = z.infer< ReturnType< typeof z.object< typeof outputSchema > > >;

export const handler = async ( input: InputSchema ): Promise< OutputSchema > => {
	const customCss = input.customCss ? { raw: btoa( input.customCss ) } : null;
	const { delete: deleteClass, create } = globalClassesStylesProvider.actions;
	if ( ! create || ! deleteClass ) {
		throw new Error( 'Create action is not available' );
	}

	const { warnings, shouldBlock } = validateVariableReuse( input.props, input.justification );
	if ( shouldBlock ) {
		throw new Error(
			`Variable Reuse Required:\n${ formatWarnings( warnings ) }\n\n` +
				`Either:\n1. Use existing variables, OR\n2. Provide "justification" parameter\n\n` +
				`IMPORTANT: User will be notified of hardcoded values.`
		);
	}

	const errors: string[] = [];
	const stylesSchema = getStylesSchema();
	const validProps = Object.keys( stylesSchema );

	Object.keys( input.props ).forEach( ( key ) => {
		const propType = getStylesSchema()[ key ];
		if ( ! propType ) {
			errors.push( `Property "${ key }" does not exist in styles schema.` );
			return;
		}
		const { valid, jsonSchema } = Schema.validatePropValue( propType, input.props[ key ] );
		if ( ! valid ) {
			errors.push(
				`- Property "${ key }" has invalid value\n  Exact schema: \`\`\`json\n${ jsonSchema }\`\`\`\n`
			);
		}
	} );
	if ( errors.length > 0 ) {
		throw new Error(
			`Errors:\n${ errors.join( '\n' ) }\nAvailable Properties: ${ validProps.join(
				', '
			) }\nNow that you have this information, update your input and try again`
		);
	}
	Object.keys( input.props ).forEach( ( key ) => {
		input.props[ key ] = Schema.adjustLlmPropValueSchema( input.props[ key ], {
			transformers: Utils.globalVariablesLLMResolvers,
		} );
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
		requiredResources: [
			{ uri: GLOBAL_CLASSES_URI, description: 'Global classes list' },
			{ uri: STYLE_SCHEMA_URI, description: 'Style schema resources' },
		],
		modelPreferences: {
			intelligencePriority: 0.85,
			speedPriority: 0.6,
		},
		description: `Create a new global class within the Elementor editor, allowing users to define reusable styles and properties for consistent design across their website.
      
# Prequisites: CRITICAL
- Read the style schema at [elementor://styles/schema/{category}] to understand the valid properties and values that can be assigned to the global class.
- Available style properties can be found in the styles schema dynamic resources available from 'canvas' mcp. List the resources to see all available properties.
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

# Next steps:
If failed, read the error message carefully, it includes the exact schema that caused the failure for each invalid property.
Now that you have this information, update your input and try again.

\`\`\`
`,
		name: 'create-global-class',
		schema: inputSchema,
		outputSchema,
		handler,
	} );
};
