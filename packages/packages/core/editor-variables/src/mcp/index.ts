import { getByDomain } from '@elementor/editor-mcp';

import { initCreateVariableTool } from './create-variable-tool';
import { initDeleteVariableTool } from './delete-variable-tool';
import { initListVariablesTool } from './list-variables-tool';
import { initUpdateVariableTool } from './update-variable-tool';

export function initMcp() {
	const { setMCPDescription } = getByDomain( 'variables' );
	setMCPDescription( `Elementor Editor Variables MCP` );
	initListVariablesTool();
	initCreateVariableTool();
	initUpdateVariableTool();
	initDeleteVariableTool();
}
