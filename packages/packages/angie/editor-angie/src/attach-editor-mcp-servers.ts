import { activateMcpAdapter, AngieMcpAdapter, getRegisteredMcpServers, waitForMcpReady } from '@elementor/editor-mcp';
import { type AngieMcpSdk } from '@elementor-external/angie-sdk';

let attachment: Promise< void > | null = null;

export const resetEditorMcpServersAttachmentForTests = (): void => {
	attachment = null;
};

/**
 * Registers every editor MCP server on the Angie SDK booted by Core, once.
 * No plugin check here: Core only boots its SDK after `canUseAngiePluginSidebar()` said the plugin
 * sidebar does not host Angie, so that helper stays the single decision point. A startup Angie adapter
 * wraps editor-mcp's own SDK copy, not this instance, so it cannot stand in for this attach.
 *
 * @param sdk - Angie SDK instance whose sidebar was loaded by Core.
 */
export const attachEditorMcpServers = ( sdk: AngieMcpSdk ): Promise< void > => {
	attachment ??= ( async () => {
		await waitForMcpReady();
		await activateMcpAdapter( new AngieMcpAdapter( sdk, getRegisteredMcpServers ) );
	} )();

	return attachment;
};
