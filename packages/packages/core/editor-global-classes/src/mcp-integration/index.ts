import { getMCPByDomain } from '@elementor/editor-mcp';

import { initClassesResource } from './classes-resource';
import { initDesignSystemTool } from './design-system/design-system-tool';
import initMcpApplyUnapplyGlobalClasses from './mcp-apply-unapply-global-classes';
import { initCreateGlobalClass } from './mcp-create-global-class';
import { mcpDescription } from './mcp-description';
import initMcpApplyGetGlobalClassUsages from './mcp-get-global-class-usages';
import { initModifyGlobalClass } from './mcp-modify-global-class';

export const initMcpIntegration = () => {
	const reg = getMCPByDomain( 'classes' );
	reg.setMCPDescription( mcpDescription );
	initMcpApplyUnapplyGlobalClasses( reg );
	initMcpApplyGetGlobalClassUsages( reg );
	initCreateGlobalClass( reg );
	initModifyGlobalClass( reg );
	initDesignSystemTool( reg );
	initClassesResource();
};
