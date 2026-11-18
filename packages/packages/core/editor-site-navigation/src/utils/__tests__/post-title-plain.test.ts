import { getPostTitlePlain, postTitleMatchesSearch } from '../post-title-plain';

describe( 'post-title-plain', () => {
	it( 'should decode HTML entities in titles', () => {
		expect( getPostTitlePlain( 'Tom &amp; Jerry' ) ).toBe( 'Tom & Jerry' );
	} );

	it( 'should match search case-insensitively', () => {
		expect( postTitleMatchesSearch( 'Hello World', 'world' ) ).toBe( true );
		expect( postTitleMatchesSearch( 'Hello World', 'missing' ) ).toBe( false );
	} );

	it( 'should match all posts when search is empty', () => {
		expect( postTitleMatchesSearch( 'Hello World', '' ) ).toBe( true );
		expect( postTitleMatchesSearch( 'Hello World', '   ' ) ).toBe( true );
	} );
} );
