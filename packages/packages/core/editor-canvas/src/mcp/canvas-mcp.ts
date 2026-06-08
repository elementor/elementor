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
	// TODO: Remove this comment once 4.2 released
	// NOTE: Style schema removed in favor of css-to-schema functionality [ED-24441]
	// Reference code can be found at any commit prior to `d338e816f0c97b90b52fe2f1ef0bfe2aad816ab0`
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
