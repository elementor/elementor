import { type MCPRegistryEntry } from '@elementor/editor-mcp';

import { initClassesResource } from './classes-resource';
import initMcpApplyUnapplyGlobalClasses from './mcp-apply-unapply-global-classes';
import initMcpApplyGetGlobalClassUsages from './mcp-get-global-class-usages';
import { initManageGlobalClasses } from './mcp-manage-global-classes';

export const initMcpIntegration = ( reg: MCPRegistryEntry, canvasMcpEntry: MCPRegistryEntry ) => {
	const { setMCPDescription } = reg;
	setMCPDescription(
		`Everything related to V4 ( Atomic ) global classes.
# Global classes
- Create/update/delete global classes
- Get list of global classes
- Get details of a global class
- Get details of a global class
` );
	initMcpApplyUnapplyGlobalClasses( reg );
	initMcpApplyGetGlobalClassUsages( reg );
	initManageGlobalClasses( reg );
	initClassesResource( reg, canvasMcpEntry );
};
