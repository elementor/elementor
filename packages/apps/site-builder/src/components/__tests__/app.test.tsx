import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import apiFetch from '@wordpress/api-fetch';

import { App } from '../app';
import { PlannerSteps } from '../../utils/planner-steps';

jest.mock( '@wordpress/api-fetch' );

const mockApiFetch = jest.mocked( apiFetch );

const AUTH_PATH = '/elementor/v1/site-builder/auth';
const HOME_SCREEN_PATH = '/elementor/v1/site-builder/home-screen';
const SNAPSHOT_PATH = '/elementor/v1/site-builder/snapshot';

const BASE_IFRAME_URL = 'https://planner.elementor.com/chat.html';

const validAuthPayload = {
	success: true,
	data: {
		signature: 'test-sig',
		accessToken: 'test-token',
		clientId: 'test-client',
		homeUrl: 'https://example.com/',
		siteKey: 'test-key',
	},
};

type ApiFetchOptions = {
	path?: string;
	method?: string;
};

const setupApiFetchMock = ( homeScreenResponse: Record<string, unknown> = {} ) => {
	mockApiFetch.mockImplementation( ( options: ApiFetchOptions ) => {
		if ( options.path === AUTH_PATH ) {
			return Promise.resolve( validAuthPayload );
		}

		if ( options.path === HOME_SCREEN_PATH ) {
			return Promise.resolve( homeScreenResponse );
		}

		if ( options.path === SNAPSHOT_PATH && options.method === 'POST' ) {
			return Promise.resolve( {} );
		}

		return Promise.reject( new Error( `Unexpected apiFetch call: ${ options.path }` ) );
	} );
};

describe( 'App - ConnectAuth Fetch', () => {
	beforeEach( () => {
		window.wpApiSettings = {
			root: '/wp-json/',
			nonce: 'test-nonce',
		};

		window.elementorAppConfig = {
			'site-builder': {
				iframeUrl: BASE_IFRAME_URL,
				isAdmin: true,
				exitTo: '/wp-admin/admin.php?page=elementor',
			},
		};

		mockApiFetch.mockReset();
		setupApiFetchMock();
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'fetches connectAuth and home-screen on mount', async () => {
		render( <App /> );

		await waitFor( () => {
			expect( mockApiFetch ).toHaveBeenCalledWith( { path: AUTH_PATH } );
			expect( mockApiFetch ).toHaveBeenCalledWith( { path: HOME_SCREEN_PATH } );
		} );

		expect( mockApiFetch ).toHaveBeenCalledWith( {
			path: SNAPSHOT_PATH,
			method: 'POST',
			data: { value: {} },
		} );
	} );

	it( 'shows loader while home-screen is loading', () => {
		mockApiFetch.mockImplementation( () => new Promise( () => {} ) );

		render( <App /> );

		expect( screen.getByRole( 'progressbar' ) ).toBeInTheDocument();
		expect( screen.queryByTitle( 'Website Planner' ) ).not.toBeInTheDocument();
	} );

	it( 'renders iframe with base URL when home-screen has no session', async () => {
		render( <App /> );

		const iframe = await screen.findByTitle( 'Website Planner' );

		expect( iframe ).toHaveAttribute( 'src', BASE_IFRAME_URL );
	} );

	it( 'renders iframe with deep-link URL when home-screen returns session and step', async () => {
		setupApiFetchMock( {
			sessionId: '78c84365-954a-4c32-bfb8-81fe36465fb8',
			step: PlannerSteps.WIREFRAMES,
		} );

		render( <App /> );

		const iframe = await screen.findByTitle( 'Website Planner' );

		expect( iframe ).toHaveAttribute(
			'src',
			'https://planner.elementor.com/wireframe.html?session=78c84365-954a-4c32-bfb8-81fe36465fb8'
		);
	} );

	it( 'falls back to base URL when home-screen fetch fails', async () => {
		mockApiFetch.mockImplementation( ( options: ApiFetchOptions ) => {
			if ( options.path === AUTH_PATH ) {
				return Promise.resolve( validAuthPayload );
			}

			if ( options.path === HOME_SCREEN_PATH ) {
				return Promise.reject( new Error( 'Home screen unavailable' ) );
			}

			if ( options.path === SNAPSHOT_PATH && options.method === 'POST' ) {
				return Promise.resolve( {} );
			}

			return Promise.reject( new Error( 'Unexpected' ) );
		} );

		render( <App /> );

		const iframe = await screen.findByTitle( 'Website Planner' );

		expect( iframe ).toHaveAttribute( 'src', BASE_IFRAME_URL );
	} );

	it( 'handles network errors gracefully', async () => {
		const consoleErrorSpy = jest.spyOn( console, 'error' ).mockImplementation();

		mockApiFetch.mockImplementation( ( options: ApiFetchOptions ) => {
			if ( options.path === AUTH_PATH ) {
				return Promise.reject( new Error( 'Network error' ) );
			}

			if ( options.path === HOME_SCREEN_PATH ) {
				return Promise.resolve( {} );
			}

			if ( options.path === SNAPSHOT_PATH && options.method === 'POST' ) {
				return Promise.resolve( {} );
			}

			return Promise.reject( new Error( 'Unexpected' ) );
		} );

		render( <App /> );

		await waitFor( () => {
			expect( consoleErrorSpy ).toHaveBeenCalledWith( 'Failed to fetch connectAuth:', expect.any( Error ) );
		} );

		await screen.findByTitle( 'Website Planner' );

		consoleErrorSpy.mockRestore();
	} );

	it( 'handles non-ok HTTP response', async () => {
		const consoleErrorSpy = jest.spyOn( console, 'error' ).mockImplementation();

		mockApiFetch.mockImplementation( ( options: ApiFetchOptions ) => {
			if ( options.path === AUTH_PATH ) {
				return Promise.reject( new Error( 'Request failed' ) );
			}

			if ( options.path === HOME_SCREEN_PATH ) {
				return Promise.resolve( {} );
			}

			if ( options.path === SNAPSHOT_PATH && options.method === 'POST' ) {
				return Promise.resolve( {} );
			}

			return Promise.reject( new Error( 'Unexpected' ) );
		} );

		render( <App /> );

		await waitFor( () => {
			expect( consoleErrorSpy ).toHaveBeenCalled();
		} );

		consoleErrorSpy.mockRestore();
	} );

	it( 'handles response with success:false', async () => {
		const consoleErrorSpy = jest.spyOn( console, 'error' ).mockImplementation();

		mockApiFetch.mockImplementation( ( options: ApiFetchOptions ) => {
			if ( options.path === AUTH_PATH ) {
				return Promise.resolve( { success: false } );
			}

			if ( options.path === HOME_SCREEN_PATH ) {
				return Promise.resolve( {} );
			}

			if ( options.path === SNAPSHOT_PATH && options.method === 'POST' ) {
				return Promise.resolve( {} );
			}

			return Promise.reject( new Error( 'Unexpected' ) );
		} );

		render( <App /> );

		await waitFor( () => {
			expect( consoleErrorSpy ).toHaveBeenCalled();
		} );

		consoleErrorSpy.mockRestore();
	} );

	it( 'skips snapshot request when wpApiSettings nonce is missing', async () => {
		delete window.wpApiSettings;

		mockApiFetch.mockImplementation( ( options: ApiFetchOptions ) => {
			if ( options.path === AUTH_PATH ) {
				return Promise.resolve( validAuthPayload );
			}

			if ( options.path === HOME_SCREEN_PATH ) {
				return Promise.resolve( {} );
			}

			return Promise.reject( new Error( 'Unexpected' ) );
		} );

		render( <App /> );

		await waitFor( () => {
			expect( mockApiFetch ).toHaveBeenCalledWith( { path: AUTH_PATH } );
			expect( mockApiFetch ).toHaveBeenCalledWith( { path: HOME_SCREEN_PATH } );
		} );

		expect( mockApiFetch ).not.toHaveBeenCalledWith(
			expect.objectContaining( { path: SNAPSHOT_PATH, method: 'POST' } )
		);
	} );

	it( 'rejects response with missing required Connect fields', async () => {
		const consoleErrorSpy = jest.spyOn( console, 'error' ).mockImplementation();

		mockApiFetch.mockImplementation( ( options: ApiFetchOptions ) => {
			if ( options.path === AUTH_PATH ) {
				return Promise.resolve( {
					success: true,
					data: {
						signature: 'test-sig',
						accessToken: 'test-token',
					},
				} );
			}

			if ( options.path === HOME_SCREEN_PATH ) {
				return Promise.resolve( {} );
			}

			if ( options.path === SNAPSHOT_PATH && options.method === 'POST' ) {
				return Promise.resolve( {} );
			}

			return Promise.reject( new Error( 'Unexpected' ) );
		} );

		render( <App /> );

		await waitFor( () => {
			expect( consoleErrorSpy ).toHaveBeenCalledWith(
				'Failed to fetch connectAuth:',
				expect.objectContaining( {
					message: expect.stringContaining( 'missing required Connect fields' ),
				} )
			);
		} );

		consoleErrorSpy.mockRestore();
	} );

	it( 'rejects response with non-string field types', async () => {
		const consoleErrorSpy = jest.spyOn( console, 'error' ).mockImplementation();

		mockApiFetch.mockImplementation( ( options: ApiFetchOptions ) => {
			if ( options.path === AUTH_PATH ) {
				return Promise.resolve( {
					success: true,
					data: {
						signature: 'test-sig',
						accessToken: 123,
						clientId: 'test-client',
						homeUrl: 'https://example.com/',
						siteKey: 'test-key',
					},
				} );
			}

			if ( options.path === HOME_SCREEN_PATH ) {
				return Promise.resolve( {} );
			}

			if ( options.path === SNAPSHOT_PATH && options.method === 'POST' ) {
				return Promise.resolve( {} );
			}

			return Promise.reject( new Error( 'Unexpected' ) );
		} );

		render( <App /> );

		await waitFor( () => {
			expect( consoleErrorSpy ).toHaveBeenCalledWith(
				'Failed to fetch connectAuth:',
				expect.objectContaining( {
					message: expect.stringContaining( 'missing required Connect fields' ),
				} )
			);
		} );

		consoleErrorSpy.mockRestore();
	} );

	it( 'rejects response with empty string fields', async () => {
		const consoleErrorSpy = jest.spyOn( console, 'error' ).mockImplementation();

		mockApiFetch.mockImplementation( ( options: ApiFetchOptions ) => {
			if ( options.path === AUTH_PATH ) {
				return Promise.resolve( {
					success: true,
					data: {
						signature: '',
						accessToken: 'test-token',
						clientId: 'test-client',
						homeUrl: 'https://example.com/',
						siteKey: 'test-key',
					},
				} );
			}

			if ( options.path === HOME_SCREEN_PATH ) {
				return Promise.resolve( {} );
			}

			if ( options.path === SNAPSHOT_PATH && options.method === 'POST' ) {
				return Promise.resolve( {} );
			}

			return Promise.reject( new Error( 'Unexpected' ) );
		} );

		render( <App /> );

		await waitFor( () => {
			expect( consoleErrorSpy ).toHaveBeenCalledWith(
				'Failed to fetch connectAuth:',
				expect.objectContaining( {
					message: expect.stringContaining( 'missing required Connect fields' ),
				} )
			);
		} );

		consoleErrorSpy.mockRestore();
	} );
} );
