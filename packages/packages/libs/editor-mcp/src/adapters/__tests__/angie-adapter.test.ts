const mockIsLegacyAngieAvailable = jest.fn();

jest.mock( '../../utils/is-angie-available', () => ( {
	isLegacyAngieAvailable: () => mockIsLegacyAngieAvailable(),
} ) );

import { type AngieMcpSdk } from '@elementor-external/angie-sdk';

import { AngieMcpAdapter } from '../angie-adapter';

const createSdk = () => {
	const waitForReady = jest.fn().mockResolvedValue( undefined );
	const registerLocalServer = jest.fn().mockResolvedValue( undefined );

	return {
		sdk: {
			waitForReady,
			registerLocalServer,
		} as unknown as AngieMcpSdk,
		waitForReady,
		registerLocalServer,
	};
};

describe( 'AngieMcpAdapter', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'waits for SDK readiness when legacy Angie iframe detection is active', async () => {
		mockIsLegacyAngieAvailable.mockReturnValue( true );
		const { sdk, waitForReady } = createSdk();
		const adapter = new AngieMcpAdapter( sdk, () => [] );

		await adapter.activate();

		expect( waitForReady ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'skips SDK readiness wait when the Angie plugin API is available', async () => {
		mockIsLegacyAngieAvailable.mockReturnValue( false );
		const { sdk, waitForReady } = createSdk();
		const adapter = new AngieMcpAdapter( sdk, () => [] );

		await adapter.activate();

		expect( waitForReady ).not.toHaveBeenCalled();
	} );
} );
