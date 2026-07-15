const mockIsLegacyAngieAvailable = jest.fn();

jest.mock( '../../utils/is-angie-available', () => ( {
	isLegacyAngieAvailable: () => mockIsLegacyAngieAvailable(),
} ) );

import { AngieMcpAdapter } from '../angie-adapter';

const createSdk = () => ( {
	waitForReady: jest.fn().mockResolvedValue( undefined ),
	registerLocalServer: jest.fn().mockResolvedValue( undefined ),
} );

describe( 'AngieMcpAdapter', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'waits for SDK readiness when legacy Angie iframe detection is active', async () => {
		mockIsLegacyAngieAvailable.mockReturnValue( true );
		const sdk = createSdk();
		const adapter = new AngieMcpAdapter( sdk, () => [] );

		await adapter.activate();

		expect( sdk.waitForReady ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'skips SDK readiness wait when the Angie plugin API is available', async () => {
		mockIsLegacyAngieAvailable.mockReturnValue( false );
		const sdk = createSdk();
		const adapter = new AngieMcpAdapter( sdk, () => [] );

		await adapter.activate();

		expect( sdk.waitForReady ).not.toHaveBeenCalled();
	} );
} );
