import {
	DEFAULT_SITE_CONTENT_SORT,
	getRestOrderForSiteContentSort,
	getSiteContentSortLabel,
	hasActiveSiteContentSort,
	isSiteContentListRefinedByToolbar,
	shouldPinHomepageForSiteContentSort,
} from '../site-content-sort';
import { EMPTY_SITE_CONTENT_STATUS_FILTERS } from '../site-content-status-filter';

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

	it( 'treats active sort as refining the list for empty-state and expand', () => {
		expect(
			isSiteContentListRefinedByToolbar( EMPTY_SITE_CONTENT_STATUS_FILTERS, '', DEFAULT_SITE_CONTENT_SORT )
		).toBe( false );
		expect( isSiteContentListRefinedByToolbar( EMPTY_SITE_CONTENT_STATUS_FILTERS, '', 'newest' ) ).toBe( true );
		expect( isSiteContentListRefinedByToolbar( EMPTY_SITE_CONTENT_STATUS_FILTERS, 'about', 'oldest' ) ).toBe(
			true
		);
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
