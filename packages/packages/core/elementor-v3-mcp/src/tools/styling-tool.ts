import { z } from '@elementor/schema';
import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SamplingMessageSchema } from '@modelcontextprotocol/sdk/types.js';

import type { McpToolResult } from '../types';
import { getElementor } from '../utils';

export function addStylingTool( server: McpServer ): void {
	server.registerTool(
		'styling',
		{
			description: `This tool provides AI-powered custom CSS styling for Elementor elements. Use this when users want advanced styling that goes beyond Elementor capabilities and can't be targeted using the element settings.

**When to use this tool:**
- Visual effects: shadows, filters, pseudo-elements, advanced selectors
- Complex animations with custom keyframes or CSS transitions
- Styling that requires media queries or complex CSS rules
- Click-triggered effects or other non-motion triggers
- Custom hover effects that don't involve motion (color changes, opacity, etc.)

**When NOT to use this tool:**
- Basic styling achievable through Elementor settings (colors, typography, spacing, borders, simple hover effects) -> use the elementor__elements with "update-settings" action.

**Do NOT use this tool if the user mentions motion effects with supported triggers:**
- "on hover" with motion (movement, rotation, scaling) → use motion-effects tool
- "on scroll" with motion effects → use motion-effects tool  
- "mouse move" / "follow mouse" → use motion-effects tool
- "entrance" / "fade in" / "slide in" animations → use motion-effects tool

**Actions available:**
- **custom-css**: Generate and apply AI-powered custom CSS to elements

This tool generates CSS code using AI, provides preview functionality, and handles user approval workflow for applying custom styles.`,
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
