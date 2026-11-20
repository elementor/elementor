import { AGENT_DISCOVERY_SETTINGS_KEY } from 'elementor/modules/agents/assets/js/admin/constants';

jest.mock( '@wordpress/api-fetch', () => jest.fn() );

import apiFetch from '@wordpress/api-fetch';

import { applyCheckFix, undoCheckFix } from 'elementor/modules/agents/assets/js/admin/api';

describe( 'scanner applyCheckFix', () => {
	beforeEach( () => {
		apiFetch.mockReset().mockResolvedValue( {} );
	} );

	it( 'persists toggle fixes through Agent Ready settings', async () => {
		// Act
		await applyCheckFix( 'agent-path', { enabled: true } );

		// Assert
		expect( apiFetch ).toHaveBeenCalledWith( {
			path: '/elementor/v1/settings/elementor_agent_ready_settings',
			method: 'PUT',
			data: {
				value: {
					[ AGENT_DISCOVERY_SETTINGS_KEY ]: { enabled: true },
				},
			},
		} );
	} );

	it( 'rejects unmapped toggle fixes', async () => {
		// Act
		const result = applyCheckFix( 'unknown-check', { enabled: true } );

		// Assert
		await expect( result ).rejects.toThrow( 'This fix cannot be applied from the scanner yet.' );
		expect( apiFetch ).not.toHaveBeenCalled();
	} );

	it( 'turns toggle fixes off through Agent Ready settings', async () => {
		// Act
		await undoCheckFix( 'agent-path' );

		// Assert
		expect( apiFetch ).toHaveBeenCalledWith( {
			path: '/elementor/v1/settings/elementor_agent_ready_settings',
			method: 'PUT',
			data: {
				value: {
					[ AGENT_DISCOVERY_SETTINGS_KEY ]: { enabled: false },
				},
			},
		} );
	} );
} );
