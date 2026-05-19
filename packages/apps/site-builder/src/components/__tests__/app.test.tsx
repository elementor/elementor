import * as React from 'react';
import { render, waitFor } from '@testing-library/react';
import apiFetch from '@wordpress/api-fetch';

import { App } from '../app';

jest.mock( '@wordpress/api-fetch' );

const mockApiFetch = jest.mocked( apiFetch );

const AUTH_PATH = '/elementor/v1/site-builder/auth';
const SNAPSHOT_PATH = '/elementor/v1/site-builder/snapshot';

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

describe( 'App - ConnectAuth Fetch', () => {
	beforeEach( () => {
		window.wpApiSettings = {
			root: '/wp-json/',
			nonce: 'test-nonce',
		};

		window.elementorAppConfig = {
			'site-builder': {
				iframeUrl: 'https://planner.elementor.com/chat.html',
				isAdmin: true,
				exitTo: '/wp-admin/admin.php?page=elementor',
			},
		};

		mockApiFetch.mockReset();
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'fetches connectAuth on mount via GET', async () => {
		mockApiFetch.mockResolvedValueOnce( validAuthPayload ).mockResolvedValueOnce( {} );

		render( <App /> );

		await waitFor( () => {
			expect( mockApiFetch ).toHaveBeenCalledWith( {
				path: AUTH_PATH,
			} );
		} );

		expect( mockApiFetch ).toHaveBeenCalledWith( {
			path: SNAPSHOT_PATH,
			method: 'POST',
			data: { value: {} },
		} );
	} );

	it( 'handles network errors gracefully', async () => {
		const consoleErrorSpy = jest.spyOn( console, 'error' ).mockImplementation();

		mockApiFetch.mockRejectedValueOnce( new Error( 'Network error' ) ).mockResolvedValueOnce( {} );

		render( <App /> );

		await waitFor( () => {
			expect( consoleErrorSpy ).toHaveBeenCalledWith( 'Failed to fetch connectAuth:', expect.any( Error ) );
		} );

		consoleErrorSpy.mockRestore();
	} );

	it( 'handles non-ok HTTP response', async () => {
		const consoleErrorSpy = jest.spyOn( console, 'error' ).mockImplementation();

		mockApiFetch.mockRejectedValueOnce( new Error( 'Request failed' ) ).mockResolvedValueOnce( {} );

		render( <App /> );

		await waitFor( () => {
			expect( consoleErrorSpy ).toHaveBeenCalled();
		} );

		consoleErrorSpy.mockRestore();
	} );

	it( 'handles response with success:false', async () => {
		const consoleErrorSpy = jest.spyOn( console, 'error' ).mockImplementation();

		mockApiFetch.mockResolvedValueOnce( { success: false } ).mockResolvedValueOnce( {} );

		render( <App /> );

		await waitFor( () => {
			expect( consoleErrorSpy ).toHaveBeenCalled();
		} );

		consoleErrorSpy.mockRestore();
	} );

	it( 'skips snapshot request when wpApiSettings nonce is missing', async () => {
		delete window.wpApiSettings;

		mockApiFetch.mockResolvedValue( validAuthPayload );

		render( <App /> );

		await waitFor( () => {
			expect( mockApiFetch ).toHaveBeenCalledWith( {
				path: AUTH_PATH,
			} );
		} );

		expect( mockApiFetch ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'rejects response with missing required Connect fields', async () => {
		const consoleErrorSpy = jest.spyOn( console, 'error' ).mockImplementation();

		mockApiFetch
			.mockResolvedValueOnce( {
				success: true,
				data: {
					signature: 'test-sig',
					accessToken: 'test-token',
				},
			} )
			.mockResolvedValueOnce( {} );

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

		mockApiFetch
			.mockResolvedValueOnce( {
				success: true,
				data: {
					signature: 'test-sig',
					accessToken: 123,
					clientId: 'test-client',
					homeUrl: 'https://example.com/',
					siteKey: 'test-key',
				},
			} )
			.mockResolvedValueOnce( {} );

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

		mockApiFetch
			.mockResolvedValueOnce( {
				success: true,
				data: {
					signature: '',
					accessToken: 'test-token',
					clientId: 'test-client',
					homeUrl: 'https://example.com/',
					siteKey: 'test-key',
				},
			} )
			.mockResolvedValueOnce( {} );

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
