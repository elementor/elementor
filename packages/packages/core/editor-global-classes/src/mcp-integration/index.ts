import { getMCPByDomain } from '@elementor/editor-mcp';

import { initClassesResource } from './classes-resource';
import initMcpApplyUnapplyGlobalClasses from './mcp-apply-unapply-global-classes';
import initMcpApplyGetGlobalClassUsages from './mcp-get-global-class-usages';
import { initManageGlobalClasses } from './mcp-manage-global-classes';

export const initMcpIntegration = () => {
	const reg = getMCPByDomain( 'classes', {
		instructions: 'MCP server for management of Elementor global classes',
	} );
	initMcpApplyUnapplyGlobalClasses( reg );
	initMcpApplyGetGlobalClassUsages( reg );
	initManageGlobalClasses( reg );
	initClassesResource();
};
