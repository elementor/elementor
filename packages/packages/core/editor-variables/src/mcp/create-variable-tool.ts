import { getMCPByDomain } from '@elementor/editor-mcp';
import { z } from '@elementor/schema';

import { service } from '../service';

const InputSchema = {
	type: z
		.string()
		.describe( 'The type of the variable. Example values: "global-color-variable" or "global-font-variable".' ),
	label: z.string().describe( 'The label of the variable, displayed to the user' ),
	value: z.string().describe( 'The value of the variable, should correspond to the type' ),
};

const OutputSchema = {
	status: z.enum( [ 'ok', 'error' ] ).describe( 'The status of the operation' ),
	message: z.string().optional().describe( 'Optional message providing additional information about the operation' ),
};

export const initCreateVariableTool = () => {
	getMCPByDomain( 'canvas' ).addTool( {
		name: 'create-global-variable',
		schema: InputSchema,
		outputSchema: OutputSchema,
		modelPreferences: {
			intelligencePriority: 0.7,
			speedPriority: 0.7,
		},
		description: `Create a new global variable
## When to use this tool:
- When a user requests to create a new global variable in the Elementor editor.
- When you need to add a new variable to be used in the editor.

## Prequisites:
- Ensure you have the most up-to-date list of existing global variables to avoid label duplication. You can use the "list-global-variables" tool to fetch the current variables.
- Make sure when creating a new variable, the label is unique and not already in use.
- If the user does not provide a label, ask them to provide one before proceeding.
- If the user does not provide a type, ask them to provide one before proceeding.
- If the user does not provide a value, ask them to provide one before proceeding.

## Required parameters:
- type: The type of the variable. Possible values are 'global-color-variable' or 'global-font-variable'.
- label: The label of the variable, displayed to the user. Must be unique and not already in use.
- value: The value of the variable. For color variables, this should be a valid CSS color (e.g., 'rgb(255,0,0)', '#ff0000', 'red'). For font variables, this should be a valid font family (e.g., 'Arial', 'serif').

## Example tool call (JSON format):
\`\`\`json
{ "type": "global-color-variable", "label": "My Cool Color", "value": "rgb(1,2,3)" }
\`\`\`

## Example tool response (JSON format):
\`\`\`json
{ "status": "ok" }
\`\`\`

## Example to a failed tool response, which must be displayed to the end user. If the error message is not plain, attempt to find the most useful part of the message and display it.
{ "status": "error", "message": "Unsupported type 'global-kuku-variable'" }

In that case, inform the user the type is unsupported and they should try another type, perhaps consult to online documentation.
`,
		handler: async ( params ) => {
			const { type, label, value } = params;
			try {
				await service.create( { type, label, value } );
			} catch ( error ) {
				const message: string = ( error as Error ).message || 'Unknown server error';
				return {
					status: 'error',
					message: `There was an error creating the variable: ${ message }`,
				};
			}
			return { status: 'ok' };
		},
	} );
};
