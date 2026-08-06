import { type MCPRegistryEntry } from '@elementor/editor-mcp';

import { initListGlobalClassesTool } from './list-global-classes-tool';
import { initManageClassesTool } from './manage-classes-tool';
import initMcpApplyUnapplyGlobalClasses from './mcp-apply-unapply-global-classes';
import initMcpApplyGetGlobalClassUsages from './mcp-get-global-class-usages';

export const initMcpIntegration = ( reg: MCPRegistryEntry, _canvasMcpEntry: MCPRegistryEntry ) => {
	initMcpApplyUnapplyGlobalClasses( reg );
	initMcpApplyGetGlobalClassUsages( reg );
	initManageClassesTool( reg );
	initListGlobalClassesTool( reg );
};
