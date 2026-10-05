import { audit } from '../accessibility-statement';
import { makeContext } from './fixtures';

describe( audit.id, () => {
	it( 'passes when ally plugin is active and a statement has been created', async () => {
		expect(
			await audit.evaluate(
				makeContext( {
					pageContext: { ally_plugin_active: true, ally_accessibility_statement_created: true },
				} )
			)
		).toEqual( { status: 'pass' } );
	} );

	it( 'fails when ally plugin is not active and includes externalUrl pointing to the plugin install page', async () => {
		const result = await audit.evaluate(
			makeContext( { pageContext: { ally_plugin_active: false, ally_accessibility_statement_created: false } } )
		);

		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations[ 0 ].externalUrl ).toBe(
				'https://example.com/wp-admin/plugin-install.php?tab=plugin-information&plugin=pojo-accessibility'
			);
			expect( result.violations[ 0 ].ctaLabel ).toBe( 'Create' );
		}
	} );

	it( 'fails when ally plugin is active but no statement has been created, linking to the statement page', async () => {
		const result = await audit.evaluate(
			makeContext( { pageContext: { ally_plugin_active: true, ally_accessibility_statement_created: false } } )
		);

		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations[ 0 ].externalUrl ).toBe(
				'https://example.com/wp-admin/admin.php?page=accessibility-settings#accessibilityStatement'
			);
			expect( result.violations[ 0 ].ctaLabel ).toBe( 'Create' );
			expect( result.violations[ 0 ].secondaryCtaLabel ).toBe( 'Learn more' );
			expect( result.violations[ 0 ].secondaryCtaUrl ).toBe( 'https://go.elementor.com/acc-plg-learn-more' );
		}
	} );
} );
