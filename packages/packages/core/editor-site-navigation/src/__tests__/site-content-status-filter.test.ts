import {
	EMPTY_SITE_CONTENT_STATUS_FILTERS,
	getRestStatusForSiteContentFilters,
	getSiteContentStatusFilterForCount,
	hasActiveSiteContentStatusFilters,
	isSiteContentListNarrowed,
	shouldShowSiteContentStatusFilterRow,
	toggleSiteContentStatusFilter,
} from '../site-content-status-filter';

describe( 'site-content-status-filter', () => {
	it( 'maps empty filters to REST any status', () => {
		expect( getRestStatusForSiteContentFilters( EMPTY_SITE_CONTENT_STATUS_FILTERS ) ).toBe( 'any' );
	} );

	it( 'maps combined publish and draft filters', () => {
		expect(
			getRestStatusForSiteContentFilters( {
				...EMPTY_SITE_CONTENT_STATUS_FILTERS,
				draft: true,
				publish: true,
			} )
		).toBe( 'publish,draft' );
	} );

	it( 'maps combined non-trash filters including scheduled', () => {
		expect(
			getRestStatusForSiteContentFilters( {
				...EMPTY_SITE_CONTENT_STATUS_FILTERS,
				future: true,
				pending: true,
				publish: true,
			} )
		).toBe( 'publish,pending,future' );
	} );

	it( 'uses trash exclusively in REST status', () => {
		expect(
			getRestStatusForSiteContentFilters( {
				...EMPTY_SITE_CONTENT_STATUS_FILTERS,
				trash: true,
			} )
		).toBe( 'trash' );
	} );

	it( 'toggle keeps trash exclusive', () => {
		expect(
			toggleSiteContentStatusFilter(
				{
					...EMPTY_SITE_CONTENT_STATUS_FILTERS,
					draft: true,
				},
				'trash'
			)
		).toEqual( {
			...EMPTY_SITE_CONTENT_STATUS_FILTERS,
			trash: true,
		} );
	} );

	it( 'toggle clears trash when selecting publish or draft', () => {
		expect(
			toggleSiteContentStatusFilter(
				{
					...EMPTY_SITE_CONTENT_STATUS_FILTERS,
					trash: true,
				},
				'publish'
			)
		).toEqual( {
			...EMPTY_SITE_CONTENT_STATUS_FILTERS,
			publish: true,
		} );
	} );

	it( 'detects narrowed list for filters or search', () => {
		expect( isSiteContentListNarrowed( EMPTY_SITE_CONTENT_STATUS_FILTERS, '' ) ).toBe( false );
		expect(
			isSiteContentListNarrowed(
				{
					...EMPTY_SITE_CONTENT_STATUS_FILTERS,
					draft: true,
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
				...EMPTY_SITE_CONTENT_STATUS_FILTERS,
				publish: true,
			} )
		).toBe( true );
	} );

	it( 'builds a single-status filter object for count queries', () => {
		expect( getSiteContentStatusFilterForCount( 'publish' ) ).toEqual( {
			...EMPTY_SITE_CONTENT_STATUS_FILTERS,
			publish: true,
		} );
		expect( getSiteContentStatusFilterForCount( 'trash' ) ).toEqual( {
			...EMPTY_SITE_CONTENT_STATUS_FILTERS,
			trash: true,
		} );
	} );

	it( 'hides filter rows with zero count when counts are loaded', () => {
		expect( shouldShowSiteContentStatusFilterRow( 0, false, false ) ).toBe( false );
		expect( shouldShowSiteContentStatusFilterRow( 3, false, false ) ).toBe( true );
		expect( shouldShowSiteContentStatusFilterRow( undefined, false, false ) ).toBe( false );
		expect( shouldShowSiteContentStatusFilterRow( 0, true, false ) ).toBe( false );
		expect( shouldShowSiteContentStatusFilterRow( 0, false, true ) ).toBe( true );
	} );
} );
