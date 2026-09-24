import { installEventsProxyFetch } from 'elementor/core/common/modules/events-manager/assets/js/install-events-proxy-fetch';

class TestRequest {
	constructor( url, options = {} ) {
		if ( url instanceof TestRequest ) {
			this.url = url.url;
			this.headers = options.headers ? new Headers( options.headers ) : new Headers( url.headers );
			this.credentials = options.credentials ?? url.credentials;
			return;
		}

		this.url = url;
		this.headers = new Headers( options.headers );
		this.credentials = options.credentials ?? 'same-origin';
	}
}

describe( 'installEventsProxyFetch', () => {
	const proxyApiHost = 'https://example.com/wp-json/elementor/v1/events/api';
	const token = 'editor-events-project-token';

	beforeEach( () => {
		delete window.__elementorEventsProxyFetchInstalled;
		global.Request = TestRequest;
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

	test( 'removes SDK Authorization when fetch is called with a Request input only', async () => {
		const nativeFetch = jest.fn().mockResolvedValue( { ok: true } );

		window.fetch = nativeFetch;

		installEventsProxyFetch( proxyApiHost, '', token );

		const mixpanelAuthorization = `Basic ${ btoa( `${ token }:` ) }`;
		const request = new Request( `${ proxyApiHost }/flags?token=${ token }`, {
			headers: {
				Authorization: mixpanelAuthorization,
			},
		} );

		await window.fetch( request );

		expect( nativeFetch ).toHaveBeenCalledTimes( 1 );

		const forwardedInput = nativeFetch.mock.calls[ 0 ][ 0 ];

		expect( forwardedInput ).toBeInstanceOf( Request );
		expect( forwardedInput.headers.has( 'Authorization' ) ).toBe( false );
		expect( forwardedInput.credentials ).toBe( 'include' );
		expect( nativeFetch.mock.calls[ 0 ][ 1 ] ).toBeUndefined();
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
