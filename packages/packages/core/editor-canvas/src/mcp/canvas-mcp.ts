import { type MCPRegistryEntry } from '@elementor/editor-mcp';

import { initAvailableWidgetsResource } from './resources/available-widgets-resource';
import { initBreakpointsResource } from './resources/breakpoints-resource';
import { initDocumentStructureResource } from './resources/document-structure-resource';
import { initEditorStateResource } from './resources/editor-state-resource';
import { initGeneralContextResource } from './resources/general-context-resource';
import { initSelectedElementResource } from './resources/selected-element-resource';
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
	initAvailableWidgetsResource( reg );
	initDocumentStructureResource( reg );
	initSelectedElementResource( reg );
	initEditorStateResource( reg );
	initGeneralContextResource( reg );
	initBuildCompositionsTool( reg );
	initGetElementConfigTool( reg );
	initConfigureElementTool( reg );
	initBreakpointsResource( reg );
};
