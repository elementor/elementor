import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { TimeFrameIndicator } from '../time-frame-indicator';

const DEFAULT_VALUE_MS = 600;
const ONE_SECOND_IN_MS = 1000;
const HALF_SECOND_IN_MS = 500;

const switchToSecondsUnit = () => {
	const unitButton = screen.getByText( 'ms' );
	fireEvent.click( unitButton );
	const secondsOption = screen.getByRole( 'menuitem', { name: /^S$/i } );
	fireEvent.click( secondsOption );
};

const switchToMillisecondsUnit = () => {
	const unitButton = screen.getByText( 's' );
	fireEvent.click( unitButton );
	const msOption = screen.getByRole( 'menuitem', { name: /^MS$/i } );
	fireEvent.click( msOption );
};

describe( 'TimeFrameIndicator', () => {
	const mockOnChange = jest.fn();

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'Rendering', () => {
		it( 'should render with milliseconds unit by default', () => {
			// Arrange & Act
			render(
				<TimeFrameIndicator
					value={ String( DEFAULT_VALUE_MS ) }
					onChange={ mockOnChange }
					defaultValue={ DEFAULT_VALUE_MS }
				/>
			);

			// Assert
			const input = screen.getByRole( 'spinbutton' );
			expect( input ).toHaveValue( DEFAULT_VALUE_MS );
			expect( screen.getByText( 'ms' ) ).toBeInTheDocument();
		} );

		it( 'should display both ms and s unit options when clicking unit selector', () => {
			// Arrange
			render(
				<TimeFrameIndicator
					value={ String( DEFAULT_VALUE_MS ) }
					onChange={ mockOnChange }
					defaultValue={ DEFAULT_VALUE_MS }
				/>
			);

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
					defaultValue={ DEFAULT_VALUE_MS }
				/>
			);

			// Assert
			const input = screen.getByRole( 'spinbutton' );
			expect( input ).toHaveValue( DEFAULT_VALUE_MS );
		} );
	} );

	describe( 'Value changes in milliseconds', () => {
		it( 'should call onChange with milliseconds when value changes in ms unit', () => {
			// Arrange
			render(
				<TimeFrameIndicator
					value={ String( DEFAULT_VALUE_MS ) }
					onChange={ mockOnChange }
					defaultValue={ DEFAULT_VALUE_MS }
				/>
			);
			const input = screen.getByRole( 'spinbutton' );

			// Act
			fireEvent.input( input, { target: { value: 800 } } );

			// Assert
			expect( mockOnChange ).toHaveBeenCalledWith( '800' );
		} );

		it( 'should reset to default value on blur when value prop is zero', () => {
			// Arrange - render with zero value
			render( <TimeFrameIndicator value="0" onChange={ mockOnChange } defaultValue={ DEFAULT_VALUE_MS } /> );
			const input = screen.getByRole( 'spinbutton' );

			// Act - blur should trigger reset since value is 0
			fireEvent.blur( input );

			// Assert
			expect( mockOnChange ).toHaveBeenCalledWith( String( DEFAULT_VALUE_MS ) );
		} );
	} );

	describe( 'Unit conversion - seconds to milliseconds', () => {
		it( 'should convert 1 second input to 1000 milliseconds', () => {
			// Arrange - start with a different value so inputting 1s triggers a change
			render(
				<TimeFrameIndicator
					value={ String( HALF_SECOND_IN_MS ) }
					onChange={ mockOnChange }
					defaultValue={ DEFAULT_VALUE_MS }
				/>
			);

			// Act
			switchToSecondsUnit();
			const input = screen.getByRole( 'spinbutton' );
			fireEvent.input( input, { target: { value: 1 } } );

			// Assert
			expect( mockOnChange ).toHaveBeenLastCalledWith( String( ONE_SECOND_IN_MS ) );
		} );

		it( 'should convert 0.5 seconds input to 500 milliseconds', () => {
			// Arrange - start with a different value so inputting 0.5s triggers a change
			render(
				<TimeFrameIndicator
					value={ String( ONE_SECOND_IN_MS ) }
					onChange={ mockOnChange }
					defaultValue={ DEFAULT_VALUE_MS }
				/>
			);

			// Act
			switchToSecondsUnit();
			const input = screen.getByRole( 'spinbutton' );
			fireEvent.input( input, { target: { value: 0.5 } } );

			// Assert
			expect( mockOnChange ).toHaveBeenLastCalledWith( String( HALF_SECOND_IN_MS ) );
		} );

		it( 'should convert 1.5 seconds input to 1500 milliseconds', () => {
			// Arrange
			const expectedMs = 1500;
			render(
				<TimeFrameIndicator
					value={ String( ONE_SECOND_IN_MS ) }
					onChange={ mockOnChange }
					defaultValue={ DEFAULT_VALUE_MS }
				/>
			);

			// Act
			switchToSecondsUnit();
			const input = screen.getByRole( 'spinbutton' );
			fireEvent.input( input, { target: { value: 1.5 } } );

			// Assert
			expect( mockOnChange ).toHaveBeenLastCalledWith( String( expectedMs ) );
		} );

		it( 'should convert 2.5 seconds input to 2500 milliseconds', () => {
			// Arrange
			const expectedMs = 2500;
			render(
				<TimeFrameIndicator
					value={ String( DEFAULT_VALUE_MS ) }
					onChange={ mockOnChange }
					defaultValue={ DEFAULT_VALUE_MS }
				/>
			);

			// Act
			switchToSecondsUnit();
			const input = screen.getByRole( 'spinbutton' );
			fireEvent.input( input, { target: { value: 2.5 } } );

			// Assert
			expect( mockOnChange ).toHaveBeenLastCalledWith( String( expectedMs ) );
		} );
	} );

	describe( 'Unit conversion - display milliseconds as seconds', () => {
		it( 'should display 1000ms as 1s when switching to seconds unit', () => {
			// Arrange
			render(
				<TimeFrameIndicator
					value={ String( ONE_SECOND_IN_MS ) }
					onChange={ mockOnChange }
					defaultValue={ DEFAULT_VALUE_MS }
				/>
			);
			const input = screen.getByRole( 'spinbutton' );
			expect( input ).toHaveValue( ONE_SECOND_IN_MS );

			// Act
			switchToSecondsUnit();

			// Assert
			expect( input ).toHaveValue( 1 );
		} );

		it( 'should display 500ms as 0.5s when switching to seconds unit', () => {
			// Arrange
			render(
				<TimeFrameIndicator
					value={ String( HALF_SECOND_IN_MS ) }
					onChange={ mockOnChange }
					defaultValue={ DEFAULT_VALUE_MS }
				/>
			);
			const input = screen.getByRole( 'spinbutton' );
			expect( input ).toHaveValue( HALF_SECOND_IN_MS );

			// Act
			switchToSecondsUnit();

			// Assert
			expect( input ).toHaveValue( 0.5 );
		} );

		it( 'should display 600ms as 0.6s when switching to seconds unit', () => {
			// Arrange
			render(
				<TimeFrameIndicator
					value={ String( DEFAULT_VALUE_MS ) }
					onChange={ mockOnChange }
					defaultValue={ DEFAULT_VALUE_MS }
				/>
			);
			const input = screen.getByRole( 'spinbutton' );
			expect( input ).toHaveValue( DEFAULT_VALUE_MS );

			// Act
			switchToSecondsUnit();

			// Assert
			expect( input ).toHaveValue( 0.6 );
		} );
	} );

	describe( 'Unit switching preserves stored value', () => {
		it( 'should preserve the millisecond value when switching from ms to s and back', () => {
			// Arrange
			render(
				<TimeFrameIndicator
					value={ String( ONE_SECOND_IN_MS ) }
					onChange={ mockOnChange }
					defaultValue={ DEFAULT_VALUE_MS }
				/>
			);
			const input = screen.getByRole( 'spinbutton' );

			// Act - switch to seconds
			switchToSecondsUnit();

			// Assert - displays as 1s
			expect( input ).toHaveValue( 1 );

			// Act - switch back to milliseconds
			switchToMillisecondsUnit();

			// Assert - displays as 1000ms again
			expect( input ).toHaveValue( ONE_SECOND_IN_MS );
		} );

		it( 'should not call onChange when only switching units without changing value', () => {
			// Arrange
			render(
				<TimeFrameIndicator
					value={ String( ONE_SECOND_IN_MS ) }
					onChange={ mockOnChange }
					defaultValue={ DEFAULT_VALUE_MS }
				/>
			);

			// Act
			switchToSecondsUnit();

			// Assert
			expect( mockOnChange ).not.toHaveBeenCalled();
		} );
	} );
} );
