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

const COMMAND_EVENT_NAME = 'elementor/commands/run/after';

export function setupEditorSelectionListener( server: McpServer ): void {
	let debounceTimer: ReturnType< typeof setTimeout > | null = null;

	const sendUpdate = () => {
		void server.server.sendResourceUpdated( { uri: RESOURCE_URI_CURRENT_CONTEXT } ).catch( ( error: Error ) => {
			const isSafeError =
				error?.message?.includes( 'Not connected' ) ||
				error?.message?.includes( 'does not support notifying about resources' );
			if ( ! isSafeError ) {
				throw error;
			}
		} );
	};

	const handleCommandRun = ( event: Event ) => {
		if ( ! ( event instanceof CustomEvent ) ) {
			return;
		}
		const command = ( event.detail as { command?: string } | undefined )?.command;
		if ( ! command || ! SELECTION_COMMANDS.has( command ) ) {
			return;
		}
		if ( debounceTimer ) {
			clearTimeout( debounceTimer );
		}
		debounceTimer = setTimeout( sendUpdate, DEBOUNCE_MS );
	};

	window.addEventListener( COMMAND_EVENT_NAME, handleCommandRun );
}
