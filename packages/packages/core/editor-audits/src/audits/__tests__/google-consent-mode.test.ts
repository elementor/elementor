import { audit } from '../google-consent-mode';
import { makeContext } from './fixtures';

describe( audit.id, () => {
	const originalFetch = global.fetch;

	const mockFetchResponse = ( html: string ) => {
		global.fetch = jest.fn().mockResolvedValue( {
			ok: true,
			text: () => Promise.resolve( html ),
		} ) as unknown as typeof fetch;
	};

	afterEach( () => {
		global.fetch = originalFetch;
	} );

	it( 'skips when the page has no frontend_url (e.g. not published)', async () => {
		// Arrange.
		global.fetch = jest.fn() as unknown as typeof fetch;

		// Act.
		const result = await audit.evaluate( makeContext( { pageContext: { frontend_url: null } } ) );

		// Assert.
		expect( result.status ).toBe( 'skipped' );
		expect( global.fetch ).not.toHaveBeenCalled();
	} );

	it( 'skips when no Google tracking product is detected on the rendered page', async () => {
		// Arrange.
		mockFetchResponse( '<html><head></head><body>Hello</body></html>' );

		// Act.
		const result = await audit.evaluate( makeContext() );

		// Assert.
		expect( result.status ).toBe( 'skipped' );
	} );

	it( 'passes when a Google tracking product and a consent default call are both present', async () => {
		// Arrange.
		mockFetchResponse(
			`<script src="https://www.googletagmanager.com/gtm.js?id=GTM-ABC123"></script>
			 <script>gtag('consent', 'default', { ad_storage: 'denied' });</script>`
		);

		// Act.
		const result = await audit.evaluate( makeContext() );

		// Assert.
		expect( result ).toEqual( { status: 'pass' } );
	} );

	it( 'fails with an Enable CTA pointing to Cookiez settings when Cookiez is active', async () => {
		// Arrange.
		mockFetchResponse( '<script src="https://www.googletagmanager.com/gtm.js?id=GTM-ABC123"></script>' );

		// Act.
		const result = await audit.evaluate( makeContext( { pageContext: { cookiez_plugin_active: true } } ) );

		// Assert.
		expect( result.status ).toBe( 'fail' );
		if ( 'fail' === result.status ) {
			expect( result.violations[ 0 ] ).toMatchObject( {
				ctaLabel: 'Enable',
				externalUrl: 'https://example.com/wp-admin/admin.php?page=cookiez-settings#settings',
			} );
		}
	} );

	it( 'fails with an Install CTA for Cookiez when no cookie consent plugin is active', async () => {
		// Arrange.
		mockFetchResponse( '<script src="https://www.googletagmanager.com/gtm.js?id=GTM-ABC123"></script>' );

		// Act.
		const result = await audit.evaluate( makeContext( { pageContext: { cookiez_plugin_active: false } } ) );

		// Assert.
		expect( result.status ).toBe( 'fail' );
		if ( 'fail' === result.status ) {
			expect( result.violations[ 0 ] ).toMatchObject( {
				ctaLabel: 'Install',
				installPluginSlug: 'cookiez',
				installPluginFile: 'cookiez/cookiez.php',
			} );
		}
	} );
} );
