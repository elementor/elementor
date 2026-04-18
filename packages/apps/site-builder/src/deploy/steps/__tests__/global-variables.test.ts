import apiFetch from '@wordpress/api-fetch';

import { DEPLOY_DESIGN_SYSTEM_PATH } from '../../types';
import { deployGlobalVariables } from '../global-variables';

jest.mock( '@wordpress/api-fetch' );

describe( '@elementor/site-builder/deploy/global-variables', () => {
	beforeEach( () => {
		jest.mocked( apiFetch ).mockImplementation( () => Promise.resolve() );
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should POST globalVariables to the design-system deploy endpoint', async () => {
		const globalVariables = {
			data: {
				'e-gv-1': {
					type: 'global-color-variable',
					label: 'Primary',
					value: '#a04343',
				},
			},
			watermark: 7,
			version: 1,
		};

		await deployGlobalVariables( globalVariables );

		expect( apiFetch ).toHaveBeenCalledTimes( 1 );
		expect( apiFetch ).toHaveBeenCalledWith( {
			path: DEPLOY_DESIGN_SYSTEM_PATH,
			method: 'POST',
			data: { globalVariables },
		} );
	} );

	it( 'should propagate apiFetch errors to the caller', async () => {
		jest.mocked( apiFetch ).mockRejectedValueOnce( new Error( 'boom' ) );

		await expect( deployGlobalVariables( { data: {}, watermark: 0, version: 1 } ) ).rejects.toThrow( 'boom' );
	} );
} );
