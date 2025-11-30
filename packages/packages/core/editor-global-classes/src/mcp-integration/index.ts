import { getMCPByDomain } from '@elementor/editor-mcp';

import initMcpApplyUnapplyGlobalClasses from './mcp-apply-unapply-global-classes';
import initMcpApplyGetGlobalClassUsages from './mcp-get-global-class-usages';

export const initMcpIntegration = () => {
	const reg = getMCPByDomain( 'classes' );
	reg.setMCPDescription(
		'Tools for managing and applying Global CSS classes to elements within the Elementor editor.'
	);
	initMcpApplyUnapplyGlobalClasses( reg );
	initMcpApplyGetGlobalClassUsages( reg );
};
