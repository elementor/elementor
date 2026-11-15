import { getMCPByDomain } from '@elementor/editor-mcp';

import { initV3TextControlTool } from './tools/v3-text-control/tool';

const AI_TEXT_MCP_INSTRUCTIONS = 'Tools for Elementor AI text controls in the V3 editor.';

export const initAiTextMcp = (): void => {
	initV3TextControlTool( getMCPByDomain( 'ai', { instructions: AI_TEXT_MCP_INSTRUCTIONS } ) );
};
