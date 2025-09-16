import { getMCPByDomain } from '@elementor/editor-mcp';

import { initListElementsInPageTool } from './list-elements-in-page';

export const initMcp = () => {
	getMCPByDomain( 'root' ).setMCPDescription( 'Elementor Editor Base Actions MCP' );
	initListElementsInPageTool();
};
