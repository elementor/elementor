import { STYLE_SCHEMA_URI } from '@elementor/editor-canvas';
import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { GLOBAL_VARIABLES_URI, service } from '@elementor/editor-variables';
import { z } from '@elementor/schema';

import { GLOBAL_CLASSES_URI } from '../classes-resource';
import { handler, inputSchema as globalClassInputSchema } from '../mcp-create-global-class';

export const initDesignSystemTool = ( reg: MCPRegistryEntry ) => {
	const { addTool } = reg;

	const schema = {
		globalVariables: z
			.array(
				z.object( {
					variableName: z.string().describe( 'The name of the global variable.' ),
					variableType: z
						.enum( [ 'global-color-variable', 'global-font-variable' ] )
						.describe( 'The type of the global variable.' ),
					value: z
						.string()
						.describe(
							'The value of the global variable. For colors, use css applicable format. For fonts, use the font family name.'
						),
				} )
			)
			.default( [] ),
		globalClasses: z.array( z.object( globalClassInputSchema ) ).default( [] ),
	};

	addTool( {
		name: 'design-system',
		requiredResources: [
			{ uri: STYLE_SCHEMA_URI, description: 'Style schema template resource' },
			{ uri: GLOBAL_CLASSES_URI, description: 'Global classes list' },
			{ uri: GLOBAL_VARIABLES_URI, description: 'Global variables list' },
		],
		description: `Manages or Creates a comprehensive design system based on user requirements.
# CRITICAL PRE-REQUISITES:
- Must read the style schema at dynamic resource list ${ STYLE_SCHEMA_URI } to understand the valid properties and values that can be assigned to global classes and variables.
- Must get the existing global classes from always up-to-date resource ${ GLOBAL_CLASSES_URI } to avoid duplication when creating new global classes.
- Must get the existing global variables from always up-to-date resource 'elementor://global-variables' to avoid duplication when creating new global variables.

# IMPORTANT
- DO NOT create variables if already existing variables can be re-used.
- DO NOT create global classes if already existing global classes can be re-used.

# When to use this tool:
- When a user requests to create or manage a design system for their website.
- When you need to generate a cohesive set of design tokens, styles, and global classes.

# When NOT to use this tool:
- For simple style adjustments or individual component styling, use the appropriate styling tools instead.
- For modifications or creations of small amount of global classes, use the "create-global-class" or "modify-global-class" tools instead.
- When you need to create or modify global variables only, use the "create-global-variable" or "modify-global-variable" tools instead.

# Parameters:
- \`globalClasses\` (array, optional): A list of global classes to be created or updated. Each class should include a name and a set of style-schema PropValues.
- \`globalVariables\` (array, optional): A list of global variables to be created or updated. Each variable should include a name, type, and value.

# You Goal
Every design system has a set of global variables and global classes.
Your goal is to make sure the user has enough global classes to re-use across the site, and that the global variables are defined to support these classes.
Most sites would need classes for:
- Headings (at least 3 levels)
- Texts (default, emphasis, info, etc).
- Buttons (primary, secondary, etc).
- Containers (cards, sections, etc).
- Banners (important messages, alerts, etc).
- Hero sections (main site intro, etc).

Global Classes SHOULD HAVE meaningful names that reflect their purpose and usage.
Global Classes SHOULD HAVE PROPERTIES / custom CSS that support their intended design and functionality.

DO NOT PROVIDE EMPTY OBJECTS

Example partial design system input:
\`\`\`json
{
  "globalVariables": [{variableName: 'secondary-text', variableType: 'global-color-variable', value: '#666666'}],
  "globalClasses": [
    {
      "globalClassName": "info-text",
      "props": {
        "background": {
          "$$type": "background",
          "value": {
            "color": {
              "$$type": "global-color-variable",
              "value": "secondary-text"
            }
          }
        }
      }
  } ]
}
\`\`\`

You are encouraged to create even more if required to cover user requirements.
Before you create any class, make sure there is not already an existing class that supports the same purpose, by checking the resource at uri elementor://global-classes

Before creating global variables, read the list, in many cases there are already existing variables that can be re-used. The list is available at resource uri elementor://global-variables
`,
		schema,
		handler: async ( params ) => {
			const { globalClasses, globalVariables } = params;
			for ( const globalVariable of globalVariables ) {
				const { variableName, variableType, value } = globalVariable;
				service.create( {
					label: variableName,
					type: variableType,
					value,
				} );
			}
			for ( const globalClass of globalClasses ) {
				await handler( globalClass );
			}
			return 'done';
		},
	} );
};
