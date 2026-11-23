import {
	getRestStatusForSiteContentFilter,
	isSiteContentListNarrowed,
} from '../site-content-status-filter';

describe( 'site-content-status-filter', () => {
	it( 'maps All to REST any status', () => {
		expect( getRestStatusForSiteContentFilter( 'all' ) ).toBe( 'any' );
	});

	it( 'maps specific filters to REST status', () => {
		expect( getRestStatusForSiteContentFilter( 'publish' ) ).toBe( 'publish' );
		expect( getRestStatusForSiteContentFilter( 'draft' ) ).toBe( 'draft' );
		expect( getRestStatusForSiteContentFilter( 'trash' ) ).toBe( 'trash' );
	} );

	it( 'detects narrowed list for status or search', () => {
		expect( isSiteContentListNarrowed( 'all', '' ) ).toBe( false );
		expect( isSiteContentListNarrowed( 'draft', '' ) ).toBe( true );
		expect( isSiteContentListNarrowed( 'all', 'home' ) ).toBe( true );
	} );
} );