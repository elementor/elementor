import { getMCPByDomain } from '@elementor/editor-mcp';

import { initClassesResource } from './classes-resource';
import initMcpApplyUnapplyGlobalClasses from './mcp-apply-unapply-global-classes';
import { initCreateGlobalClass } from './mcp-create-global-class';
import initMcpApplyGetGlobalClassUsages from './mcp-get-global-class-usages';
import { initModifyGlobalClass } from './mcp-modify-global-class';

export const initMcpIntegration = () => {
	const reg = getMCPByDomain( 'canvas' );
	initMcpApplyUnapplyGlobalClasses( reg );
	initMcpApplyGetGlobalClassUsages( reg );
	initCreateGlobalClass( reg );
	initModifyGlobalClass( reg );
	initClassesResource();
};
