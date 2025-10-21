import { type MCPRegistryEntry } from '@elementor/editor-mcp';

import { initBuildHtmlTool } from './build-html/build-html-tool';
import { initConfigureElementTool } from './configure-element-tool';

export const initCanvasMcp = ( reg: MCPRegistryEntry ) => {
	const { setMCPDescription } = reg;

	initBuildHtmlTool( reg );
	initConfigureElementTool( reg );

	setMCPDescription( 'Everything related to creative design, layout and building the pages' );
};
