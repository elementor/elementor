import { renderHook, waitFor } from '@testing-library/react';
import usePageNameSuggestions from 'elementor/modules/home/assets/js/components/site-planner/hooks/use-page-name-suggestions';

const createResponse = ( body, ok = true ) => ( {
	ok,
	json: jest.fn().mockResolvedValue( body ),
} );

const createSettingsCache = ( entries ) => {
	const now = Date.now();
	return {
		'site-key-1': {
			sessionId: 'session-id',
			retrievedAt: new Date( now - ( 30 * 60 * 1000 ) ).toISOString(),
			pageSuggestions: [ 'Home', 'Portfolio' ],
			...entries,
		},
	};
};

const getSitePlannerData = () => ( {
	apiOrigin: 'https://planner.example.com',
	connectAuth: {
		siteKey: 'site-key-1',
		signature: 'signature',
		accessToken: 'access-token',
		clientId: 'client-id',
		homeUrl: 'https://example.com',
	},
} );

const setLocation = ( { pathname = '/wp-admin/admin.php', search = '?page=elementor-app', hash = '' } = {} ) => {
	Object.defineProperty( window, 'location', {
		writable: true,
		configurable: true,
		value: {
			...window.location,
			pathname,
			search,
			hash,
		},
	} );
};

describe( 'usePageNameSuggestions', () => {
	beforeEach( () => {
		global.fetch = jest.fn();
		window.wpApiSettings = {
			root: '/wp-json/',
			nonce: 'wp-nonce',
		};
		setLocation();
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should use cached suggestions and skip page-name-suggestions call', async () => {
		const cache = createSettingsCache( {
			retrievedAt: new Date( Date.now() - ( 60 * 60 * 1000 ) ).toISOString(),
		} );
		global.fetch.mockResolvedValueOnce( createResponse( { data: { value: cache } } ) );

		const { result } = renderHook( () =>
			usePageNameSuggestions( getSitePlannerData() ),
		);

		await waitFor( () => {
			expect( result.current.pageSuggestions ).toEqual( [ 'Home', 'Portfolio' ] );
			expect( result.current.isLoading ).toBe( false );
		} );

		expect( global.fetch ).toHaveBeenCalledTimes( 1 );
		expect( global.fetch ).toHaveBeenCalledWith(
			'/wp-json/elementor/v1/settings/elementor_site_planner_page_suggestions_cache',
			expect.objectContaining( { method: 'GET' } ),
		);
		expect( result.current.error ).toBe( null );
	} );

	it( 'should fetch suggestions when cache is empty and save result to cache', async () => {
		global.fetch
			.mockResolvedValueOnce( createResponse( { data: { value: {} } } ) )
			.mockResolvedValueOnce( createResponse( { sessionId: 'session-id' } ) )
			.mockResolvedValueOnce( createResponse( { suggestions: [ 'Blog', 'Services' ] } ) )
			.mockResolvedValueOnce( createResponse( { data: { value: true } } ) );

		const { result } = renderHook( () =>
			usePageNameSuggestions( getSitePlannerData() ),
		);

		await waitFor( () => {
			expect( result.current.pageSuggestions ).toEqual( [ 'Blog', 'Services' ] );
			expect( result.current.isLoading ).toBe( false );
			expect( result.current.error ).toBe( null );
		} );

		expect( global.fetch ).toHaveBeenCalledTimes( 4 );
		expect( global.fetch ).toHaveBeenNthCalledWith(
			1,
			'/wp-json/elementor/v1/settings/elementor_site_planner_page_suggestions_cache',
			expect.objectContaining( { method: 'GET' } ),
		);
		expect( global.fetch ).toHaveBeenNthCalledWith(
			2,
			'https://planner.example.com/website-planner/session/resolve-by-site',
			expect.objectContaining( { method: 'GET' } ),
		);
		expect( global.fetch ).toHaveBeenNthCalledWith(
			3,
			'https://planner.example.com/website-planner/sitemap/session-id/page-name-suggestions',
			expect.objectContaining( { method: 'POST' } ),
		);
	} );

	it( 'should clear cache and then fetch suggestions when on site-builder route', async () => {
		setLocation( {
			pathname: '/wp-admin/admin.php',
			search: '?page=elementor-app',
			hash: '#site-builder',
		} );

		const cache = createSettingsCache( {
			retrievedAt: new Date( Date.now() - ( 60 * 60 * 1000 ) ).toISOString(),
		} );

		global.fetch
			.mockResolvedValueOnce( createResponse( { data: { value: true } } ) )
			.mockResolvedValueOnce( createResponse( { data: { value: cache } } ) )
			.mockResolvedValueOnce( createResponse( { sessionId: 'session-id' } ) )
			.mockResolvedValueOnce( createResponse( { suggestions: [ 'Clear', 'Cache' ] } ) )
			.mockResolvedValueOnce( createResponse( { data: { value: true } } ) );

		const { result } = renderHook( () =>
			usePageNameSuggestions( getSitePlannerData() ),
		);

		await waitFor( () => {
			expect( result.current.pageSuggestions ).toEqual( [ 'Clear', 'Cache' ] );
			expect( result.current.isLoading ).toBe( false );
			expect( result.current.error ).toBe( null );
		} );

		expect( global.fetch ).toHaveBeenCalledTimes( 5 );
		expect( global.fetch ).toHaveBeenNthCalledWith(
			1,
			'/wp-json/elementor/v1/settings/elementor_site_planner_page_suggestions_cache',
			expect.objectContaining( { method: 'POST' } ),
		);
		expect( global.fetch ).toHaveBeenNthCalledWith(
			3,
			'https://planner.example.com/website-planner/session/resolve-by-site',
			expect.objectContaining( { method: 'GET' } ),
		);
		expect( global.fetch ).toHaveBeenNthCalledWith(
			4,
			'https://planner.example.com/website-planner/sitemap/session-id/page-name-suggestions',
			expect.objectContaining( { method: 'POST' } ),
		);
	} );

	it( 'should return empty suggestions when no active site planner session exists', async () => {
		global.fetch
			.mockResolvedValueOnce( createResponse( { data: { value: {} } } ) )
			.mockResolvedValueOnce( createResponse( { sessionId: null } ) );

		const { result } = renderHook( () =>
			usePageNameSuggestions( getSitePlannerData() ),
		);

		await waitFor( () => {
			expect( result.current.pageSuggestions ).toEqual( [] );
			expect( result.current.error ).toBeInstanceOf( Error );
			expect( result.current.isLoading ).toBe( false );
		} );

		expect( global.fetch ).toHaveBeenCalledTimes( 2 );
		expect( global.fetch ).toHaveBeenNthCalledWith(
			2,
			'https://planner.example.com/website-planner/session/resolve-by-site',
			expect.objectContaining( { method: 'GET' } ),
		);
	} );

	it( 'should return empty suggestions when fetch fails after cache miss', async () => {
		global.fetch
			.mockResolvedValueOnce( createResponse( { data: { value: {} } } ) )
			.mockResolvedValueOnce( createResponse( { sessionId: 'session-id' } ) )
			.mockResolvedValueOnce( { ok: false, json: jest.fn().mockResolvedValue( { message: 'planner-unreachable' } ) } );

		const { result } = renderHook( () =>
			usePageNameSuggestions( getSitePlannerData() ),
		);

		await waitFor( () => {
			expect( result.current.pageSuggestions ).toEqual( [] );
			expect( result.current.error ).toBeInstanceOf( Error );
			expect( result.current.isLoading ).toBe( false );
		} );

		expect( global.fetch ).toHaveBeenCalledTimes( 3 );
	} );
} );
