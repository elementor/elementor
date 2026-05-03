import { renderHook, waitFor } from '@testing-library/react';
import useSiteBuilderState from 'elementor/modules/home/assets/js/site-builder/hooks/use-site-builder-state';

const SETTINGS_URL = '/wp-json/elementor/v1/site-builder/snapshot';
const HOME_SCREEN_URL = '/wp-json/elementor/v1/site-builder/home-screen';

const createResponse = ( body, ok = true ) => ( {
	ok,
	json: jest.fn().mockResolvedValue( body ),
} );

const PLANNER_STEPS = {
	INIT: 0,
	CHAT: 1,
	SITEMAP: 2,
	WIREFRAMES: 3,
	DEPLOYING: 4,
	DEPLOYED_TO_PLUGIN: 6,
};

const getSiteBuilderData = ( snapshot = {} ) => ( {
	siteKey: 'site-key-1',
	plannerSteps: PLANNER_STEPS,
	site_builder_snapshot: snapshot,
} );

describe( 'useSiteBuilderState', () => {
	beforeEach( () => {
		global.fetch = jest.fn();
		window.wpApiSettings = {
			root: '/wp-json/',
			nonce: 'wp-nonce',
		};
		window.elementorHomeScreenData = {
			wpRestNonce: 'wp-nonce',
		};
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'returns empty state when siteKey is missing', async () => {
		const { result } = renderHook( () => useSiteBuilderState( {} ) );

		await waitFor( () => {
			expect( result.current.isLoading ).toBe( false );
		} );

		expect( result.current.sessionStep ).toBe( null );
		expect( result.current.pageSuggestions ).toEqual( [] );
		expect( global.fetch ).toHaveBeenCalledTimes( 0 );
	} );

	it( 'Scenario 3: uses injected snapshot and skips every HTTP call', async () => {
		const snapshot = {
			'site-key-1': {
				sessionId: 'session-id',
				step: 3,
				pageSuggestions: [ 'Home', 'Portfolio' ],
				siteTypeSuggestions: [ 'Photography website', 'Portfolio website', 'Blog' ],
			},
		};

		const { result } = renderHook( () => useSiteBuilderState( getSiteBuilderData( snapshot ) ) );

		await waitFor( () => {
			expect( result.current.isLoading ).toBe( false );
		} );

		expect( result.current.sessionStep ).toBe( 3 );
		expect( result.current.pageSuggestions ).toEqual( [ 'Home', 'Portfolio' ] );
		expect( result.current.siteTypeSuggestions ).toEqual( [ 'Photography website', 'Portfolio website', 'Blog' ] );
		expect( global.fetch ).toHaveBeenCalledTimes( 0 );
	} );

	it( 'Scenario 3b: uses injected snapshot with step 6 (DEPLOYED_TO_PLUGIN) and skips every HTTP call', async () => {
		const snapshot = {
			'site-key-1': {
				sessionId: 'session-id',
				step: 6,
				pageSuggestions: [ 'About', 'Services', 'Contact' ],
				siteTypeSuggestions: [],
			},
		};

		const { result } = renderHook( () => useSiteBuilderState( getSiteBuilderData( snapshot ) ) );

		await waitFor( () => {
			expect( result.current.isLoading ).toBe( false );
		} );

		expect( result.current.sessionStep ).toBe( 6 );
		expect( result.current.pageSuggestions ).toEqual( [ 'About', 'Services', 'Contact' ] );
		expect( result.current.siteTypeSuggestions ).toEqual( [] );
		expect( global.fetch ).toHaveBeenCalledTimes( 0 );
	} );

	it( 'Scenario 2a: pre-deployment step without pageSuggestions field — resolves without fetching', async () => {
		const snapshot = {
			'site-key-1': {
				sessionId: 'session-id',
				step: 2,
				siteTypeSuggestions: [ 'Dental Practice', 'Medical Clinic', 'Health & Wellness' ],
			},
		};

		const { result } = renderHook( () => useSiteBuilderState( getSiteBuilderData( snapshot ) ) );

		await waitFor( () => {
			expect( result.current.isLoading ).toBe( false );
		} );

		expect( result.current.sessionStep ).toBe( 2 );
		expect( result.current.pageSuggestions ).toEqual( [] );
		expect( result.current.siteTypeSuggestions ).toEqual(
			[ 'Dental Practice', 'Medical Clinic', 'Health & Wellness' ],
		);
		expect( global.fetch ).toHaveBeenCalledTimes( 0 );
	} );

	it( 'Scenario 1: no snapshot — fetches /home-screen and writes snapshot', async () => {
		global.fetch
			.mockResolvedValueOnce( createResponse( { sessionId: 'session-id', step: 3, pageNameSuggestions: [ 'Blog', 'Services' ], siteTypeSuggestions: [] } ) )
			.mockResolvedValueOnce( createResponse( { data: { value: true } } ) );

		const { result } = renderHook( () => useSiteBuilderState( getSiteBuilderData() ) );

		await waitFor( () => {
			expect( result.current.isLoading ).toBe( false );
		} );

		expect( result.current.sessionStep ).toBe( 3 );
		expect( result.current.pageSuggestions ).toEqual( [ 'Blog', 'Services' ] );
		expect( result.current.siteTypeSuggestions ).toEqual( [] );
		expect( result.current.error ).toBe( null );
		expect( global.fetch ).toHaveBeenCalledTimes( 2 );
		expect( global.fetch ).toHaveBeenNthCalledWith( 1, HOME_SCREEN_URL, expect.objectContaining( { method: 'GET' } ) );
		expect( global.fetch ).toHaveBeenNthCalledWith( 2, SETTINGS_URL, expect.objectContaining( {
			method: 'POST',
			body: JSON.stringify( {
				value: {
					'site-key-1': {
						sessionId: 'session-id',
						step: 3,
						pageSuggestions: [ 'Blog', 'Services' ],
						siteTypeSuggestions: [],
					},
				},
			} ),
		} ) );
	} );

	it( 'Scenario 1 no-session: persists backend siteTypeSuggestions in the snapshot', async () => {
		global.fetch
			.mockResolvedValueOnce( createResponse( {
				sessionId: null,
				step: null,
				pageNameSuggestions: [],
				siteTypeSuggestions: [ 'Dental Practice', 'Medical Clinic', 'Health & Wellness' ],
			} ) )
			.mockResolvedValueOnce( createResponse( { data: { value: true } } ) );

		const { result } = renderHook( () => useSiteBuilderState( getSiteBuilderData() ) );

		await waitFor( () => {
			expect( result.current.isLoading ).toBe( false );
		} );

		expect( result.current.sessionStep ).toBe( null );
		expect( result.current.siteTypeSuggestions ).toEqual(
			[ 'Dental Practice', 'Medical Clinic', 'Health & Wellness' ],
		);
		expect( global.fetch ).toHaveBeenNthCalledWith( 2, SETTINGS_URL, expect.objectContaining( {
			method: 'POST',
			body: JSON.stringify( {
				value: {
					'site-key-1': {
						sessionId: null,
						step: null,
						pageSuggestions: [],
						siteTypeSuggestions: [ 'Dental Practice', 'Medical Clinic', 'Health & Wellness' ],
					},
				},
			} ),
		} ) );
	} );

	it( 'Scenario 1 no-session with missing siteTypeSuggestions: keeps the sanitized empty list from the backend', async () => {
		global.fetch
			.mockResolvedValueOnce( createResponse( { sessionId: null, step: null, pageNameSuggestions: [] } ) )
			.mockResolvedValueOnce( createResponse( { data: { value: true } } ) );

		const { result } = renderHook( () => useSiteBuilderState( getSiteBuilderData() ) );

		await waitFor( () => {
			expect( result.current.isLoading ).toBe( false );
		} );

		expect( result.current.siteTypeSuggestions ).toEqual( [] );
	} );

	it( 'Scenario 9: step DEPLOYED_TO_PLUGIN with empty pageSuggestions — fetches /home-screen and writes snapshot', async () => {
		const snapshot = {
			'site-key-1': {
				sessionId: 'session-id',
				step: 6,
				pageSuggestions: [],
				siteTypeSuggestions: [],
			},
		};
		global.fetch
			.mockResolvedValueOnce( createResponse( { sessionId: 'session-id', step: 6, pageNameSuggestions: [ 'Home', 'Services' ], siteTypeSuggestions: [] } ) )
			.mockResolvedValueOnce( createResponse( { data: { value: true } } ) );

		const { result } = renderHook( () => useSiteBuilderState( getSiteBuilderData( snapshot ) ) );

		await waitFor( () => {
			expect( result.current.isLoading ).toBe( false );
		} );

		expect( result.current.sessionStep ).toBe( 6 );
		expect( result.current.pageSuggestions ).toEqual( [ 'Home', 'Services' ] );
		expect( global.fetch ).toHaveBeenCalledTimes( 2 );
		expect( global.fetch ).toHaveBeenNthCalledWith( 1, HOME_SCREEN_URL, expect.objectContaining( { method: 'GET' } ) );
	} );

	it( 'entry exists with null step — resolves to default state without fetching', async () => {
		const snapshot = {
			'site-key-1': {
				sessionId: null,
				step: null,
				pageSuggestions: [],
				siteTypeSuggestions: [ 'Dental Practice', 'Medical Clinic', 'Health & Wellness' ],
			},
		};

		const { result } = renderHook( () => useSiteBuilderState( getSiteBuilderData( snapshot ) ) );

		await waitFor( () => {
			expect( result.current.isLoading ).toBe( false );
		} );

		expect( result.current.sessionStep ).toBe( null );
		expect( result.current.pageSuggestions ).toEqual( [] );
		expect( result.current.siteTypeSuggestions ).toEqual(
			[ 'Dental Practice', 'Medical Clinic', 'Health & Wellness' ],
		);
		expect( global.fetch ).toHaveBeenCalledTimes( 0 );
	} );

	it( 'surfaces an error when /home-screen fails and exposes default siteTypeSuggestions', async () => {
		global.fetch.mockResolvedValueOnce( { ok: false, json: jest.fn().mockResolvedValue( { message: 'planner-unreachable' } ) } );

		const { result } = renderHook( () => useSiteBuilderState( getSiteBuilderData() ) );

		await waitFor( () => {
			expect( result.current.isLoading ).toBe( false );
		} );

		expect( result.current.pageSuggestions ).toEqual( [] );
		expect( result.current.siteTypeSuggestions ).toEqual(
			[ 'Business website', 'Portfolio website', 'E-commerce store' ],
		);
		expect( result.current.error ).toBeInstanceOf( Error );
		expect( global.fetch ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'Scenario 2a: pre-deployment step with pageSuggestions already set — no fetch', async () => {
		const snapshot = {
			'site-key-1': {
				sessionId: 'session-id',
				step: 2,
				pageSuggestions: [],
				siteTypeSuggestions: [ 'Dental Practice' ],
			},
		};

		const { result } = renderHook( () => useSiteBuilderState( getSiteBuilderData( snapshot ) ) );

		await waitFor( () => {
			expect( result.current.isLoading ).toBe( false );
		} );

		expect( result.current.sessionStep ).toBe( 2 );
		expect( global.fetch ).toHaveBeenCalledTimes( 0 );
	} );
} );
