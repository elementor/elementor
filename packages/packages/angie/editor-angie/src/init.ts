import { createAngieSdk, setAngieSdk } from '@elementor/editor-mcp';

import { initAiTextMcp } from './mcp/ai-text-mcp';
import { startConsoleErrorsMonitor } from './mcp/console-errors-monitor';

export function init(): void {
	setAngieSdk( createAngieSdk() );
	// Start at package load so errors raised before Angie opens are still captured.
	startConsoleErrorsMonitor();
	initAiTextMcp();
}
