import { type MCPRegistryEntry } from '@elementor/editor-mcp';

import { initListGlobalVariablesTool } from './list-global-variables-tool';
import { initManageVariableTool } from './manage-variable-tool';

export function initMcp( reg: MCPRegistryEntry, _canvasMcpEntry: MCPRegistryEntry ) {
	window.addEventListener(
		'elementor/init',
		() => {
			initManageVariableTool( reg );
			initListGlobalVariablesTool( reg );
		},
		{ once: true }
	);
}
