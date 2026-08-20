import { type MCPRegistryEntry } from '@elementor/editor-mcp';

import { TITLE_GENERATION_MCP_DESCRIPTION } from './constants';
import { initUpdateHeadingTitleTool } from './tools/update-heading-title-tool';

export * from './constants';

export const initTitleGenerationMcp = ( reg: MCPRegistryEntry ) => {
	initUpdateHeadingTitleTool( reg );
	reg.setMCPDescription( TITLE_GENERATION_MCP_DESCRIPTION );
};
