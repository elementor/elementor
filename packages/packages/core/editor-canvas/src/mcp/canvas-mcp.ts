import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { Schema } from '@elementor/editor-props';

import { initAvailableWidgetsResource } from './resources/available-widgets-resource';
import { initBreakpointsResource } from './resources/breakpoints-resource';
import { initDocumentStructureResource } from './resources/document-structure-resource';
import { initDynamicTagsResource } from './resources/dynamic-tags-resource';
import { initEditorStateResource } from './resources/editor-state-resource';
import { initGeneralContextResource } from './resources/general-context-resource';
import { initSelectedElementResource } from './resources/selected-element-resource';
import { initWidgetsSchemaResource } from './resources/widgets-schema-resource';
import { initBuildCompositionsTool } from './tools/build-composition/tool';
import { initConfigureElementTool } from './tools/configure-element/tool';
import { initGetElementConfigTool } from './tools/get-element-config/tool';
import { getDynamicTagNamesByCategories } from './utils/resolve-dynamic-tag';

export const initCanvasMcp = ( reg: MCPRegistryEntry ) => {
	Schema.setDynamicTagNamesResolver( getDynamicTagNamesByCategories );
	initWidgetsSchemaResource( reg );
	initAvailableWidgetsResource( reg );
	initDocumentStructureResource( reg );
	initDynamicTagsResource( reg );
	initSelectedElementResource( reg );
	initEditorStateResource( reg );
	initGeneralContextResource( reg );
	initBuildCompositionsTool( reg );
	initGetElementConfigTool( reg );
	initConfigureElementTool( reg );
	initBreakpointsResource( reg );
};
