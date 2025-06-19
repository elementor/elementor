import { renderHook } from '@testing-library/react';

import { useStylesField } from '../use-styles-field';
import { useStylesFields } from '../use-styles-fields';

jest.mock( '../use-styles-fields' );

describe( 'useStylesField', () => {
	it( 'should set the initial value', () => {
		// Arrange.
		jest.mocked( useStylesFields ).mockImplementation( ( [ prop ] ) => {
			let color: string | null = '#000';

			if ( prop !== 'color' ) {
				color = null;
			}

			return { values: { color }, setValues: jest.fn(), canEdit: true };
		} );

		// Act.
		const { result } = renderHook( () => useStylesField( 'color' ) );

		// Assert.
		expect( result.current.value ).toEqual( '#000' );
	} );

	it( 'should return null if the prop is not found', () => {
		// Arrange.
		jest.mocked( useStylesFields ).mockImplementation( () => {
			return {
				values: { 'not-color': 'value' },
				setValues: jest.fn(),
				canEdit: true,
			};
		} );

		// Act.
		const { result } = renderHook( () => useStylesField( 'color' ) );

		// Assert.
		expect( result.current.value ).toBeNull();
	} );

	it( 'should pass the updated payload', () => {
		// Arrange.
		const baseSetValue = jest.fn();
		jest.mocked( useStylesFields ).mockImplementation( () => {
			return { values: null, setValues: baseSetValue, canEdit: true };
		} );

		const { result } = renderHook( () => useStylesField( 'color' ) );
		const { setValue } = result.current;

		// Act.
		setValue( '#fff' );

		// Assert.
		expect( baseSetValue ).toHaveBeenCalledWith( {
			color: '#fff',
		} );
	} );
} );
