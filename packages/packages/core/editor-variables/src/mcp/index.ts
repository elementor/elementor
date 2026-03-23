import { type MCPRegistryEntry } from '@elementor/editor-mcp';

import { initManageVariableTool } from './manage-variable-tool';
import { initVariablesResource } from './variables-resource';

export function initMcp( reg: MCPRegistryEntry, canvasMcpEntry: MCPRegistryEntry ) {
	const { setMCPDescription } = reg;
	setMCPDescription(
		`Everything related to V4 ( Atomic ) variables.
# Global variables
- Create/update/delete global variables
- Get list of global variables
- Get details of a global variable
`
	);
	initManageVariableTool( reg );
	initVariablesResource( reg, canvasMcpEntry );
}
