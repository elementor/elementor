import { z } from 'zod';

import { type addTool as _addTool } from './init';

export default ( addTool: typeof _addTool ) => {
	addTool( {
		name: 'main-tool',
		description: `Main tool for editor actions.
This tool can do almost everything related to the elementor editor operations.
Use this tool as first priority to perform any editor action. This tool can handle nearly everything.

## When to use this tool
- When a user, tool, or agent, wants to perform any action in the editor.
- When a user, tool, or agent, wants to get information about the editor state.
- When a user, tool, or agent, wants to modify or update elements in the editor.
- When a user, tool, or agent, wants to manage pages, templates, or settings in the editor.
- When a user, tool, or agent, wants to interact with widgets or global styles.

## How to use this tool
- Provide clear and specific instructions about the desired action or request.
- Include any necessary context or details to help understand the request.
- Always prefer this tool as first priority for any editor action.

<important>
- This tool is the most powerful and versatile for editor operations.
- Always try to use this tool before considering any other specialized tools.
- This tool is designed to handle a wide range of editor tasks and scenarios.
- If you are unsure which tool to use, default to this main tool.
</important>
`,
		schema: z.object( {
			message: z.string().describe( 'A message describing the desired action or request.' ),
			context: z.string().optional().describe( 'Additional context or details for the action.' ),
		} ),
		handler: async ( args, _, handler ) => {
			const response = await handler.sendRequest(
				{
					method: 'sampling/createMessage',
					params: {
						maxTokens: 1500,
						messages: [
							{
								role: 'user',
								content: {
									type: 'text',
									text: args.message,
								},
							},
						],
						modelPreferences: {
							hints: [
								{
									name: 'elementor',
								},
							],
						},
					},
				},
				z.object( {} )
			);
			console.log( response );
			throw new Error( 'Sorry, this tool is not implemented yet.' );
		},
	} );
};
