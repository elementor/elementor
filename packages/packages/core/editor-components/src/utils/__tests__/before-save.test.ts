import { updateElementSettings, type V1ElementData } from '@elementor/editor-elements';
import { __createStore, __dispatch, __getState as getState, __registerSlice } from '@elementor/store';

import { apiClient } from '../../api';
import { selectUnpublishedComponents, slice } from '../../store/store';
import { beforeSave } from '../before-save';

jest.mock( '@elementor/editor-elements' );
jest.mock( '../../api' );

const mockUpdateElementSettings = jest.mocked( updateElementSettings );
const mockCreateComponents = jest.mocked( apiClient.create );

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

	const setupUnpublishedComponents = () => {
		__dispatch(
			slice.actions.addUnpublished( {
				id: 1000,
				name: 'Test Component 1',
				content: mockComponent1Content,
			} )
		);
		__dispatch(
			slice.actions.addUnpublished( {
				id: 3000,
				name: 'Test Component 2',
				content: mockComponent2Content,
			} )
		);

		mockCreateComponents.mockImplementation( ( payload ) => {
			switch ( payload.name ) {
				case 'Test Component 1':
					return Promise.resolve( { component_id: 1111 } );
				case 'Test Component 2':
					return Promise.resolve( { component_id: 3333 } );

				default:
					return Promise.resolve( { component_id: 0 } );
			}
		} );
	};

	describe( 'No Unpublished Components', () => {
		it( 'should not update any element settings or make API calls', async () => {
			// Arrange
			const container = createMockContainer();

			// Act
			await beforeSave( { container, status: 'draft' } );

			// Assert
			expect( mockCreateComponents ).not.toHaveBeenCalled();
			expect( mockUpdateElementSettings ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'Component Publishing', () => {
		beforeEach( () => {
			setupUnpublishedComponents();
		} );

		it( 'should send create requests for unpublished components', async () => {
			// Act
			await beforeSave( { container: createMockContainer(), status: 'publish' } );

			// Assert
			expect( mockCreateComponents ).toHaveBeenCalledTimes( 2 );
			expect( mockCreateComponents ).toHaveBeenCalledWith( {
				name: 'Test Component 1',
				content: mockComponent1Content,
				status: 'publish',
			} );
			expect( mockCreateComponents ).toHaveBeenCalledWith( {
				name: 'Test Component 2',
				content: mockComponent2Content,
				status: 'publish',
			} );
		} );

		it( 'should throw error when component update fails', async () => {
			// Arrange
			const container = createMockContainer();
			mockCreateComponents.mockRejectedValue( new Error( 'API Error' ) );

			// Act & Assert
			await expect( beforeSave( { container, status: 'draft' } ) ).rejects.toThrow(
				'Failed to publish components and update component instances'
			);
		} );
	} );

	describe( 'Component Instance Updates - Replacing temporary IDs with actual IDs', () => {
		beforeEach( () => {
			setupUnpublishedComponents();
		} );

		it( 'should replace temporary component IDs with actual IDs from server response', async () => {
			// Arrange
			const container = createMockContainer( mockPageElements );

			// Act
			await beforeSave( { container, status: 'draft' } );

			// Assert
			expect( mockUpdateElementSettings ).toHaveBeenCalledTimes( 2 );
			expect( mockUpdateElementSettings ).toHaveBeenCalledWith( {
				id: 'element-1_component-with-temp-id',
				props: {
					component: {
						$$type: 'component-id',
						value: 1111,
					},
				},
				withHistory: false,
			} );
			expect( mockUpdateElementSettings ).toHaveBeenCalledWith( {
				id: 'element-3_component-with-temp-id',
				props: {
					component: {
						$$type: 'component-id',
						value: 3333,
					},
				},
				withHistory: false,
			} );
		} );

		it( 'should not change component instances that already have actual IDs', async () => {
			// Arrange
			const container = createMockContainer( mockPageElements );

			// Act
			await beforeSave( { container, status: 'draft' } );

			// Assert
			expect( mockUpdateElementSettings ).not.toHaveBeenCalledWith(
				expect.objectContaining( { id: 'element-5_component-with-actual-id' } )
			);
		} );

		it( 'should skip non-component elements', async () => {
			// Arrange
			const container = createMockContainer( mockPageElements );

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
		beforeEach( () => {
			setupUnpublishedComponents();
		} );

		it( 'should add newly published components to the main component store', async () => {
			// Arrange
			__dispatch(
				slice.actions.add( {
					id: 4444,
					name: 'Published Component',
				} )
			);
			const container = createMockContainer( [] );

			// Act
			await beforeSave( { container, status: 'draft' } );

			// Assert
			expect( getState().components.data ).toEqual( [
				{ id: 4444, name: 'Published Component' },
				{ id: 3333, name: 'Test Component 2' },
				{ id: 1111, name: 'Test Component 1' },
			] );
		} );

		it( 'should clear all unpublished components from store after successful save', async () => {
			// Assert
			expect( selectUnpublishedComponents( getState() ) ).toEqual( [
				{ id: 3000, name: 'Test Component 2', content: mockComponent2Content },
				{ id: 1000, name: 'Test Component 1', content: mockComponent1Content },
			] );

			// Act
			await beforeSave( { container: createMockContainer(), status: 'draft' } );

			// Assert
			expect( selectUnpublishedComponents( getState() ) ).toEqual( [] );
		} );
	} );
} );

const mockComponent1Content: V1ElementData[] = [
	{
		id: 'element-1_component-1',
		elType: 'widget',
		widgetType: 'button',
		settings: {
			text: {
				$$type: 'string',
				value: 'Click Me!',
			},
		},
	},
];

const mockComponent2Content: V1ElementData[] = [
	{
		id: 'element-2_component-2',
		elType: 'widget',
		widgetType: 'heading',
		settings: {
			title: {
				$$type: 'string',
				value: 'This is a heading',
			},
		},
	},
];

const mockPageElements: V1ElementData[] = [
	{
		id: 'element-1_component-with-temp-id',
		elType: 'widget',
		widgetType: 'e-component',
		settings: {
			component: {
				$$type: 'component-id',
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
					component: {
						$$type: 'component-id',
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
			component: {
				$$type: 'component-id',
				value: 4444,
			},
		},
	},
];
