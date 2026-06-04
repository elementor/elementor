import { audit } from '../robots-noindex';
import { makeContext } from './fixtures';

describe( audit.id, () => {
	it( 'passes when search engines are not discouraged', async () => {
		expect(
			await audit.evaluate( makeContext( { pageContext: { is_noindex: false } } ) )
		).toEqual( { status: 'pass' } );
	} );

	it( 'fails when search engines are discouraged and links to Reading settings', async () => {
		const result = await audit.evaluate(
			makeContext( {
				pageContext: {
					is_noindex: true,
					reading_settings_url: 'https://example.com/wp-admin/options-reading.php',
				},
			} )
		);

		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations[ 0 ].externalUrl ).toBe(
				'https://example.com/wp-admin/options-reading.php'
			);
		}
	} );
} );
