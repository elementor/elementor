import { getMCPByDomain } from '@elementor/editor-mcp';

import { initSaveAsComponentTool } from './save-as-component-tool';

export function initMcp() {
	const { setMCPDescription } = getMCPByDomain( 'components' );

	setMCPDescription( 'Elementor Editor Components MCP - Tools for creating and managing reusable components' );

	initSaveAsComponentTool();
}
