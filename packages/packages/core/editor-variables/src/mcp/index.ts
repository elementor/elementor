import { type MCPRegistryEntry } from '@elementor/editor-mcp';

import { initManageVariableTool } from './manage-variable-tool';
import { initVariablesResource } from './variables-resource';

export function initMcp( reg: MCPRegistryEntry, canvasMcpEntry: MCPRegistryEntry ) {
	window.addEventListener(
		'elementor/init',
		() => {
			initManageVariableTool( reg );
			initVariablesResource( reg, canvasMcpEntry );
		},
		{ once: true }
	);
}
