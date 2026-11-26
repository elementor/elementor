import { getMCPByDomain } from '@elementor/editor-mcp';

import { initV3CodeControlTool } from './tools/v3-code-control/tool';
import { initV3KitSiteIdentityTool } from './tools/v3-kit-site-identity/tool';
import { initV3MotionEffectsTool } from './tools/v3-motion-effects/tool';
import { initV3TextControlTool } from './tools/v3-text-control/tool';

const AI_TEXT_MCP_INSTRUCTIONS =
	'Tools for Elementor AI text, code, V3 kit site identity, and V3 motion effect controls in the editor.';

export const initAiTextMcp = (): void => {
	const reg = getMCPByDomain( 'ai', { instructions: AI_TEXT_MCP_INSTRUCTIONS } );
	initV3CodeControlTool( reg );
	initV3KitSiteIdentityTool( reg );
	initV3MotionEffectsTool( reg );
	initV3TextControlTool( reg );
};
