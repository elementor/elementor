import apiFetch from '@wordpress/api-fetch';

import { runSiteScan } from 'elementor/modules/agents/assets/js/admin/api';

jest.mock( '@wordpress/api-fetch', () => jest.fn() );

const SCAN_PATH = '/elementor/v1/agents-ready/scan';
const RETRY_AT = '2026-10-21T10:00:00Z';

describe( 'runSiteScan', () => {
	beforeEach( () => {
		apiFetch.mockReset();
	} );

	it( 'posts the scan and maps the report', async () => {
		// Arrange
		apiFetch.mockResolvedValue( {
			data: {
				report: {
					score: 10,
					checks: [],
					layers: {},
				},
				retryAt: RETRY_AT,
			},
		} );

		// Act
		const result = await runSiteScan();

		// Assert
		expect( apiFetch ).toHaveBeenCalledWith( { path: SCAN_PATH, method: 'POST' } );
		expect( result ).toMatchObject( {
			score: 10,
			retryAt: RETRY_AT,
			checks: [],
		} );
	} );

	it( 'maps a failed response onto status, reason, and retryAt', async () => {
		// Arrange
		apiFetch.mockRejectedValue( {
			message: 'Slow down',
			data: {
				status: 429,
				meta: {
					reason: 'throttled',
					retryAt: RETRY_AT,
				},
			},
		} );

		// Act
		const scan = runSiteScan();

		// Assert
		await expect( scan ).rejects.toMatchObject( {
			message: 'Slow down',
			status: 429,
			reason: 'throttled',
			retryAt: RETRY_AT,
		} );
	} );
} );
