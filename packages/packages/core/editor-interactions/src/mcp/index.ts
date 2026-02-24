import { getMCPByDomain } from '@elementor/editor-mcp';

import { initInteractionsSchemaResource } from './resources/interactions-schema-resource';
import { initManageElementInteractionTool } from './tools/manage-element-interaction-tool';

export const initMcpIntegration = () => {
	const reg = getMCPByDomain( 'interactions', {
		instructions:
			'MCP server for managing element interactions and animations. Use this to add, modify, or remove animations and motion effects triggered by user events such as page load or scroll-into-view.',
	} );
	initInteractionsSchemaResource( reg );
	initManageElementInteractionTool( reg );
};
