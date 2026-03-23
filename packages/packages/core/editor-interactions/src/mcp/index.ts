import { type MCPRegistryEntry } from '@elementor/editor-mcp';

import { initInteractionsSchemaResource } from './resources/interactions-schema-resource';
import { initManageElementInteractionTool } from './tools/manage-element-interaction-tool';

export * from './constants';

export const initMcpInteractions = ( reg: MCPRegistryEntry ) => {
	initInteractionsSchemaResource( reg );
	initManageElementInteractionTool( reg );
};
