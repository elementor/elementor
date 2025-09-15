import { getByDomain } from '@elementor/editor-mcp';

import { initListElementsInPageTool } from './list-elements-in-page';

export const initMcp = () => {
	getByDomain( 'root' ).setMCPDescription( 'Elementor Editor Base Actions MCP' );
	initListElementsInPageTool();
};
