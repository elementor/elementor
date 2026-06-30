import { getAngieSdk } from '@elementor/editor-mcp';
import { waitForElementorEditor } from '@elementor/elementor-mcp-common';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { setupEditorSelectionListener } from './editor-selection-listener';
import { addV3DescriptionResource } from './mcp-description-resource';
import { addElementorResources } from './resources';
import { addAiTool, addDynamicTool, addPageTool, addRoutesTool, addStylingTool, addUiTool } from './tools';

const VERSION = '2.0.0';
const SHORT_DESCRIPTION = `Controls the Elementor editor: page settings, UI, global styles, AI content, and custom CSS.`;

export async function createElementorServer(): Promise< McpServer > {
	await waitForElementorEditor();

	const server = new McpServer(
		{
			name: 'elementor-server',
			version: VERSION,
			title: 'Elementor',
		},
		{
			instructions: SHORT_DESCRIPTION,
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

	setupEditorSelectionListener( server );

	const sdk = getAngieSdk();
	await sdk.waitForReady();
	sdk.registerLocalServer( { server, version: VERSION, description: SHORT_DESCRIPTION, name: 'Elementor' } );

	return server;
}
