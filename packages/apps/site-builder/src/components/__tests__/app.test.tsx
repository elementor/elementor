import * as React from 'react';
import { render, waitFor } from '@testing-library/react';
import { App } from '../app';

const mockFetch = jest.fn();
global.fetch = mockFetch;

const MOCK_REST_ROOT = '/wp-json/';
const AUTH_PATH = 'elementor/v1/site-builder/auth';

describe( 'App - ConnectAuth Fetch', () => {
	beforeEach( () => {
		window.wpApiSettings = {
			root: MOCK_REST_ROOT,
			nonce: 'test-nonce',
		};

		window.elementorAppConfig = {
			'site-builder': {
				iframeUrl: 'https://planner.elementor.com/chat.html',
				isAdmin: true,
				exitTo: '/wp-admin/admin.php?page=elementor',
			},
		};

		mockFetch.mockClear();
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'fetches connectAuth on mount via POST', async () => {
		mockFetch
			.mockResolvedValueOnce( {
				ok: true,
				json: async () => ( {
					success: true,
					data: {
						signature: 'test-sig',
						accessToken: 'test-token',
						clientId: 'test-client',
						homeUrl: 'https://example.com/',
						siteKey: 'test-key',
					},
				} ),
			} )
			.mockResolvedValueOnce( {
				ok: true,
				json: async () => ( {} ),
			} );

		render( <App /> );

		await waitFor( () => {
			expect( mockFetch ).toHaveBeenCalledWith(
				`${ MOCK_REST_ROOT }${ AUTH_PATH }`,
				expect.objectContaining( {
					method: 'POST',
					credentials: 'include',
					headers: expect.objectContaining( {
						'X-WP-Nonce': 'test-nonce',
					} ),
				} )
			);
		} );
	} );

	it( 'handles network errors gracefully', async () => {
		const consoleErrorSpy = jest.spyOn( console, 'error' ).mockImplementation();

		mockFetch
			.mockRejectedValueOnce( new Error( 'Network error' ) )
			.mockResolvedValueOnce( {
				ok: true,
				json: async () => ( {} ),
			} );

		render( <App /> );

		await waitFor( () => {
			expect( consoleErrorSpy ).toHaveBeenCalledWith(
				'Failed to fetch connectAuth:',
				expect.any( Error )
			);
		} );

		consoleErrorSpy.mockRestore();
	} );

	it( 'handles non-ok HTTP response', async () => {
		const consoleErrorSpy = jest.spyOn( console, 'error' ).mockImplementation();

		mockFetch
			.mockResolvedValueOnce( {
				ok: false,
				json: async () => ( {} ),
			} )
			.mockResolvedValueOnce( {
				ok: true,
				json: async () => ( {} ),
			} );

		render( <App /> );

		await waitFor( () => {
			expect( consoleErrorSpy ).toHaveBeenCalled();
		} );

		consoleErrorSpy.mockRestore();
	} );

	it( 'handles response with success:false', async () => {
		const consoleErrorSpy = jest.spyOn( console, 'error' ).mockImplementation();

		mockFetch
			.mockResolvedValueOnce( {
				ok: true,
				json: async () => ( {
					success: false,
				} ),
			} )
			.mockResolvedValueOnce( {
				ok: true,
				json: async () => ( {} ),
			} );

		render( <App /> );

		await waitFor( () => {
			expect( consoleErrorSpy ).toHaveBeenCalled();
		} );

		consoleErrorSpy.mockRestore();
	} );

	it( 'falls back to defaults when wpApiSettings is missing', async () => {
		delete window.wpApiSettings;

		mockFetch.mockResolvedValue( {
			ok: true,
			json: async () => ( {
				success: true,
				data: {
					signature: 'test-sig',
					accessToken: 'test-token',
					clientId: 'test-client',
					homeUrl: 'https://example.com/',
					siteKey: 'test-key',
				},
			} ),
		} );

		render( <App /> );

		await waitFor( () => {
			expect( mockFetch ).toHaveBeenCalledWith(
				expect.stringContaining( AUTH_PATH ),
				expect.objectContaining( {
					method: 'POST',
					headers: expect.objectContaining( {
						'X-WP-Nonce': '',
					} ),
				} )
			);
		} );
	} );

	it( 'rejects response with missing required Connect fields', async () => {
		const consoleErrorSpy = jest.spyOn( console, 'error' ).mockImplementation();

		mockFetch
			.mockResolvedValueOnce( {
				ok: true,
				json: async () => ( {
					success: true,
					data: {
						signature: 'test-sig',
						accessToken: 'test-token',
					},
				} ),
			} )
			.mockResolvedValueOnce( {
				ok: true,
				json: async () => ( {} ),
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

		mockFetch
			.mockResolvedValueOnce( {
				ok: true,
				json: async () => ( {
					success: true,
					data: {
						signature: 'test-sig',
						accessToken: 123,
						clientId: 'test-client',
						homeUrl: 'https://example.com/',
						siteKey: 'test-key',
					},
				} ),
			} )
			.mockResolvedValueOnce( {
				ok: true,
				json: async () => ( {} ),
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
