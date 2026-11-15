import { getMCPByDomain } from '@elementor/editor-mcp';

import { initV3CodeControlTool } from './tools/v3-code-control/tool';
import { initV3MotionEffectsTool } from './tools/v3-motion-effects/tool';
import { initV3TextControlTool } from './tools/v3-text-control/tool';

const AI_TEXT_MCP_INSTRUCTIONS =
	'Tools for Elementor AI text, code, and V3 motion effect controls in the editor.';

export const initAiTextMcp = (): void => {
	const reg = getMCPByDomain( 'ai', { instructions: AI_TEXT_MCP_INSTRUCTIONS } );
	initV3TextControlTool( reg );
	initV3CodeControlTool( reg );
	initV3MotionEffectsTool( reg );
};
