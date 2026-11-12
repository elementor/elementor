import { type MCPRegistryEntry } from '@elementor/editor-mcp';

import { initBreakpointsResource } from './resources/breakpoints-resource';
import { initInteractionsSchemaResource } from './resources/interactions-schema-resource';
import { initManageElementInteractionTool } from './tools/manage-element-interaction-tool';

export * from './constants';

export const initMcpInteractions = ( reg: MCPRegistryEntry ) => {
	const { setMCPDescription } = reg;
	setMCPDescription(
		`Everything related to V4 ( Atomic ) interactions.
# Interactions
- Create/update/delete interactions
- Get list of interactions
- Get details of an interaction
`
	);
	initInteractionsSchemaResource( reg );
	initBreakpointsResource( reg );
	initManageElementInteractionTool( reg );
};
