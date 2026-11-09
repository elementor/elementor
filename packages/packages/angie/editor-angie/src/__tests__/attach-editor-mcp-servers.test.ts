import { activateMcpAdapter, AngieMcpAdapter, waitForMcpReady } from '@elementor/editor-mcp';
import { type AngieMcpSdk } from '@elementor-external/angie-sdk';

import { attachEditorMcpServers, resetEditorMcpServersAttachmentForTests } from '../attach-editor-mcp-servers';
import { initConsoleMcp } from '../mcp/console-mcp';

jest.mock( '@elementor/editor-mcp', () => ( {
	AngieMcpAdapter: jest.fn(),
	activateMcpAdapter: jest.fn().mockResolvedValue( undefined ),
	getRegisteredMcpServers: jest.fn( () => [] ),
	waitForMcpReady: jest.fn().mockResolvedValue( undefined ),
} ) );

jest.mock( '../mcp/console-mcp', () => ( {
	initConsoleMcp: jest.fn(),
} ) );

const sdk = {} as AngieMcpSdk;

describe( 'attachEditorMcpServers', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		resetEditorMcpServersAttachmentForTests();
	} );

	it( 'activates an Angie adapter around the given sdk', async () => {
		// Act
		await attachEditorMcpServers( sdk );

		// Assert
		expect( AngieMcpAdapter ).toHaveBeenCalledWith( sdk, expect.any( Function ) );
		expect( activateMcpAdapter ).toHaveBeenCalledWith( expect.any( AngieMcpAdapter ) );
	} );

	it( 'registers the console MCP server before activating, so Core-hosted Angie receives it', async () => {
		// Act
		await attachEditorMcpServers( sdk );

		// Assert
		expect( initConsoleMcp ).toHaveBeenCalledTimes( 1 );
		expect( jest.mocked( initConsoleMcp ).mock.invocationCallOrder[ 0 ] ).toBeLessThan(
			jest.mocked( activateMcpAdapter ).mock.invocationCallOrder[ 0 ]
		);
	} );

	it( 'attaches only once', async () => {
		// Act
		await attachEditorMcpServers( sdk );
		await attachEditorMcpServers( sdk );

		// Assert
		expect( activateMcpAdapter ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'activates only after editor-mcp startup finished', async () => {
		// Arrange
		let resolveReady!: () => void;
		jest.mocked( waitForMcpReady ).mockReturnValueOnce(
			new Promise( ( resolve ) => {
				resolveReady = resolve;
			} )
		);

		// Act
		const attachment = attachEditorMcpServers( sdk );
		await Promise.resolve();

		// Assert
		expect( activateMcpAdapter ).not.toHaveBeenCalled();

		resolveReady();
		await attachment;

		expect( activateMcpAdapter ).toHaveBeenCalledTimes( 1 );
	} );
} );
