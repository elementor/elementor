import { activateMcpAdapter, AngieMcpAdapter, waitForMcpReady } from '@elementor/editor-mcp';
import { type AngieMcpSdk } from '@elementor-external/angie-sdk';

import { attachEditorMcpServers, resetEditorMcpServersAttachmentForTests } from '../attach-editor-mcp-servers';

jest.mock( '@elementor/editor-mcp', () => ( {
	AngieMcpAdapter: jest.fn(),
	activateMcpAdapter: jest.fn().mockResolvedValue( undefined ),
	getRegisteredMcpServers: jest.fn( () => [] ),
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
