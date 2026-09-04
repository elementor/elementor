import { audit } from '../scan-for-cookies';
import { makeContext } from './fixtures';

describe( audit.id, () => {
	it( 'fails and links to the scan screen when cookiez is installed and active', async () => {
		const result = await audit.evaluate(
			makeContext( { pageContext: { cookiez_plugin_installed: true, cookiez_plugin_active: true } } )
		);

		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations[ 0 ].externalUrl ).toBe(
				'https://example.com/wp-admin/admin.php?page=cookiez-settings#cookie-management'
			);
		}
	} );

	it( 'fails and links to the plugin install page when cookiez is not installed', async () => {
		const result = await audit.evaluate(
			makeContext( { pageContext: { cookiez_plugin_installed: false, cookiez_plugin_active: false } } )
		);

		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations[ 0 ].externalUrl ).toBe(
				'https://example.com/wp-admin/plugin-install.php?tab=plugin-information&plugin=cookiez'
			);
		}
	} );

	it( 'fails and links to the plugin install page when cookiez is installed but not active', async () => {
		const result = await audit.evaluate(
			makeContext( { pageContext: { cookiez_plugin_installed: true, cookiez_plugin_active: false } } )
		);

		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations[ 0 ].externalUrl ).toBe(
				'https://example.com/wp-admin/plugin-install.php?tab=plugin-information&plugin=cookiez'
			);
		}
	} );

	it( 'never contributes to the compliance score', () => {
		expect( audit.weight ).toBe( 0 );
	} );
} );
