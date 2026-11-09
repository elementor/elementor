import { activateMcpAdapter, AngieMcpAdapter, hasMcpAdapter } from '@elementor/editor-mcp';
import { type AngieMcpSdk } from '@elementor-external/angie-sdk';

import { attachEditorMcpServers, resetEditorMcpServersAttachmentForTests } from '../attach-editor-mcp-servers';

jest.mock( '@elementor/editor-mcp', () => ( {
	AngieMcpAdapter: jest.fn(),
	activateMcpAdapter: jest.fn().mockResolvedValue( undefined ),
	getRegisteredMcpServers: jest.fn( () => [] ),
	hasMcpAdapter: jest.fn( () => false ),
	waitForMcpReady: jest.fn().mockResolvedValue( undefined ),
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

	it( 'attaches only once', async () => {
		// Act
		await attachEditorMcpServers( sdk );
		await attachEditorMcpServers( sdk );

		// Assert
		expect( activateMcpAdapter ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'skips when editor-mcp already attached an Angie adapter at startup', async () => {
		// Arrange
		jest.mocked( hasMcpAdapter ).mockReturnValueOnce( true );

		// Act
		await attachEditorMcpServers( sdk );

		// Assert
		expect( activateMcpAdapter ).not.toHaveBeenCalled();
	} );
} );
