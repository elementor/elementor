import { isAngieAvailable, type MCPRegistryEntry } from '@elementor/editor-mcp';

import { initManageVariableTool } from './manage-variable-tool';
import { initVariablesResource } from './variables-resource';

export function initMcp( reg: MCPRegistryEntry, canvasMcpEntry: MCPRegistryEntry ) {
	if ( ! isAngieAvailable() ) {
		return;
	}
	initManageVariableTool( reg );
	initVariablesResource( reg, canvasMcpEntry );
}
