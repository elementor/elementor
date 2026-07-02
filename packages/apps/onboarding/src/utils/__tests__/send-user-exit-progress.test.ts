import { sendUserExitProgress } from '../send-user-exit-progress';

describe( 'sendUserExitProgress', () => {
	const originalFetch = global.fetch;

	beforeEach( () => {
		window.elementorAppConfig = {
			onboarding: {
				restUrl: 'https://example.com/wp-json/elementor/v1/onboarding/',
				nonce: 'test-nonce',
			},
		} as typeof window.elementorAppConfig;

		global.fetch = jest.fn().mockResolvedValue( { ok: true } );
	} );

	afterEach( () => {
		global.fetch = originalFetch;
		window.elementorAppConfig = undefined;
	} );

	it( 'should post user_exit with nonce and keepalive', () => {
		sendUserExitProgress();

		expect( global.fetch ).toHaveBeenCalledWith(
			'https://example.com/wp-json/elementor/v1/onboarding/user-progress',
			expect.objectContaining( {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-WP-Nonce': 'test-nonce',
				},
				body: JSON.stringify( { user_exit: true } ),
				keepalive: true,
			} )
		);
	} );
} );
