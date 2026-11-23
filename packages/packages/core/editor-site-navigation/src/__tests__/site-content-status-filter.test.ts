import {
	EMPTY_SITE_CONTENT_STATUS_FILTERS,
	getRestStatusForSiteContentFilters,
	hasActiveSiteContentStatusFilters,
	isSiteContentListNarrowed,
	toggleSiteContentStatusFilter,
} from '../site-content-status-filter';

describe( 'site-content-status-filter', () => {
	it( 'maps empty filters to REST any status', () => {
		expect( getRestStatusForSiteContentFilters( EMPTY_SITE_CONTENT_STATUS_FILTERS ) ).toBe( 'any' );
	} );

	it( 'maps combined publish and draft filters', () => {
		expect(
			getRestStatusForSiteContentFilters( {
				draft: true,
				publish: true,
				trash: false,
			} )
		).toBe( 'publish,draft' );
	} );

	it( 'uses trash exclusively in REST status', () => {
		expect(
			getRestStatusForSiteContentFilters( {
				draft: false,
				publish: false,
				trash: true,
			} )
		).toBe( 'trash' );
	} );

	it( 'toggle keeps trash exclusive', () => {
		expect(
			toggleSiteContentStatusFilter(
				{
					draft: true,
					publish: false,
					trash: false,
				},
				'trash'
			)
		).toEqual( {
			draft: false,
			publish: false,
			trash: true,
		} );
	} );

	it( 'toggle clears trash when selecting publish or draft', () => {
		expect(
			toggleSiteContentStatusFilter(
				{
					draft: false,
					publish: false,
					trash: true,
				},
				'publish'
			)
		).toEqual( {
			draft: false,
			publish: true,
			trash: false,
		} );
	} );

	it( 'detects narrowed list for filters or search', () => {
		expect( isSiteContentListNarrowed( EMPTY_SITE_CONTENT_STATUS_FILTERS, '' ) ).toBe( false );
		expect(
			isSiteContentListNarrowed(
				{
					draft: true,
					publish: false,
					trash: false,
				},
				''
			)
		).toBe( true );
		expect( isSiteContentListNarrowed( EMPTY_SITE_CONTENT_STATUS_FILTERS, 'home' ) ).toBe( true );
	} );

	it( 'detects active filters', () => {
		expect( hasActiveSiteContentStatusFilters( EMPTY_SITE_CONTENT_STATUS_FILTERS ) ).toBe( false );
		expect(
			hasActiveSiteContentStatusFilters( {
				draft: false,
				publish: true,
				trash: false,
			} )
		).toBe( true );
	} );
} );
