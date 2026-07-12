import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import { apiClient } from '../../../api';
import { slice } from '../../store';
import { loadComponentsOverridableProps } from '../load-components-overridable-props';

jest.mock( '@elementor/store', () => ( {
	...jest.requireActual( '@elementor/store' ),
	__getState: jest.fn(),
	__dispatch: jest.fn(),
} ) );

jest.mock( '../../../api' );

describe( 'loadComponentsOverridableProps', () => {
	const LOADED_ID = 1;
	const UNLOADED_ID = 2;

	beforeEach( () => {
		jest.clearAllMocks();

		jest.mocked( getState ).mockReturnValue( {
			components: {
				data: [
					{
						id: LOADED_ID,
						uid: 'loaded-uid',
						name: 'Loaded',
						overridableProps: { props: {}, groups: { items: {}, order: [] } },
					},
					{ id: UNLOADED_ID, uid: 'unloaded-uid', name: 'Unloaded' },
				],
			},
		} );

		jest.mocked( apiClient.getOverridableProps ).mockResolvedValue( {
			data: {
				[ LOADED_ID ]: { props: {}, groups: { items: {}, order: [] } },
				[ UNLOADED_ID ]: { props: {}, groups: { items: {}, order: [] } },
			},
		} );
	} );

	it( 'should skip already-loaded components by default', async () => {
		// Act
		await loadComponentsOverridableProps( [ LOADED_ID, UNLOADED_ID ] );

		// Assert
		expect( apiClient.getOverridableProps ).toHaveBeenCalledWith( [ UNLOADED_ID ] );
	} );

	it( 'should not call the api when every id is already loaded and force is not set', async () => {
		// Act
		await loadComponentsOverridableProps( [ LOADED_ID ] );

		// Assert
		expect( apiClient.getOverridableProps ).not.toHaveBeenCalled();
	} );

	it( 'should re-fetch already-loaded components when force is true', async () => {
		// Act
		await loadComponentsOverridableProps( [ LOADED_ID ], { force: true } );

		// Assert
		expect( apiClient.getOverridableProps ).toHaveBeenCalledWith( [ LOADED_ID ] );
	} );

	it( 'should dispatch the fetched data via loadOverridableProps', async () => {
		// Act
		await loadComponentsOverridableProps( [ LOADED_ID ], { force: true } );

		// Assert
		expect( dispatch ).toHaveBeenCalledWith(
			slice.actions.loadOverridableProps( {
				[ LOADED_ID ]: { props: {}, groups: { items: {}, order: [] } },
				[ UNLOADED_ID ]: { props: {}, groups: { items: {}, order: [] } },
			} )
		);
	} );
} );
