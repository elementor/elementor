import { getMCPByDomain } from '@elementor/editor-mcp';
import { z } from '@elementor/schema';

import { service } from '../service';

export const initDeleteVariableTool = () => {
	getMCPByDomain( 'canvas' ).addTool( {
		name: 'delete-global-variable',
		schema: {
			id: z.string().describe( 'The unique identifier of the variable to be deleted.' ),
		},
		outputSchema: {
			status: z.enum( [ 'ok', 'error' ] ).describe( 'The status of the operation' ),
		},
		modelPreferences: {
			intelligencePriority: 0.7,
			speedPriority: 0.8,
		},
		description: `Delete an existing global variable
    
## When to use this tool:
- When a user requests to delete an existing global variable in the Elementor editor.
- When you need to remove a variable that is no longer needed or relevant, with the user's confirmation.

## Prerequisites:
- Ensure you have the most up-to-date list of existing global variables. You can use the "list-global-variables" tool to fetch the current variables.
- Reference the variable by the "id" property, given from the "list-global-variables" tool.
- Make sure you have the unique identifier of the variable to be deleted before using this tool.
- Confirm with the user that they want to proceed with the deletion, as this action is irreversible.

<notice>
A use might reference a variable by it's label, but you must always use the unique identifier (id) to delete it.
If you only have the label, use the "list-global-variables" tool to find the corresponding id.
</notice>

<important>
This operation is destructive and cannot be undone. Ensure that the user is fully aware of the consequences before proceeding.
When a variable is deleted, all references to it in all pages accross the website will lose their effect.
</important>`,
		handler: async ( params ) => {
			const { id } = params;
			try {
				await service.delete( id );
				return { status: 'ok' };
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
			} catch ( err: unknown ) {
				return {
					status: 'error',
				};
			}
		},
		isDestructive: true,
	} );
};
