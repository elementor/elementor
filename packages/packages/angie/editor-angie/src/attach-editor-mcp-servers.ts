import { type AngieMcpSdk } from '@elementor/editor-angie-sdk';
import { activateMcpAdapter, AngieMcpAdapter, getRegisteredMcpServers, waitForMcpReady } from '@elementor/editor-mcp';

import { initConsoleMcp } from './mcp/console-mcp';

let attachment: Promise< void > | null = null;

export const resetEditorMcpServersAttachmentForTests = (): void => {
	attachment = null;
};

/**
 * Registers every editor MCP server on the Angie SDK booted by Core, once.
 * No plugin check here: Core only boots its SDK after `canUseAngiePluginSidebar()` said the plugin
 * sidebar does not host Angie, so that helper stays the single decision point.
 *
 * @param sdk - Angie SDK instance whose sidebar was loaded by Core.
 */
export const attachEditorMcpServers = ( sdk: AngieMcpSdk ): Promise< void > => {
	attachment ??= ( async () => {
		await waitForMcpReady();
		// Registered here, before activation, so the adapter sends it with the other editor servers.
		initConsoleMcp();
		await activateMcpAdapter( new AngieMcpAdapter( sdk, getRegisteredMcpServers ) );
	} )();

	return attachment;
};
