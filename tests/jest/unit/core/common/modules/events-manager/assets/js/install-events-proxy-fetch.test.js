import { installEventsProxyFetch } from 'elementor/core/common/modules/events-manager/assets/js/install-events-proxy-fetch';

describe( 'installEventsProxyFetch', () => {
	const proxyApiHost = 'https://example.com/wp-json/elementor/v1/events/api';
	const token = 'mixpanel-project-token';

	beforeEach( () => {
		delete window.__elementorEventsProxyFetchInstalled;
	} );

	afterEach( () => {
		delete window.__elementorEventsProxyFetchInstalled;
	} );

	test( 'removes mixpanel Authorization from same-origin proxy fetch requests', async () => {
		const nativeFetch = jest.fn().mockResolvedValue( { ok: true } );

		window.fetch = nativeFetch;

		installEventsProxyFetch( proxyApiHost, '', token );

		const mixpanelAuthorization = `Basic ${ btoa( `${ token }:` ) }`;

		await window.fetch( `${ proxyApiHost }/flags?token=${ token }`, {
			headers: {
				Authorization: mixpanelAuthorization,
			},
		} );

		expect( nativeFetch ).toHaveBeenCalledWith(
			`${ proxyApiHost }/flags?token=${ token }`,
			expect.objectContaining( {
				credentials: 'include',
			} ),
		);

		const forwardedInit = nativeFetch.mock.calls[ 0 ][ 1 ];
		const forwardedHeaders = new Headers( forwardedInit.headers );

		expect( forwardedHeaders.has( 'Authorization' ) ).toBe( false );
	} );

	test( 'does not alter Authorization on non-proxy requests', async () => {
		const nativeFetch = jest.fn().mockResolvedValue( { ok: true } );

		window.fetch = nativeFetch;

		installEventsProxyFetch( proxyApiHost, '', token );

		const siteAuthorization = 'Basic dXNlcjpwYXNz';

		await window.fetch( 'https://example.com/wp-json/wp/v2/posts', {
			headers: {
				Authorization: siteAuthorization,
			},
		} );

		const forwardedInit = nativeFetch.mock.calls[ 0 ][ 1 ];

		expect( new Headers( forwardedInit.headers ).get( 'Authorization' ) ).toBe( siteAuthorization );
	} );
} );
