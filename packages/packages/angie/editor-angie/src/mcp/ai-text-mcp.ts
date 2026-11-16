import { getMCPByDomain } from '@elementor/editor-mcp';

import { initV3CodeControlTool } from './tools/v3-code-control/tool';
import { initV3TextControlTool } from './tools/v3-text-control/tool';

const AI_TEXT_MCP_INSTRUCTIONS = 'Tools for Elementor AI text and code controls in the V3 editor.';

export const initAiTextMcp = (): void => {
	const reg = getMCPByDomain( 'ai', { instructions: AI_TEXT_MCP_INSTRUCTIONS } );
	initV3TextControlTool( reg );
	initV3CodeControlTool( reg );
};
