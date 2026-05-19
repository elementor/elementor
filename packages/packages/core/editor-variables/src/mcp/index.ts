import { type MCPRegistryEntry } from '@elementor/editor-mcp';

import { initManageVariableTool } from './manage-variable-tool';
import { initVariablesResource } from './variables-resource';

export function initMcp( reg: MCPRegistryEntry, canvasMcpEntry: MCPRegistryEntry ) {
	initManageVariableTool( reg );
	initVariablesResource( reg, canvasMcpEntry );
}
