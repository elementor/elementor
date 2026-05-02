import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { TimeFrameIndicator } from '../time-frame-indicator';

describe( 'TimeFrameIndicator', () => {
	const mockOnChange = jest.fn();

	describe( 'Rendering', () => {
		it( 'should render passed size value', () => {
			// Arrange & Act.
			render( <TimeFrameIndicator value="2000ms" onChange={ mockOnChange } defaultValue="600ms" /> );

			// Assert.
			const input = screen.getByRole( 'spinbutton' );
			const unitSelector = screen.getByText( 'ms' );

			expect( input ).toHaveValue( 2000 );
			expect( unitSelector ).toBeInTheDocument();
		} );

		it( 'should display both ms and s unit options when clicking unit selector', () => {
			// Arrange
			render( <TimeFrameIndicator value="1424ms" onChange={ mockOnChange } defaultValue="600ms" /> );

			// Act
			const unitButton = screen.getByText( 'ms' );
			fireEvent.click( unitButton );

			// Assert
			expect( screen.getByRole( 'menuitem', { name: /^MS$/i } ) ).toBeInTheDocument();
			expect( screen.getByRole( 'menuitem', { name: /^S$/i } ) ).toBeInTheDocument();
		} );

		it( 'should use default value when value is undefined', () => {
			// Arrange & Act
			render(
				<TimeFrameIndicator
					value={ undefined as unknown as string }
					onChange={ mockOnChange }
					defaultValue="300ms"
				/>
			);

			// Assert
			const input = screen.getByRole( 'spinbutton' );
			expect( input ).toHaveValue( 300 );
		} );

		it( 'should not use unsupported time unit but fallback to default', () => {
			// Arrange & Act.
			render( <TimeFrameIndicator value="14px" onChange={ mockOnChange } defaultValue="600ms" /> );

			// Assert.
			const input = screen.getByRole( 'spinbutton' );
			const unitSelector = screen.getByText( 'ms' );

			expect( input ).toHaveValue( 600 );
			expect( unitSelector ).toBeInTheDocument();
		} );

		it( 'should render value with seconds unit', () => {
			// Arrange & Act.
			render( <TimeFrameIndicator value="2.5s" onChange={ mockOnChange } defaultValue="600ms" /> );

			// Assert.
			const input = screen.getByRole( 'spinbutton' );
			const unitSelector = screen.getByText( 's' );

			expect( input ).toHaveValue( 2.5 );
			expect( unitSelector ).toBeInTheDocument();
		} );

		it( 'should render decimal millisecond values', () => {
			// Arrange & Act.
			render( <TimeFrameIndicator value="150.5ms" onChange={ mockOnChange } defaultValue="600ms" /> );

			// Assert.
			const input = screen.getByRole( 'spinbutton' );

			expect( input ).toHaveValue( 150.5 );
		} );
	} );

	describe( 'OnChange', () => {
		it( 'should call onChange with string when input value changes', () => {
			// Arrange
			render( <TimeFrameIndicator value="240ms" onChange={ mockOnChange } defaultValue="0ms" /> );
			const input = screen.getByRole( 'spinbutton' );

			// Act
			fireEvent.input( input, { target: { value: 800 } } );

			// Assert
			expect( mockOnChange ).toHaveBeenCalledWith( '800ms' );
		} );

		it( 'should reset to default value on blur when input is cleared', () => {
			// Arrange.
			mockOnChange.mockClear();
			render( <TimeFrameIndicator value="0.6s" onChange={ mockOnChange } defaultValue="600ms" /> );

			// Act.
			const input = screen.getByRole( 'spinbutton' );
			fireEvent.input( input, { target: { value: '' } } );
			fireEvent.blur( input );

			// Assert.
			expect( mockOnChange ).toHaveBeenLastCalledWith( '600ms' );
		} );

		it( 'should not call onChange on blur when value is non-zero', () => {
			// Arrange.
			mockOnChange.mockClear();
			render( <TimeFrameIndicator value="500ms" onChange={ mockOnChange } defaultValue="600ms" /> );

			const input = screen.getByRole( 'spinbutton' );

			// Act.
			fireEvent.blur( input );

			// Assert.
			expect( mockOnChange ).not.toHaveBeenCalled();
		} );

		it( 'should handle decimal input values', () => {
			// Arrange.
			mockOnChange.mockClear();
			render( <TimeFrameIndicator value="100ms" onChange={ mockOnChange } defaultValue="600ms" /> );

			const input = screen.getByRole( 'spinbutton' );

			// Act.
			fireEvent.input( input, { target: { value: 1.5 } } );

			// Assert.
			expect( mockOnChange ).toHaveBeenCalledWith( '1.5ms' );
		} );

		it( 'should not reset to default on blur when value is zero', () => {
			// Arrange.
			mockOnChange.mockClear();
			render( <TimeFrameIndicator value="500ms" onChange={ mockOnChange } defaultValue="600ms" /> );
			const input = screen.getByRole( 'spinbutton' );

			// Act.
			fireEvent.input( input, { target: { value: '0' } } );
			fireEvent.blur( input );

			// Assert.
			expect( mockOnChange ).toHaveBeenLastCalledWith( '0ms' );
		} );

		it( 'should change unit without converting the numeric value', () => {
			// Arrange.
			mockOnChange.mockClear();
			render( <TimeFrameIndicator value="500ms" onChange={ mockOnChange } defaultValue="0ms" /> );

			// Act.
			const unitButton = screen.getByText( 'ms' );
			fireEvent.click( unitButton );

			const secondsOption = screen.getByRole( 'menuitem', { name: /^S$/i } );
			fireEvent.click( secondsOption );

			// Assert.
			expect( mockOnChange ).toHaveBeenLastCalledWith( '500s' );
		} );
	} );
} );
