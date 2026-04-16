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
		`Everything related to V4 ( Atomic ) canvas.
# Canvas workflow for new compositions
- Configure elements settings and styles
- Build compositions/sections out of V4 atomic elements using context aware designs using the website resources
- Get and retrieve element configuration values
`
	);
	initWidgetsSchemaResource( reg );
	initDocumentStructureResource( reg );
	initBuildCompositionsTool( reg );
	initGetElementConfigTool( reg );
	initConfigureElementTool( reg );
	initBreakpointsResource( reg );
};
