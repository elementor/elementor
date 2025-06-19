import * as React from 'react';
import { createMockPropType, renderWithTheme } from 'test-utils';
import { useBoundProp } from '@elementor/editor-controls';
import { getStylesSchema } from '@elementor/editor-styles';
import { fireEvent, screen } from '@testing-library/react';

import { useStylesField } from '../../hooks/use-styles-field';
import { StylesField } from '../styles-field';

jest.mock( '@elementor/editor-styles' );
jest.mock( '../../hooks/use-styles-field' );
jest.mock( '../../contexts/style-context', () => ( {
	useStyle: jest.fn().mockReturnValue( { canEdit: true } ),
} ) );

describe( '<StylesField />', () => {
	beforeEach( () => {
		jest.mocked( getStylesSchema ).mockReturnValue( {
			padding: createMockPropType( { kind: 'object' } ),
			margin: createMockPropType( { kind: 'object' } ),
		} );
	} );

	it( 'should set the initial value for the bind property', () => {
		// Arrange.
		mockStyles( { padding: '10px' } );

		// Act.
		renderWithTheme(
			<StylesField bind="padding" propDisplayName="Padding">
				<MockControl />
			</StylesField>
		);

		// Assert.
		expect( screen.getByRole( 'textbox', { name: 'padding' } ) ).toHaveValue( '10px' );
	} );

	it( 'should pass empty string as initial value if the bind property is not found', () => {
		mockStyles( { notMargin: '10px' } );

		// Act.
		renderWithTheme(
			<StylesField bind="margin" propDisplayName="Margin">
				<MockControl />
			</StylesField>
		);

		// Assert.
		expect( screen.getByRole( 'textbox', { name: 'margin' } ) ).toHaveValue( '' );
	} );

	it( 'should update the value when the input changes', () => {
		// Arrange.
		const mockSetValue = mockStyles( { padding: '10px' } );

		renderWithTheme(
			<StylesField bind="padding" propDisplayName="Padding">
				<MockControl />
			</StylesField>
		);

		const input = screen.getByRole( 'textbox', { name: 'padding' } );

		// Act.
		fireEvent.change( input, { target: { value: '20px' } } );

		// Assert.
		expect( mockSetValue ).toHaveBeenCalledWith( '20px' );
	} );
} );

export function mockStyles( styles: Record< string, string > ) {
	const setValue = jest.fn();

	jest.mocked( useStylesField ).mockImplementation( ( propName ) => ( {
		value: styles[ propName ],
		setValue,
		canEdit: true,
	} ) );

	return setValue;
}

const MockControl = () => {
	const { value, setValue, bind } = useBoundProp< string >();

	const handleChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		setValue( event.target.value );
	};

	return <input type="text" aria-label={ bind } value={ value } onChange={ handleChange } />;
};
