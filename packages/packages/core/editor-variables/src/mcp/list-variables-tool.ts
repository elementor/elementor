import { getMCPByDomain } from '@elementor/editor-mcp';
import { z } from '@elementor/schema';

import { service } from '../service';
import { type TVariable } from '../storage';

const VariableSchema = {
	type: z.string().describe( 'The type of the variable.' ),
	label: z.string().describe( 'The label of the variable, displayed to the user' ),
	value: z.string().describe( 'The value of the variable.' ),
	id: z
		.string()
		.describe(
			'The unique identifier of the variable. Used for internal reference, not to be exposed to end users'
		),
};
const VariableListSchema = {
	variables: z.array( z.object( VariableSchema ) ).describe( 'List of variables' ),
};

export const initListVariablesTool = () => {
	getMCPByDomain( 'variables' ).addTool( {
		name: 'list-global-variables',
		description: `List the global variables

  ## When to use this tool:
  - When a user requests to see all available global variables in the Elementor editor.
  - When you need to be exact on a variable label, to avoid any mistakes.
  - When you want to see the most up-to-date list of global variables.
  - Before using any other variables related tools that makes changes, such as deletion, creation, or updates. This ensures you have the latest information and there is no naming collision or mismatching.

  ## Example tool response (JSON format):
  \`\`\`json
  { variables: [
   { type: 'global-color-variable', label: 'Cool', value: 'rgb(1,2,3)', id: 'some-unique-id' },
   { type: 'global-font-variable', label: 'Headline', value: 'serif', id: 'some-other-unique-id' },
  ] }
  \`\`\`

  Once you get the response, please display the variables in a user-friendly way, unless explicitly requested otherwise.
  Unless explicitly requested otherwise, response in HTML Format, prefer to use tables or unordered lists.

  Note: **The label is most improtant to be seen as-is without any changes.**

  <important>
  **Do not omit the label**. This is important for the user to identify the variable.
  **Do not change the label**, it must be displayed exactly as it is, in it's original characters as received from this tool.
  </important>
  `,
		outputSchema: VariableListSchema,
		modelPreferences: {
			intelligencePriority: 0.5,
			speedPriority: 0.95,
		},
		handler: async () => {
			const variables = service.variables() as Record< string, TVariable >;
			return {
				variables: Object.entries( variables ).map( ( [ id, varData ] ) => ( { id, ...varData } ) ),
			};
		},
	} );
};
