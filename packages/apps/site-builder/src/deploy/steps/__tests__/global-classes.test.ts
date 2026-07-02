import apiFetch from '@wordpress/api-fetch';

import { DEPLOY_DESIGN_SYSTEM_PATH } from '../../types';
import { deployGlobalClasses } from '../global-classes';

jest.mock( '@wordpress/api-fetch' );

describe( '@elementor/site-builder/deploy/global-classes', () => {
	beforeEach( () => {
		jest.mocked( apiFetch ).mockImplementation( () => Promise.resolve() );
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should POST globalClasses to the design-system deploy endpoint', async () => {
		const globalClasses = {
			items: { 'g-1': { id: 'g-1', label: 'heading', variants: [] } },
			order: [ 'g-1' ],
		};

		await deployGlobalClasses( globalClasses );

		expect( apiFetch ).toHaveBeenCalledTimes( 1 );
		expect( apiFetch ).toHaveBeenCalledWith( {
			path: DEPLOY_DESIGN_SYSTEM_PATH,
			method: 'POST',
			data: { globalClasses },
		} );
	} );

	it( 'should propagate apiFetch errors to the caller', async () => {
		jest.mocked( apiFetch ).mockRejectedValueOnce( new Error( 'boom' ) );

		await expect( deployGlobalClasses( { items: {}, order: [] } ) ).rejects.toThrow( 'boom' );
	} );
} );
