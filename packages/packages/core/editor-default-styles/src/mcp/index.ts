import { type MCPRegistryEntry } from '@elementor/editor-mcp';

import { initManageDefaultStylesTool } from './manage-default-styles-tool';

export function initMcp( reg: MCPRegistryEntry ) {
	initManageDefaultStylesTool( reg );
}
