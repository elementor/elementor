import { getMCPByDomain } from '@elementor/editor-mcp';

import { isAngiePluginActive } from '../is-angie-plugin-active';
import { startConsoleErrorsMonitor } from './console-errors-monitor';
import { initReadConsoleErrorsTool } from './tools/read-console-errors/tool';

const CONSOLE_MCP_INSTRUCTIONS = 'Read browser console errors from the Elementor editor window.';

export const initConsoleMcp = (): void => {
	if ( isAngiePluginActive() ) {
		return;
	}

	startConsoleErrorsMonitor();
	initReadConsoleErrorsTool( getMCPByDomain( 'console', { instructions: CONSOLE_MCP_INSTRUCTIONS } ) );
};
