import { type MCPRegistryEntry } from '@elementor/editor-mcp';

import { initBreakpointsResource } from './resources/breakpoints-resource';
import { initDocumentStructureResource } from './resources/document-structure-resource';
import { initWidgetsSchemaResource } from './resources/widgets-schema-resource';
import { initBuildCompositionsTool } from './tools/build-composition/tool';
import { initConfigureElementTool } from './tools/configure-element/tool';
import { initGetElementConfigTool } from './tools/get-element-config/tool';

export const initCanvasMcp = ( reg: MCPRegistryEntry ) => {
	const { setMCPDescription } = reg;
	setMCPDescription(
		`Everything related to creative design, layout, styling and building the pages, specifically element of type "widget".
# Canvas workflow for new compositions
- Check existing global variables
- Check existing global classes
- Create missing global variables
- Create reusable global classes
- Build valid XML with minimal inline styles (layout/positioning only)
- Apply global classes to elements`
	);
	initWidgetsSchemaResource( reg );
	initDocumentStructureResource( reg );
	initBuildCompositionsTool( reg );
	initGetElementConfigTool( reg );
	initConfigureElementTool( reg );
	initBreakpointsResource( reg );
};
