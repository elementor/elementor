import {
	activateMcpAdapter,
	AngieMcpAdapter,
	getRegisteredMcpServers,
	hasMcpAdapter,
	waitForMcpReady,
} from '@elementor/editor-mcp';
import { type AngieMcpSdk } from '@elementor-external/angie-sdk';

let attachment: Promise< void > | null = null;

export const resetEditorMcpServersAttachmentForTests = (): void => {
	attachment = null;
};

/**
 * Registers every editor MCP server on the Angie SDK booted by Core, once.
 * Skipped when editor-mcp already attached an Angie adapter at startup (the Angie plugin host).
 *
 * @param sdk - Angie SDK instance whose sidebar was loaded by Core.
 */
export const attachEditorMcpServers = ( sdk: AngieMcpSdk ): Promise< void > => {
	attachment ??= ( async () => {
		await waitForMcpReady();

		if ( hasMcpAdapter( AngieMcpAdapter ) ) {
			return;
		}

		await activateMcpAdapter( new AngieMcpAdapter( sdk, getRegisteredMcpServers ) );
	} )();

	return attachment;
};
