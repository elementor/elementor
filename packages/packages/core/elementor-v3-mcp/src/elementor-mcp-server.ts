import { getAngieSdk } from '@elementor/editor-mcp';
import { waitForElementorEditor } from '@elementor/elementor-mcp-common';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { addV3DescriptionResource, V3_DESCRIPTION } from './mcp-description-resource';
import { addElementorResources } from './resources';
import { addAiTool, addDynamicTool, addPageTool, addRoutesTool, addStylingTool, addUiTool } from './tools';

const VERSION = '2.0.0';

export async function createElementorServer(): Promise< McpServer > {
	await waitForElementorEditor();

	const server = new McpServer(
		{
			name: 'elementor-server',
			version: VERSION,
			title: 'Elementor',
		},
		{
			instructions: `Controls the Elementor editor: page settings, UI, global styles, AI content, and custom CSS.`,
			capabilities: {
				resources: {
					subscribe: true,
				},
			},
		}
	);

	addV3DescriptionResource( server );
	addElementorResources( server );

	addPageTool( server );
	addUiTool( server );
	addDynamicTool( server );
	addRoutesTool( server );
	addAiTool( server );
	addStylingTool( server );

	const sdk = getAngieSdk();
	await sdk.waitForReady();
	sdk.registerLocalServer( { server, version: VERSION, description: V3_DESCRIPTION, name: 'Elementor' } );

	return server;
}
