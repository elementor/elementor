import { type MCPRegistryEntry } from '@elementor/editor-mcp';

import { initWidgetsSchemaResource } from './resources/widgets-schema-resource';
import { initBuildCompositionsTool } from './tools/build-composition/tool';
import { initConfigureElementTool } from './tools/configure-element/tool';

export const initCanvasMcp = ( reg: MCPRegistryEntry ) => {
	const { setMCPDescription } = reg;
	setMCPDescription(
		'Everything related to creative design, layout, styling and building the pages, specifically element of type "widget"'
	);
	initWidgetsSchemaResource( reg );
	initBuildCompositionsTool( reg );
	initConfigureElementTool( reg );
};
