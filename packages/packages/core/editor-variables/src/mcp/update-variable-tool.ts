import { getMCPByDomain } from '@elementor/editor-mcp';
import { z } from '@elementor/schema';

import { service } from '../service';

export const initUpdateVariableTool = () => {
	getMCPByDomain( 'variables' ).addTool( {
		schema: {
			id: z.string().describe( 'The unique identifier of the variable to be updated or renamed.' ),
			label: z
				.string()
				.describe(
					'The label of the variable to be stored after the change. If the user only wishes to update the value, this must be strictly equal to the current label.'
				),
			value: z
				.string()
				.describe(
					"The new value for the variable. For color variables, this should be a valid CSS color (e.g., 'rgb(255,0,0)', '#ff0000', 'red'). For font variables, this should be a valid font family (e.g., 'Arial', 'serif'). If the user wishes to rename only, make sure you provide the existing value."
				),
		},
		outputSchema: {
			status: z.enum( [ 'ok', 'error' ] ).describe( 'The status of the operation' ),
			message: z
				.string()
				.optional()
				.describe( 'Optional message providing additional information about the operation' ),
		},
		name: 'update-global-variable',
		modelPreferences: {
			intelligencePriority: 0.75,
			speedPriority: 0.7,
		},
		description: `Update an existing global variable

## When to use this tool:
- When a user requests to update an existing global variable in the Elementor editor.
- When you need to modify the value of an existing variable.
- When you want to rename an existing variable (change its label).
- When you want to both rename and modify the value of an existing variable.

## Prerequisites:
- Ensure you have the most up-to-date list of existing global variables to avoid label duplication. You can use the "list-global-variables" tool to fetch the current variables.
- Make sure when updating a variable, the new label is unique and not already in use by another variable.
- Make sure you understand whether you are updating a value, renaming, or both.
- Reference the variable by the "id" property, given from the "list-global-variables" tool.
- If the user wishes to rename, make sure you have the existing value.
- If the user wishes to update the value, make sure you have to **correct label**.
- You must have the unique identifier, the current label, the current value, and the new value or label or both, before using this tool.

## Required parameters:
- id: The unique identifier of the variable to be updated or renamed.
- label: The label of the variable to be stored after the change. If the user only wishes to update the value, this must be strictly equal to the current label.
- value: The new value for the variable. For color variables, this should be a valid CSS color (e.g., 'rgb(255,0,0)', '#ff0000', 'red'). For font variables, this should be a valid font family (e.g., 'Arial', 'serif'). If the user wishes to rename only, make sure you provide the existing value.

## Example tool call (JSON format):
\`\`\`json
{ "id": "some-unique-id", "label": "Cool", "value": "rgb(0,140,250)" }
\`\`\`

## Example responses (JSON format):
Successful update:
\`\`\`json
{ "status": "ok" }
\`\`\`

Failed update, which must be displayed to the end user. If the error message is not plain, attempt to find the most useful part of the message and display it.
\`\`\`json
{ "status": "error", "message": "Label 'Cool' is already in use by another variable." }
\`\`\`
`,
		handler: async ( params ) => {
			const { id, label, value } = params;
			try {
				await service.update( id, { label, value } );
				return { status: 'ok' };
			} catch ( error ) {
				const message: string = ( error as Error ).message || 'Unknown server error';
				return {
					status: 'error',
					message: `There was an error creating the variable: ${ message }`,
				};
			}
		},
	} );
};
