import { type MCPRegistryEntry } from '@elementor/editor-mcp';

import { initConfigureElementTool } from './configure-element-tool';
import { initWidgetsSchemaResource } from './resources/widgets-schema-resource';
import { initBuildCompositionsTool } from './tools/build-compositions-tool';

export const initCanvasMcp = ( reg: MCPRegistryEntry ) => {
	const { setMCPDescription } = reg;
	setMCPDescription(
		'Everything related to creative design, layout, styling and building the pages, specifically element of type "widget"'
	);
	initWidgetsSchemaResource( reg );
	initBuildCompositionsTool( reg );
	// initBuildHtmlTool( reg );
	initConfigureElementTool( reg );
};
