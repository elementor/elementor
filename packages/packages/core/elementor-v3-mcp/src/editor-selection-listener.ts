import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { RESOURCE_URI_CURRENT_CONTEXT } from './resources';

const SELECTION_COMMANDS = new Set( [
	'document/elements/select',
	'document/elements/deselect',
	'document/elements/deselect-all',
	'document/elements/toggle-selection',
	'document/elements/select-all',
	'editor/documents/switch',
] );

const DEBOUNCE_MS = 50;

// In Elementor 4.x the V1 `$e.commands.on('run:after', ...)` callback is no longer fired
// for selection commands — they're dispatched as `CustomEvent('elementor/commands/run/after')`
// on `window`, with `event.detail = { command, args }` (see editor-v1-adapters' listeners.ts).
// Subscribing at the DOM-event layer keeps the listener working across Elementor 4.x versions.
const COMMAND_EVENT_NAME = 'elementor/commands/run/after';

type CommandRunDetail = { command?: string; args?: unknown };

export function setupEditorSelectionListener( server: McpServer ): void {
	let debounceTimer: ReturnType< typeof setTimeout > | null = null;

	const sendUpdate = ( uri: string ) => {
		void server.server.sendResourceUpdated( { uri } ).catch( ( error: Error ) => {
			if ( ! error?.message?.includes( 'Not connected' ) ) {
				throw error;
			}
		} );
	};

	const handleCommandRun = ( event: Event ) => {
		if ( ! ( event instanceof CustomEvent ) ) {
			return;
		}
		const command = ( event.detail as CommandRunDetail | undefined )?.command;
		if ( ! command || ! SELECTION_COMMANDS.has( command ) ) {
			return;
		}
		if ( debounceTimer ) {
			clearTimeout( debounceTimer );
		}
		debounceTimer = setTimeout( () => sendUpdate( RESOURCE_URI_CURRENT_CONTEXT ), DEBOUNCE_MS );
	};

	window.addEventListener( COMMAND_EVENT_NAME, handleCommandRun );
}
