import {
	DEFAULT_SITE_CONTENT_SORT,
	getRestOrderForSiteContentSort,
	getSiteContentSortLabel,
	hasActiveSiteContentSort,
	shouldPinHomepageForSiteContentSort,
} from '../site-content-sort';

describe( 'site-content-sort', () => {
	it( 'maps oldest to publish date ascending', () => {
		expect( getRestOrderForSiteContentSort( 'oldest' ) ).toEqual( {
			order: 'asc',
			orderby: 'date',
		} );
	} );

	it( 'maps newest to publish date descending', () => {
		expect( getRestOrderForSiteContentSort( 'newest' ) ).toEqual( {
			order: 'desc',
			orderby: 'date',
		} );
	} );

	it( 'treats oldest as the default sort without a chip', () => {
		expect( hasActiveSiteContentSort( DEFAULT_SITE_CONTENT_SORT ) ).toBe( false );
		expect( hasActiveSiteContentSort( 'newest' ) ).toBe( true );
	} );

	it( 'pins the homepage only for oldest', () => {
		expect( shouldPinHomepageForSiteContentSort( 'oldest' ) ).toBe( true );
		expect( shouldPinHomepageForSiteContentSort( 'newest' ) ).toBe( false );
	} );

	it( 'exposes translated sort labels', () => {
		expect( getSiteContentSortLabel( 'oldest' ) ).toBeTruthy();
		expect( getSiteContentSortLabel( 'newest' ) ).toBeTruthy();
	} );
} );
