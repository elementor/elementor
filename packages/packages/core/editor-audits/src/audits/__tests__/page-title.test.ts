import { audit } from '../page-title';
import { makeContext } from './fixtures';

const TITLE_AT_LIMIT = 'a'.repeat( 60 );
const TITLE_OVER_LIMIT = 'a'.repeat( 61 );

describe( audit.id, () => {
	it( 'passes when title is non-empty and within 60 characters', async () => {
		expect( await audit.evaluate( makeContext( { pageContext: { post_title: 'Hello' } } ) ) ).toEqual( {
			status: 'pass',
		} );
	} );

	it( 'passes when title is exactly 60 characters', async () => {
		expect( await audit.evaluate( makeContext( { pageContext: { post_title: TITLE_AT_LIMIT } } ) ) ).toEqual( {
			status: 'pass',
		} );
	} );

	it( 'fails when title is null', async () => {
		const result = await audit.evaluate( makeContext( { pageContext: { post_title: null } } ) );
		expect( result.status ).toBe( 'fail' );
	} );

	it( 'fails when title exceeds 60 characters', async () => {
		const result = await audit.evaluate( makeContext( { pageContext: { post_title: TITLE_OVER_LIMIT } } ) );
		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations[ 0 ].label ).toContain( 'too long' );
		}
	} );
} );
