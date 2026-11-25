import { type MCPRegistryEntry } from '@elementor/editor-mcp';

import { initManageDefaultStylesTool } from './manage-default-styles-tool';

export const DEFAULT_STYLES_MCP_NAMESPACE = 'default_styles';

export function initMcp( reg: MCPRegistryEntry ) {
	initManageDefaultStylesTool( reg );
}
