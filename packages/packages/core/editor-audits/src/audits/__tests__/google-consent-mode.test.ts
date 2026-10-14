import { audit } from '../google-consent-mode';
import { makeContext } from './fixtures';

describe( audit.id, () => {
	it( 'skips with an unpublished reason when the page has no frontend_url', async () => {
		// Act.
		const result = await audit.evaluate( makeContext( { pageContext: { frontend_url: null } } ) );

		// Assert.
		expect( result ).toEqual( { status: 'skipped', reason: 'Page is not published.' } );
	} );

	it( 'skips with a fetch-failure reason when the published page could not be fetched', async () => {
		// Act.
		const result = await audit.evaluate( makeContext( { renderedHtml: null } ) );

		// Assert.
		expect( result ).toEqual( { status: 'skipped', reason: 'Could not fetch the published page.' } );
	} );

	it( 'skips when no Google tracking product is detected on the rendered page', async () => {
		// Act.
		const result = await audit.evaluate(
			makeContext( { renderedHtml: '<html><head></head><body>Hello</body></html>' } )
		);

		// Assert.
		expect( result ).toEqual( { status: 'skipped', reason: 'No Google tracking product detected.' } );
	} );

	it( 'passes when a Google tracking product and a consent default call are both present', async () => {
		// Act.
		const result = await audit.evaluate(
			makeContext( {
				renderedHtml: `<script src="https://www.googletagmanager.com/gtm.js?id=GTM-ABC123"></script>
					 <script>gtag('consent', 'default', { ad_storage: 'denied' });</script>`,
			} )
		);

		// Assert.
		expect( result ).toEqual( { status: 'pass' } );
	} );

	it( 'fails with an Enable CTA pointing to Cookiez settings when Cookiez is installed and active', async () => {
		// Act.
		const result = await audit.evaluate(
			makeContext( {
				renderedHtml: '<script src="https://www.googletagmanager.com/gtm.js?id=GTM-ABC123"></script>',
				pageContext: { cookiez_plugin_installed: true, cookiez_plugin_active: true },
			} )
		);

		// Assert.
		expect( result.status ).toBe( 'fail' );
		if ( 'fail' === result.status ) {
			expect( result.violations[ 0 ] ).toMatchObject( {
				ctaLabel: 'Enable',
				externalUrl: 'https://example.com/wp-admin/admin.php?page=cookiez-settings#settings',
			} );
		}
	} );

	it( 'fails and links to the plugin action url when Cookiez is not installed', async () => {
		// Act.
		const result = await audit.evaluate(
			makeContext( {
				renderedHtml: '<script src="https://www.googletagmanager.com/gtm.js?id=GTM-ABC123"></script>',
				pageContext: {
					cookiez_plugin_installed: false,
					cookiez_plugin_active: false,
					cookiez_plugin_action_url: 'https://example.com/wp-admin/update.php?action=install-plugin',
				},
			} )
		);

		// Assert.
		expect( result.status ).toBe( 'fail' );
		if ( 'fail' === result.status ) {
			expect( result.violations[ 0 ].ctaLabel ).toBeUndefined();
			expect( result.violations[ 0 ].externalUrl ).toBe(
				'https://example.com/wp-admin/update.php?action=install-plugin'
			);
		}
	} );

	it( 'fails and links to the plugin action url (activate) when Cookiez is installed but not active', async () => {
		// Act.
		const result = await audit.evaluate(
			makeContext( {
				renderedHtml: '<script src="https://www.googletagmanager.com/gtm.js?id=GTM-ABC123"></script>',
				pageContext: {
					cookiez_plugin_installed: true,
					cookiez_plugin_active: false,
					cookiez_plugin_action_url: 'https://example.com/wp-admin/plugins.php?action=activate',
				},
			} )
		);

		// Assert.
		expect( result.status ).toBe( 'fail' );
		if ( 'fail' === result.status ) {
			expect( result.violations[ 0 ].externalUrl ).toBe(
				'https://example.com/wp-admin/plugins.php?action=activate'
			);
		}
	} );
} );
