import { getContainer, updateElementSettings } from '@elementor/editor-elements';
import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import type { OverridableProps, PublishedComponent } from '../../../types';
import { SLICE_NAME } from '../../store';
import { deleteOverridableProp } from '../delete-overridable-prop';

jest.mock( '@elementor/store', () => ( {
	...jest.requireActual( '@elementor/store' ),
	__getState: jest.fn(),
	__dispatch: jest.fn(),
} ) );

jest.mock( '@elementor/editor-elements', () => ( {
	...jest.requireActual( '@elementor/editor-elements' ),
	getContainer: jest.fn(),
	updateElementSettings: jest.fn(),
} ) );

describe( 'deleteOverridableProp', () => {
	const MOCK_COMPONENT_ID = 1;
	const MOCK_ELEMENT_ID = 'element-1';
	const MOCK_PROP_KEY = 'prop-1';
	const MOCK_SETTING_KEY = 'text';
	const MOCK_GROUP_ID = 'group-1';
	const MOCK_ORIGIN_VALUE = { $$type: 'string', value: 'Hello' };

	let mockState: { data: PublishedComponent[] };

	const createMockOverridableProps = (): OverridableProps => ( {
		props: {
			[ MOCK_PROP_KEY ]: {
				overrideKey: MOCK_PROP_KEY,
				label: 'Test Label',
				elementId: MOCK_ELEMENT_ID,
				propKey: MOCK_SETTING_KEY,
				elType: 'widget',
				widgetType: 'e-heading',
				originValue: MOCK_ORIGIN_VALUE,
				groupId: MOCK_GROUP_ID,
			},
		},
		groups: {
			items: {
				[ MOCK_GROUP_ID ]: {
					id: MOCK_GROUP_ID,
					label: 'Test Group',
					props: [ MOCK_PROP_KEY ],
				},
			},
			order: [ MOCK_GROUP_ID ],
		},
	} );

	beforeEach( () => {
		jest.clearAllMocks();

		mockState = {
			data: [
				{
					id: MOCK_COMPONENT_ID,
					uid: 'comp-uid',
					name: 'Test Component',
					overridableProps: createMockOverridableProps(),
				},
			],
		};

		jest.mocked( getState ).mockImplementation( () => ( {
			[ SLICE_NAME ]: mockState,
		} ) );

		jest.mocked( getContainer ).mockReturnValue( { id: MOCK_ELEMENT_ID } as never );
	} );

	describe( 'basic deletion', () => {
		it( 'should remove prop from overridableProps', () => {
			// Arrange - done in beforeEach

			// Act
			deleteOverridableProp( { componentId: MOCK_COMPONENT_ID, propKey: MOCK_PROP_KEY } );

			// Assert
			expect( dispatch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					type: `${ SLICE_NAME }/setOverridableProps`,
					payload: expect.objectContaining( {
						componentId: MOCK_COMPONENT_ID,
						overridableProps: expect.objectContaining( {
							props: {},
						} ),
					} ),
				} )
			);
		} );

		it( 'should remove prop from group props array', () => {
			// Arrange - done in beforeEach

			// Act
			deleteOverridableProp( { componentId: MOCK_COMPONENT_ID, propKey: MOCK_PROP_KEY } );

			// Assert
			expect( dispatch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					payload: expect.objectContaining( {
						overridableProps: expect.objectContaining( {
							groups: expect.objectContaining( {
								items: expect.objectContaining( {
									[ MOCK_GROUP_ID ]: expect.objectContaining( {
										props: [],
									} ),
								} ),
							} ),
						} ),
					} ),
				} )
			);
		} );

		it( 'should revert element setting to originValue', () => {
			// Arrange - done in beforeEach

			// Act
			deleteOverridableProp( { componentId: MOCK_COMPONENT_ID, propKey: MOCK_PROP_KEY } );

			// Assert
			expect( updateElementSettings ).toHaveBeenCalledWith( {
				id: MOCK_ELEMENT_ID,
				props: { [ MOCK_SETTING_KEY ]: MOCK_ORIGIN_VALUE },
				withHistory: false,
			} );
		} );
	} );

	describe( 'skipRevert flag', () => {
		it( 'should not revert element setting when skipRevert is true', () => {
			// Arrange - done in beforeEach

			// Act
			deleteOverridableProp( {
				componentId: MOCK_COMPONENT_ID,
				propKey: MOCK_PROP_KEY,
				skipRevert: true,
			} );

			// Assert
			expect( updateElementSettings ).not.toHaveBeenCalled();
		} );

		it( 'should still remove prop from overridableProps when skipRevert is true', () => {
			// Arrange - done in beforeEach

			// Act
			deleteOverridableProp( {
				componentId: MOCK_COMPONENT_ID,
				propKey: MOCK_PROP_KEY,
				skipRevert: true,
			} );

			// Assert
			expect( dispatch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					type: `${ SLICE_NAME }/setOverridableProps`,
					payload: expect.objectContaining( {
						componentId: MOCK_COMPONENT_ID,
						overridableProps: expect.objectContaining( {
							props: {},
						} ),
					} ),
				} )
			);
		} );

		it( 'should still remove prop from group when skipRevert is true', () => {
			// Arrange - done in beforeEach

			// Act
			deleteOverridableProp( {
				componentId: MOCK_COMPONENT_ID,
				propKey: MOCK_PROP_KEY,
				skipRevert: true,
			} );

			// Assert
			expect( dispatch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					payload: expect.objectContaining( {
						overridableProps: expect.objectContaining( {
							groups: expect.objectContaining( {
								items: expect.objectContaining( {
									[ MOCK_GROUP_ID ]: expect.objectContaining( {
										props: [],
									} ),
								} ),
							} ),
						} ),
					} ),
				} )
			);
		} );
	} );

	describe( 'edge cases', () => {
		it( 'should not dispatch when component does not exist', () => {
			// Arrange
			mockState.data = [];

			// Act
			deleteOverridableProp( { componentId: MOCK_COMPONENT_ID, propKey: MOCK_PROP_KEY } );

			// Assert
			expect( dispatch ).not.toHaveBeenCalled();
			expect( updateElementSettings ).not.toHaveBeenCalled();
		} );

		it( 'should not dispatch when prop does not exist', () => {
			// Arrange - done in beforeEach

			// Act
			deleteOverridableProp( { componentId: MOCK_COMPONENT_ID, propKey: 'non-existent-prop' } );

			// Assert
			expect( dispatch ).not.toHaveBeenCalled();
			expect( updateElementSettings ).not.toHaveBeenCalled();
		} );

		it( 'should skip element revert when container is not found', () => {
			// Arrange
			jest.mocked( getContainer ).mockReturnValue( null );

			// Act
			deleteOverridableProp( { componentId: MOCK_COMPONENT_ID, propKey: MOCK_PROP_KEY } );

			// Assert
			expect( dispatch ).toHaveBeenCalled();
			expect( updateElementSettings ).not.toHaveBeenCalled();
		} );
	} );
} );
