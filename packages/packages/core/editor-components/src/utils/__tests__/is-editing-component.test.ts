import { __getStore as getStore } from '@elementor/store';

import { SLICE_NAME } from '../../store/store';
import { isEditingComponent } from '../is-editing-component';

jest.mock( '@elementor/store', () => ( {
	...jest.requireActual( '@elementor/store' ),
	__getStore: jest.fn(),
} ) );

describe( 'isEditingComponent', () => {
	const MOCK_COMPONENT_ID = 123;

	it( 'should return true when currentComponentId is set', () => {
		// Arrange
		jest.mocked( getStore ).mockReturnValue( {
			getState: () => ( {
				[ SLICE_NAME ]: {
					currentComponentId: MOCK_COMPONENT_ID,
				},
			} ),
		} as ReturnType< typeof getStore > );

		// Act
		const result = isEditingComponent();

		// Assert
		expect( result ).toBe( true );
	} );

	it( 'should return false when currentComponentId is null', () => {
		// Arrange
		jest.mocked( getStore ).mockReturnValue( {
			getState: () => ( {
				[ SLICE_NAME ]: {
					currentComponentId: null,
				},
			} ),
		} as ReturnType< typeof getStore > );

		// Act
		const result = isEditingComponent();

		// Assert
		expect( result ).toBe( false );
	} );

	it( 'should return false when store is not available', () => {
		// Arrange
		jest.mocked( getStore ).mockReturnValue( undefined as unknown as ReturnType< typeof getStore > );

		// Act
		const result = isEditingComponent();

		// Assert
		expect( result ).toBe( false );
	} );
} );
