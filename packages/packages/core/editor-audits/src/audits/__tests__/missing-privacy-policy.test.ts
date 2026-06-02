import { descriptor, evaluator } from '../missing-privacy-policy';
import { makeContext } from './fixtures';

describe( descriptor.id, () => {
	it( 'passes when privacy policy url is set', async () => {
		expect(
			await evaluator(
				makeContext( { pageContext: { privacy_policy_url: 'https://example.com/privacy-policy' } } )
			)
		).toEqual( { status: 'pass' } );
	} );

	it( 'fails when privacy policy url is null and includes externalUrl pointing to wp privacy settings', async () => {
		const result = await evaluator( makeContext( { pageContext: { privacy_policy_url: null } } ) );

		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations[ 0 ].externalUrl ).toBe( 'https://example.com/wp-admin/options-privacy.php' );
		}
	} );
} );
