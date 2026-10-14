import { z } from '@elementor/schema';
import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { V3_DESCRIPTION_URI } from '../mcp-description-resource';
import type { McpToolResult } from '../types';
import { get$e } from '../utils';

export function addAiTool( server: McpServer ): void {
	server.registerTool(
		'ai',
		{
			description: 'Manage Elementor AI integration features and interfaces.',
			inputSchema: {
				action: z
					.enum( [ 'open-brand-voice', 'open-choose-element', 'open-text-to-elementor' ] )
					.describe( 'The AI operation to perform' ),
			},
			annotations: {
				title: 'Manage AI Integration',
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
				case 'open-brand-voice':
					return await handleOpenBrandVoice();
				case 'open-choose-element':
					return await handleOpenChooseElement();
				case 'open-text-to-elementor':
					return await handleOpenTextToElementor();
				default:
					throw new Error( `Unknown action: ${ params.action }` );
			}
		}
	);
}

async function handleOpenBrandVoice(): Promise< McpToolResult > {
	await get$e()?.run( 'ai-integration/open-brand-voice' );

	return {
		content: [ { type: 'text', text: 'Brand Voice interface opened.' } ],
	};
}

async function handleOpenChooseElement(): Promise< McpToolResult > {
	await get$e()?.run( 'ai-integration/open-choose-element' );

	return {
		content: [ { type: 'text', text: 'Choose Element interface opened.' } ],
	};
}

async function handleOpenTextToElementor(): Promise< McpToolResult > {
	await get$e()?.run( 'ai-integration/open-text-to-elementor' );

	return {
		content: [ { type: 'text', text: 'Text to Elementor interface opened.' } ],
	};
}
