import { createSampler, type MCPRegistryEntry } from '@elementor/editor-mcp';
import { z } from '@elementor/schema';

export const initDesignSystemTool = ( reg: MCPRegistryEntry ) => {
	const { addTool, getActiveChatInfo } = reg;

	const schema = {
		userRequirments: z.string().describe( 'The user requirements for the design system to be created.' ),
		additionalIfnromation: z
			.array( z.string() )
			.default( [] )
			.describe( 'Any additional information to consider when creating the design system.' ),
	};

	addTool( {
		name: 'design-system',
		description: `Manages or Creates a comprehensive design system based on user requirements.
# When to use this tool:
- When a user requests to create or manage a design system for their website.
- When you need to generate a cohesive set of design tokens, styles, and components based on specific requirements.

# When NOT to use this tool:
- For simple style adjustments or individual component styling, use the appropriate styling tools instead.
- For modifications or creations of small amount of global classes, use the "create-global-class" or "modify-global-class" tools instead.
`,
		schema,
		outputSchema: {
			llmInstructions: z
				.string()
				.describe(
					'The instructions generated for the LLM to create the design system. Perform the tasks as described'
				),
		},
		handler: async ( params, reqHandler ) => {
			const { userRequirments, additionalIfnromation } = params;
			const sampler = createSampler( reqHandler, {} );

			const result = await sampler( {
				requestParams: {
					chatId: getActiveChatInfo()?.sessionId,
				},
				messages: [
					{
						role: 'assistant',
						content: {
							type: 'text',
							text: `You are a design system expert.
Your task is to create a comprehensive design system based on user requirements.
The design system should include color palettes, typography, spacing, and component styles that align with the provided requirements.

Once you provide the user requirements, it will be sent to another tool that will plan what should be done.
Once you get the response, you should ACT AND EXECUTE tools in order to achieve the design system creation.
`,
						},
					},
					{ role: 'user', content: { type: 'text', text: userRequirments } },
					{
						role: 'assistant',
						content: {
							type: 'text',
							text: `Additional information: ${ additionalIfnromation.join( '\n' ) }`,
						},
					},
				],
			} );

			return {
				llmInstructions: parseResult( result.content ),
			};

			// await reqHandler.sendRequest(
			// 	{
			// 		method: 'elicitation/create',
			// 		params: {
			// 			requestedSchema: { type: 'object', properties: { info: { type: 'string' } } },
			// 			message: parseResult( result ),
			// 		},
			// 	},
			// 	// @ts-ignore
			// 	z.object( {} )
			// );
			// return {
			// 	llmInstructions: parseResult( result ),
			// };
		},
	} );
};

function parseResult( result: { content: unknown } ) {
	try {
		const content = JSON.parse( result.content as string );
		if ( typeof content === 'string' ) {
			return content;
		} else if ( typeof content === 'object' ) {
			return content.content || JSON.stringify( content );
		}
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch ( err ) {
		return JSON.stringify( result );
	}
}
