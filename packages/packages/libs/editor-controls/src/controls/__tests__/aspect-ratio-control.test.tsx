import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { AspectRatioControl } from '../aspect-ratio-control';

const propType = createMockPropType( { kind: 'plain' } );

describe( 'AspectRatioControl', () => {
	it( 'renders the aspect ratio control with label and dropdown', () => {
		// Arrange.
		const setValue = jest.fn();
		const props = { setValue, value: null, bind: 'aspectRatio', propType };

		// Act.
		renderControl( <AspectRatioControl label="Aspect Ratio" />, props );

		// Assert.
		expect( screen.getByText( 'Aspect Ratio' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'combobox' ) ).toBeInTheDocument();
	} );

	it( 'updates value when selecting a predefined ratio option', () => {
		// Arrange.
		const setValue = jest.fn();
		const props = { setValue, value: { $$type: 'string', value: 'auto' }, bind: 'aspectRatio', propType };

		// Act.
		renderControl( <AspectRatioControl label="Aspect Ratio" />, props );

		const select = screen.getByRole( 'combobox' );

		// Assert.
		expect( screen.getByText( 'Auto' ) ).toBeInTheDocument();

		// Act.
		fireEvent.mouseDown( select );
		const option = screen.getByText( '16/9' );
		fireEvent.click( option );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'string',
			value: '16/9',
		} );
	} );

	it( 'displays width and height inputs when "Custom" option is selected', () => {
		// Arrange.
		const setValue = jest.fn();
		const props = { setValue, value: { $$type: 'string', value: 'auto' }, bind: 'aspectRatio', propType };

		// Act.
		renderControl( <AspectRatioControl label="Aspect Ratio" />, props );

		const select = screen.getByRole( 'combobox' );

		// Assert.
		const inputsBefore = screen.queryAllByRole( 'spinbutton' );
		expect( inputsBefore.length ).toBe( 0 );

		// Act.
		fireEvent.mouseDown( select );
		const customOption = screen.getByText( 'Custom' );
		fireEvent.click( customOption );

		// Assert.
		const inputsAfter = screen.getAllByRole( 'spinbutton' );
		expect( inputsAfter.length ).toBe( 2 );
	} );

	it( 'sets correct aspect ratio value when custom width and height are entered', () => {
		// Arrange.
		const setValue = jest.fn();
		const props = { setValue, value: { $$type: 'string', value: 'auto' }, bind: 'aspectRatio', propType };

		// Act.
		renderControl( <AspectRatioControl label="Aspect Ratio" />, props );

		const select = screen.getByRole( 'combobox' );

		// Act.
		fireEvent.mouseDown( select );
		const customOption = screen.getByText( 'Custom' );
		fireEvent.click( customOption );

		// Act.
		const inputs = screen.getAllByRole( 'spinbutton' );
		const widthInput = inputs[ 0 ];
		const heightInput = inputs[ 1 ];

		fireEvent.change( widthInput, { target: { value: '4' } } );
		fireEvent.change( heightInput, { target: { value: '5' } } );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'string',
			value: '4/5',
		} );
	} );

	it( 'initializes with custom width and height inputs when value is not in predefined options', () => {
		// Arrange.
		const setValue = jest.fn();
		const customRatio = '5/7';
		const props = { setValue, value: { $$type: 'string', value: customRatio }, bind: 'aspectRatio', propType };

		// Act.
		renderControl( <AspectRatioControl label="Aspect Ratio" />, props );

		// Assert.
		const inputs = screen.getAllByRole( 'spinbutton' );
		expect( inputs[ 0 ] ).toHaveValue( 5 );
		expect( inputs[ 1 ] ).toHaveValue( 7 );
	} );

	it( 'renders with a custom label text when provided', () => {
		// Arrange.
		const setValue = jest.fn();
		const customLabel = 'Custom Aspect Ratio Label';
		const props = { setValue, value: null, bind: 'aspectRatio', propType };

		// Act.
		renderControl( <AspectRatioControl label={ customLabel } />, props );

		// Assert.
		expect( screen.getByText( customLabel ) ).toBeInTheDocument();
	} );
} );
