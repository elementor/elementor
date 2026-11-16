import { audit } from '../page-excerpt';
import { makeContext } from './fixtures';

describe( audit.id, () => {
	it( 'passes when excerpt is non-empty', async () => {
		expect( await audit.evaluate( makeContext( { pageContext: { post_excerpt: 'A summary' } } ) ) ).toEqual( {
			status: 'pass',
		} );
	} );

	it( 'fails when excerpt is null', async () => {
		const result = await audit.evaluate( makeContext( { pageContext: { post_excerpt: null } } ) );
		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations[ 0 ].angieFix ).toBe( true );
		}
	} );
} );
