import { createMockElement } from 'test-utils';

import { getContainer } from '../get-container';
import { getElementStyles } from '../get-element-styles';

jest.mock( '../get-container' );

describe( 'getElementStyles', () => {
	it( 'should return the value of the style', () => {
		// Arrange
		const elementID = 'element-id';
		const id = 'styledef-id';

		const styles = {
			[ id ]: {
				id,
				label: '',
				variants: [ { props: { padding: '10px' }, meta: { breakpoint: 'desktop', state: 'hover' } as const } ],
				type: 'class' as const,
			},
		};

		jest.mocked( getContainer ).mockReturnValue(
			createMockElement( {
				model: { styles },
			} )
		);

		// Act
		const result = getElementStyles( elementID );

		// Assert
		expect( result ).toEqual( styles );
	} );

	it( 'should return null if the element is not found', () => {
		// Arrange
		const elementID = 'element-id';

		jest.mocked( getContainer ).mockReturnValue( null );

		// Act
		const result = getElementStyles( elementID );

		// Assert
		expect( result ).toBe( null );
	} );

	it( 'should return null if the element has no styles', () => {
		// Arrange
		const elementID = 'element-id';

		jest.mocked( getContainer ).mockReturnValue( createMockElement( { model: {} } ) );

		// Act
		const result = getElementStyles( elementID );

		// Assert
		expect( result ).toBe( null );
	} );
} );
