import { type MCPRegistryEntry } from '@elementor/editor-mcp';

import { initClassesResource } from './classes-resource';
import initMcpApplyUnapplyGlobalClasses from './mcp-apply-unapply-global-classes';
import initMcpApplyGetGlobalClassUsages from './mcp-get-global-class-usages';
import { initManageClassesTool } from './manage-classes-tool';

export const initMcpIntegration = ( reg: MCPRegistryEntry, canvasMcpEntry: MCPRegistryEntry ) => {
	initMcpApplyUnapplyGlobalClasses( reg );
	initMcpApplyGetGlobalClassUsages( reg );
	initManageClassesTool( reg );
	initClassesResource( reg, canvasMcpEntry );
};
