import { McpServer } from '@elementor/editor-mcp';
import { z } from '@elementor/schema';
import { __ } from '@wordpress/i18n';

import { getActiveInlineTarget } from './active-inline-target';
import { applyInlineTextValue } from './apply-inline-text-value';
import { INLINE_TEXT_GENERATOR_MCP_SERVER_NAME } from './constants';

export const createInlineTextGeneratorMcpServer = () => {
	const server = new McpServer(
		{
			name: INLINE_TEXT_GENERATOR_MCP_SERVER_NAME,
			version: '1.0.0',
			title: __( 'Inline text generator', 'elementor' ),
		},
		{
			capabilities: {
				tools: {},
			},
			instructions: __(
				'Read the active inline-editing field with get_active_inline_text, then write generated HTML with apply_generated_inline_text.',
				'elementor'
			),
		}
	);

	server.registerTool(
		'get_active_inline_text',
		{
			description: __( 'Read the active inline-editing field HTML and metadata.', 'elementor' ),
			annotations: {
				readOnlyHint: true,
			},
		},
		async () => {
			const target = getActiveInlineTarget();

			if ( ! target ) {
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify( { error: 'No active inline-editing target.' } ),
						},
					],
				};
			}

			return {
				content: [
					{
						type: 'text',
						text: JSON.stringify( {
							elementId: target.elementId,
							bind: target.bind,
							html: target.html,
							source: target.source,
						} ),
					},
				],
			};
		}
	);

	server.registerTool(
		'apply_generated_inline_text',
		{
			description: __( 'Apply generated HTML to the active inline-editing field.', 'elementor' ),
			inputSchema: {
				html: z.string().describe( 'Generated HTML for the inline-editing field.' ),
			},
			annotations: {
				destructiveHint: true,
			},
		},
		async ( { html } ) => {
			const target = getActiveInlineTarget();

			if ( ! target ) {
				throw new Error( 'No active inline-editing target.' );
			}

			applyInlineTextValue( target.elementId, target.bind, html );

			return {
				content: [
					{
						type: 'text',
						text: __( 'Inline text applied successfully.', 'elementor' ),
					},
				],
			};
		}
	);

	return server;
};
