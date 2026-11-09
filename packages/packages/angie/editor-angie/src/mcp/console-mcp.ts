import { getMCPByDomain } from '@elementor/editor-mcp';

import { startConsoleErrorsMonitor } from './console-errors-monitor';
import { initReadConsoleErrorsTool } from './tools/read-console-errors/tool';

const CONSOLE_MCP_INSTRUCTIONS = 'Read browser console errors from the Elementor editor window.';

/**
 * Registers the console MCP server. Called only from the Core Angie attach path, which runs after
 * `canUseAngiePluginSidebar()` chose Core over the plugin sidebar, so the plugin host (which already
 * exposes `read-console-errors`) never receives a duplicate tool.
 */
export const initConsoleMcp = (): void => {
	startConsoleErrorsMonitor();
	initReadConsoleErrorsTool( getMCPByDomain( 'console', { instructions: CONSOLE_MCP_INSTRUCTIONS } ) );
};
