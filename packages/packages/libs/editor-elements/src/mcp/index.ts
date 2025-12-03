import { getMCPByDomain } from '@elementor/editor-mcp';

import { initElementsTool } from './elements-tool';

export function initMcp() {
	const { setMCPDescription } = getMCPByDomain( 'elements' );
	setMCPDescription( 'Tools for managing atomic elements in Elementor v4 editor' );
	initElementsTool();
}
