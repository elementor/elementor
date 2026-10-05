import { audit } from '../accessibility-widget';
import { makeContext } from './fixtures';

describe( audit.id, () => {
	it( 'skips with an unpublished reason when the page has no frontend_url', async () => {
		// Act.
		const result = await audit.evaluate( makeContext( { pageContext: { frontend_url: null } } ) );

		// Assert.
		expect( result ).toEqual( { status: 'skipped', reason: 'Page is not published.' } );
	} );

	it( 'passes when the Ally widget script is present in the fetched HTML', async () => {
		// Act.
		const result = await audit.evaluate(
			makeContext( {
				renderedHtml: '<script src="https://cdn.elementor.com/a11y/widget.js?api_key=abc"></script>',
			} )
		);

		// Assert.
		expect( result ).toEqual( { status: 'pass' } );
	} );

	it( 'fails and links to the plugin install url when Ally is not installed and no widget script is found', async () => {
		// Act.
		const result = await audit.evaluate(
			makeContext( {
				renderedHtml: '<html><head></head><body>Hello</body></html>',
				pageContext: {
					ally_plugin_active: false,
					ally_plugin_url:
						'https://example.com/wp-admin/plugin-install.php?tab=plugin-information&plugin=pojo-accessibility',
				},
			} )
		);

		// Assert.
		expect( result.status ).toBe( 'fail' );
		if ( result.status === 'fail' ) {
			expect( result.violations[ 0 ].externalUrl ).toBe(
				'https://example.com/wp-admin/plugin-install.php?tab=plugin-information&plugin=pojo-accessibility'
			);
			expect( result.violations[ 0 ].ctaLabel ).toBe( 'Activate' );
		}
	} );

	it( 'fails and links to the widget capabilities page when Ally is active but no widget script is found', async () => {
		// Act.
		const result = await audit.evaluate(
			makeContext( {
				renderedHtml: '<html><head></head><body>Hello</body></html>',
				pageContext: { ally_plugin_active: true },
			} )
		);

		// Assert.
		expect( result.status ).toBe( 'fail' );
		if ( result.status === 'fail' ) {
			expect( result.violations[ 0 ].externalUrl ).toBe(
				'https://example.com/wp-admin/admin.php?page=accessibility-settings#capabilities'
			);
		}
	} );

	it( 'skips with a fetch-failure reason when the published page could not be fetched', async () => {
		// Act.
		const result = await audit.evaluate(
			makeContext( { renderedHtml: null, pageContext: { ally_plugin_active: true } } )
		);

		// Assert.
		expect( result ).toEqual( { status: 'skipped', reason: 'Could not fetch the published page.' } );
	} );
} );
