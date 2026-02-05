import { isAngieAvailable } from '@elementor/editor-mcp';

import { initManageVariableTool } from './manage-variable-tool';
import { initVariablesResource } from './variables-resource';

export function initMcp() {
	if ( ! isAngieAvailable() ) {
		return;
	}
	initManageVariableTool();
	initVariablesResource();
}
