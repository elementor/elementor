import { act, renderHook } from '@testing-library/react';

import { DEFAULT_SITE_CONTENT_SORT } from '../../site-content-sort';
import { EMPTY_SITE_CONTENT_STATUS_FILTERS } from '../../site-content-status-filter';
import { useSiteContentSectionListControls } from '../use-site-content-section-list-controls';

const SECTION_SEARCH_DEBOUNCE_MS = 300;

describe( 'useSiteContentSectionListControls', () => {
	beforeEach( () => {
		jest.useFakeTimers();
	} );

	afterEach( () => {
		jest.runOnlyPendingTimers();
		jest.useRealTimers();
	} );

	it( 'starts with empty search, default sort, and inactive status filters', () => {
		// Arrange & Act.
		const { result } = renderHook( () => useSiteContentSectionListControls() );

		// Assert.
		expect( result.current.searchQuery ).toBe( '' );
		expect( result.current.debouncedSearch ).toBe( '' );
		expect( result.current.siteContentSort ).toBe( DEFAULT_SITE_CONTENT_SORT );
		expect( result.current.statusFilters ).toEqual( EMPTY_SITE_CONTENT_STATUS_FILTERS );
	} );

	it( 'debounces trimmed search input', () => {
		// Arrange.
		const { result } = renderHook( () => useSiteContentSectionListControls() );

		// Act.
		act( () => {
			result.current.setSearchQuery( '  draft title  ' );
		} );

		// Assert.
		expect( result.current.searchQuery ).toBe( '  draft title  ' );
		expect( result.current.debouncedSearch ).toBe( '' );

		act( () => {
			jest.advanceTimersByTime( SECTION_SEARCH_DEBOUNCE_MS );
		} );

		expect( result.current.debouncedSearch ).toBe( 'draft title' );
	} );

	it( 'updates sort when setSiteContentSort is called', () => {
		// Arrange.
		const { result } = renderHook( () => useSiteContentSectionListControls() );

		// Act.
		act( () => {
			result.current.setSiteContentSort( 'newest' );
		} );

		// Assert.
		expect( result.current.siteContentSort ).toBe( 'newest' );
	} );

	it( 'toggles status filters through toggleStatusFilter', () => {
		// Arrange.
		const { result } = renderHook( () => useSiteContentSectionListControls() );

		// Act.
		act( () => {
			result.current.toggleStatusFilter( 'publish' );
		} );

		// Assert.
		expect( result.current.statusFilters.publish ).toBe( true );
		expect( result.current.statusFilters.draft ).toBe( false );
	} );

	it( 'clears sort and status filters together via clearActiveToolbarFilters', () => {
		// Arrange.
		const { result } = renderHook( () => useSiteContentSectionListControls() );

		act( () => {
			result.current.setSiteContentSort( 'newest' );
			result.current.toggleStatusFilter( 'draft' );
		} );

		// Act.
		act( () => {
			result.current.clearActiveToolbarFilters();
		} );

		// Assert.
		expect( result.current.siteContentSort ).toBe( DEFAULT_SITE_CONTENT_SORT );
		expect( result.current.statusFilters ).toEqual( EMPTY_SITE_CONTENT_STATUS_FILTERS );
	} );

	it( 'clears only sort via clearSiteContentSort', () => {
		// Arrange.
		const { result } = renderHook( () => useSiteContentSectionListControls() );

		act( () => {
			result.current.setSiteContentSort( 'newest' );
			result.current.toggleStatusFilter( 'publish' );
		} );

		// Act.
		act( () => {
			result.current.clearSiteContentSort();
		} );

		// Assert.
		expect( result.current.siteContentSort ).toBe( DEFAULT_SITE_CONTENT_SORT );
		expect( result.current.statusFilters.publish ).toBe( true );
	} );

	it( 'clears only status filters via clearStatusFilters', () => {
		// Arrange.
		const { result } = renderHook( () => useSiteContentSectionListControls() );

		act( () => {
			result.current.setSiteContentSort( 'newest' );
			result.current.toggleStatusFilter( 'trash' );
		} );

		// Act.
		act( () => {
			result.current.clearStatusFilters();
		} );

		// Assert.
		expect( result.current.siteContentSort ).toBe( 'newest' );
		expect( result.current.statusFilters ).toEqual( EMPTY_SITE_CONTENT_STATUS_FILTERS );
	} );
} );