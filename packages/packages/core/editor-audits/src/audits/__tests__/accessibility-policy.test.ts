import { audit } from '../accessibility-policy';
import { makeContext } from './fixtures';

describe( audit.id, () => {
	it( 'passes when ally plugin is active', async () => {
		expect( await audit.evaluate( makeContext( { pageContext: { ally_plugin_active: true } } ) ) ).toEqual( {
			status: 'pass',
		} );
	} );

	it( 'fails when ally plugin is not active and includes externalUrl pointing to plugin install page', async () => {
		const result = await audit.evaluate( makeContext( { pageContext: { ally_plugin_active: false } } ) );

		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations[ 0 ].externalUrl ).toBe(
				'https://example.com/wp-admin/plugin-install.php?tab=plugin-information&plugin=pojo-accessibility'
			);
		}
	} );
} );
