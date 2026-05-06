import { z } from '@elementor/schema';
import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SamplingMessageSchema } from '@modelcontextprotocol/sdk/types.js';

import { V3_DESCRIPTION_URI } from '../mcp-description-resource';
import type { McpToolResult } from '../types';
import { getElementor } from '../utils';

export function addStylingTool( server: McpServer ): void {
	server.registerTool(
		'styling',
		{
			description: `Apply custom CSS to legacy/V3 elements.
- Do NOT use for V4 elements — V4 has its own MCP and tools.
- Do NOT use for animations or motion — use the interactions tools.
- Do NOT use for basic styling — V3 elements support basic styling via the V3 settings tool.`,
			inputSchema: {
				action: z
					.enum( [ 'custom-css' ] )
					.describe(
						'The styling operation to perform. Currently supports custom-css for AI-generated CSS styling.'
					),
				elementId: z
					.string()
					.describe(
						'The ID of the Elementor element to apply custom styling to. This element will receive the generated CSS code.'
					),
				prompt: z
					.string()
					.describe(
						'A detailed description of the desired styling. Include specific visual requirements, colors, effects, layout modifications, or any custom styling needs. The more detailed the prompt, the better the generated CSS will match your requirements.'
					),
			},
			annotations: {
				title: 'Apply Custom Styling',
			},
			_meta: {
				'angie/requiredResources': [
					{
						uri: V3_DESCRIPTION_URI,
						whenToUse: 'Read to understand Elementor capabilities and limitations before using this tool.',
					},
				],
			},
		},
		async ( params ) => {
			switch ( params.action ) {
				case 'custom-css':
					return await handleCustomCss( params.elementId as string, params.prompt as string, server );
				default:
					throw new Error( `Unknown action: ${ params.action }` );
			}
		}
	);
}

async function handleCustomCss( elementId: string, prompt: string, server: McpServer ): Promise< McpToolResult > {
	const container = getElementor()?.getContainer( elementId );
	if ( ! container ) {
		throw new Error( `Element with ID ${ elementId } not found.` );
	}

	const htmlMarkup = container.view?.el?.outerHTML || '';

	const parseCSS = ( css: string ) => {
		return css && css.replace( /`/g, '' ).replace( /^css\s*/i, '' );
	};

	const samplingCssResult = await server.server.request(
		{
			method: 'sampling/createMessage',
			params: {
				messages: [
					{
						role: 'user',
						content: {
							type: 'text',
							text: prompt,
						},
					},
				],
				maxTokens: 1000,
				modelPreferences: {
					hints: [
						{
							name: 'elementor-css',
						},
					],
				},
				metadata: {
					element_id: elementId,
					html_markup: htmlMarkup,
				},
			},
		},
		SamplingMessageSchema
	);

	const content = samplingCssResult?.content;
	const block = Array.isArray( content ) ? content.find( ( b ) => b.type === 'text' ) : content;
	const cssText = block?.type === 'text' ? block.text : undefined;

	if ( ! cssText ) {
		throw new Error( 'Failed to generate CSS: No text content received from API.' );
	}

	const parsedCssString = parseCSS( cssText );

	return {
		content: [
			{
				type: 'text',
				text: JSON.stringify( {
					success: true,
					message: 'Custom CSS generated. The CSS needs to be applied through the editor.',
					generatedCss: parsedCssString,
					elementId,
				} ),
			},
		],
	};
}
