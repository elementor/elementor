import { startConsoleErrorsMonitor } from './mcp/console-errors-monitor';

export function init(): void {
	// Start at package load so errors raised before Angie opens are still captured.
	startConsoleErrorsMonitor();
}
