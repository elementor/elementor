import { updateElementSettings, type V1ElementData } from '@elementor/editor-elements';
import { __createStore, __dispatch, __registerSlice, __getState as getState } from '@elementor/store';

import { apiClient } from '../../api';
import { selectComponents, selectUnpublishedComponents, slice } from '../../store/store';
import { beforeSave } from '../before-save';

jest.mock( '@elementor/editor-elements' );
jest.mock( '../../api' );

const mockUpdateElementSettings = jest.mocked( updateElementSettings );
const mockUpdateComponents = jest.mocked( apiClient.update );

const mockElements: V1ElementData[] = [
	{
		id: 'element-1_component-with-temp-id',
		elType: 'widget',
		widgetType: 'e-component',
		settings: {
			component_id: {
				$$type: 'number',
				value: 1000,
			},
		},
	},
	{
		id: 'element-2_not-a-component',
		elType: 'container',
		elements: [
			{
				id: 'element-3_component-with-temp-id',
				elType: 'widget',
				widgetType: 'e-component',
				settings: {
					component_id: {
						$$type: 'number',
						value: 3000,
					},
				},
			},
			{
				id: 'element-4_not-a-component',
				elType: 'widget',
				widgetType: 'e-button',
				settings: {
					text: {
						$$type: 'string',
						value: 'Click Me!',
					},
				},
			},
		],
	},
	{
		id: 'element-5_component-with-actual-id',
		elType: 'widget',
		widgetType: 'e-component',
		settings: {
			component_id: {
				$$type: 'number',
				value: 4444,
			},
		},
	},
];

describe( 'beforeSave', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		__registerSlice( slice );
		__createStore();
	} );

	const createMockContainer = ( elements: V1ElementData[] = [] ) => ( {
		model: {
			get: () => ( {
				toJSON: () => elements,
			} ),
		},
	} );

	describe( 'No Unpublished Components', () => {
		it( 'should not update any element settings or make API calls', async () => {
			// Arrange
			const container = createMockContainer();

			// Act
			await beforeSave( { container, status: 'draft' } );

			// Assert
			  expect(mockUpdateComponents).not.toHaveBeenCalled();
			expect( mockUpdateElementSettings ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'Component Publishing', () => {
		beforeEach( () => {
			// Add unpublished components to store
			__dispatch(
				slice.actions.addUnpublished( {
					id: 1001,
					name: 'Test Component',
					content: [],
				} )
			);
		} );

		it.skip( 'should send components changes to server', async () => {
			// Arrange
			const container = createMockContainer();
			const status = 'publish';
			mockUpdateComponents.mockResolvedValue( new Map( [ [ 1001, 2001 ] ] ) );

			// Act
			await beforeSave( { container, status } );

			// Assert
			expect( mockUpdateComponents ).toHaveBeenCalledWith(
				expect.arrayContaining( [ expect.objectContaining( { id: 1001 } ) ] ),
				status
			);
		} );

		it( 'should throw error when component update fails', async () => {
			// Arrange
			const container = createMockContainer();
			mockUpdateComponents.mockRejectedValue( new Error( 'API Error' ) );

			// Act & Assert
			await expect( beforeSave( { container, status: 'draft' } ) ).rejects.toThrow(
				'Failed to publish components and update component instances'
			);
		} );
	} );

	describe( 'Component Instance Updates - Replacing temporary IDs with actual IDs', () => {
		beforeEach( () => {
			__dispatch(
				slice.actions.addUnpublished( {
					id: 1000,
					name: 'Test Component 1',
					content: [],
				} )
			);
			__dispatch(
				slice.actions.addUnpublished( {
					id: 3000,
					name: 'Test Component 2',
					content: [],
				} )
			);
			mockUpdateComponents.mockResolvedValue(
				new Map( [
					[ 1000, 1111 ],
					[ 3000, 3333 ],
				] )
			);
		} );

		it( 'should replace temporary component IDs with actual IDs from server response', async () => {
			// Arrange
			const container = createMockContainer( mockElements );

			// Act
			await beforeSave( { container, status: 'draft' } );

			// Assert
			expect( mockUpdateElementSettings ).toHaveBeenCalledTimes( 2 );
			expect( mockUpdateElementSettings ).toHaveBeenCalledWith( {
				id: 'element-1_component-with-temp-id',
				props: {
					component_id: expect.objectContaining( {
						value: 1111,
					} ),
				},
				withHistory: false,
			} );
			expect( mockUpdateElementSettings ).toHaveBeenCalledWith( {
				id: 'element-3_component-with-temp-id',
				props: {
					component_id: expect.objectContaining( {
						value: 3333,
					} ),
				},
				withHistory: false,
			} );
		} );

		it( 'should not change component instances that already have actual IDs', async () => {
			// Arrange
			const container = createMockContainer( mockElements );

			// Act
			await beforeSave( { container, status: 'draft' } );

			// Assert
			expect( mockUpdateElementSettings ).not.toHaveBeenCalledWith(
				expect.objectContaining( { id: 'element-5_component-with-actual-id' } )
			);
		} );

		it( 'should skip non-component elements', async () => {
			// Arrange
			const container = createMockContainer( mockElements );

			// Act
			await beforeSave( { container, status: 'draft' } );

			// Assert
			expect( mockUpdateElementSettings ).not.toHaveBeenCalledWith(
				expect.objectContaining( { id: 'element-2_not-a-component' } )
			);
			expect( mockUpdateElementSettings ).not.toHaveBeenCalledWith(
				expect.objectContaining( { id: 'element-4_not-a-component' } )
			);
		} );

		it( 'should handle empty elements array', async () => {
			// Arrange
			const container = createMockContainer( [] );

			// Act
			await beforeSave( { container, status: 'draft' } );

			// Assert
			expect( mockUpdateElementSettings ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'Handle store state', () => {
		it( 'should add newly published components to the main component store', async () => {
			// Arrange
			__dispatch(
				slice.actions.add( {
					id: 4444,
					name: 'Published Component',
				} )
			);
			__dispatch(
				slice.actions.addUnpublished( {
					id: 3000,
					name: 'Unpublished Component',
					content: [],
				} )
			);
			const container = createMockContainer( [] );

			// Act
			await beforeSave( { container, status: 'draft' } );

			// Assert
			expect( getState().components.data ).toEqual( [
				{ id: 4444, name: 'Published Component' },
				{ id: 3333, name: 'Unpublished Component' },
			] );
		} );

		it( 'should clear all unpublished components from store after successful save', async () => {
			// Arrange
			__dispatch(
				slice.actions.addUnpublished( {
					id: 1000,
					name: 'Test Component 1',
					content: [],
				} )
			);
			__dispatch(
				slice.actions.addUnpublished( {
					id: 3000,
					name: 'Test Component 2',
					content: [],
				} )
			);
			const container = createMockContainer( [] );

			// Act
			await beforeSave( { container, status: 'draft' } );

			// Assert
			expect( selectUnpublishedComponents( getState() ) ).toEqual( [] );
		} );
	} );
} );
