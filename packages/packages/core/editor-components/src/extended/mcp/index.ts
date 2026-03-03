import { getMCPByDomain } from '@elementor/editor-mcp';

import { initSaveAsComponentTool } from './save-as-component-tool';

export function initMcp() {
	const { setMCPDescription } = getMCPByDomain( 'components' );

	setMCPDescription(
		`Elementor Editor Components MCP - Tools for creating and managing reusable components. 
        Components are reusable blocks of content that can be used multiple times across the pages, its a widget which contains a set of elements and styles.`
	);

	initSaveAsComponentTool();
}
