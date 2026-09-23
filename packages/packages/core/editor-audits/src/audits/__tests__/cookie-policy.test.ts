import { audit } from '../cookie-policy';
import { makeContext } from './fixtures';

describe( audit.id, () => {
	it( 'passes when cookiez plugin is active', async () => {
		expect( await audit.evaluate( makeContext( { pageContext: { cookiez_plugin_active: true } } ) ) ).toEqual( {
			status: 'pass',
		} );
	} );

	it( 'fails when cookiez plugin is not active and includes externalUrl pointing to plugin install page', async () => {
		const result = await audit.evaluate( makeContext( { pageContext: { cookiez_plugin_active: false } } ) );

		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations[ 0 ].externalUrl ).toBe(
				'https://example.com/wp-admin/plugin-install.php?tab=plugin-information&plugin=cookiez'
			);
		}
	} );
} );
