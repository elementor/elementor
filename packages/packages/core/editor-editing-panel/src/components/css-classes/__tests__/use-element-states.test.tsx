import { renderHook } from '@testing-library/react';

import { useElement } from '../../../contexts/element-context';
import { useElementStates } from '../css-class-menu';

jest.mock( '../../../contexts/element-context' );

describe( 'useElementStates', () => {
	it( 'should label the current menu item state', () => {
		// Arrange
		jest.mocked( useElement ).mockReturnValue( {
			elementType: {
				title: 'Menu item',
				styleStates: [ { name: 'current', value: 'e--current' } ],
			},
		} as unknown as ReturnType< typeof useElement > );

		// Act
		const { result } = renderHook( () => useElementStates() );

		// Assert
		expect( result.current.elementStates ).toEqual( [
			{ key: 'e--current', value: 'e--current', label: 'current' },
		] );
		expect( result.current.elementTitle ).toBe( 'Menu item' );
	} );

	it( 'should keep the selected and disabled labels for the other atomic elements', () => {
		// Arrange
		jest.mocked( useElement ).mockReturnValue( {
			elementType: {
				title: 'Tab',
				styleStates: [
					{ name: 'selected', value: 'e--selected' },
					{ name: 'disabled', value: 'e--disabled' },
				],
			},
		} as unknown as ReturnType< typeof useElement > );

		// Act
		const { result } = renderHook( () => useElementStates() );

		// Assert
		expect( result.current.elementStates.map( ( { label } ) => label ) ).toEqual( [ 'selected', 'disabled' ] );
	} );

	it( 'should fall back to the state name when there is no label', () => {
		// Arrange
		jest.mocked( useElement ).mockReturnValue( {
			elementType: {
				title: 'Tab',
				styleStates: [ { name: 'playing', value: 'e--playing' } ],
			},
		} as unknown as ReturnType< typeof useElement > );

		// Act
		const { result } = renderHook( () => useElementStates() );

		// Assert
		expect( result.current.elementStates[ 0 ].label ).toBe( 'playing' );
	} );
} );
