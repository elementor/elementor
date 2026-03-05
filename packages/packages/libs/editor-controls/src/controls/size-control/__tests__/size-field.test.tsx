import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { SizeField } from '../size-field';

const mockSetSize = jest.fn();
const mockSetUnit = jest.fn();
const mockOnKeyDown = jest.fn();

const defaultUseSizeValueReturn = {
	size: 10,
	unit: 'px',
	setSize: mockSetSize,
	setUnit: mockSetUnit,
};

jest.mock( '../hooks/use-size-value', () => ( {
	useSizeValue: () => defaultUseSizeValueReturn,
} ) );

jest.mock( '../hooks/use-size-unit-keyboard', () => ( {
	useSizeUnitKeyboard: () => ( {
		onUnitKeyDown: mockOnKeyDown,
	} ),
} ) );

jest.mock( '../utils/is-extended-unit', () => ( {
	isExtendedUnit: jest.fn( () => false ),
} ) );

const isExtendedUnitMock = jest.requireMock( '../utils/is-extended-unit' ).isExtendedUnit;

const renderSizeField = ( props = {} ) => {
	render(
		<SizeField
			value={ { size: 10, unit: 'px' } }
			units={ [ 'px', 'rem', 'em' ] }
			onChange={ jest.fn() }
			{ ...props }
		/>
	);
};

describe( 'SizeField', () => {
	beforeEach( () => {
		jest.clearAllMocks();

		isExtendedUnitMock.mockReturnValue( false );

		Object.assign( defaultUseSizeValueReturn, {
			size: 10,
			unit: 'px',
			setSize: mockSetSize,
			setUnit: mockSetUnit,
		} );
	} );

	describe( 'Rendering', () => {
		it( 'should render input and unit selector with mocked size and unit', () => {
			// Arrange & Act.
			renderSizeField();

			// Assert.
			expect( screen.getByRole( 'spinbutton' ) ).toBeInTheDocument();
			expect( screen.getByRole( 'spinbutton' ) ).toHaveValue( 10 );
			expect( screen.getByRole( 'button', { name: 'px' } ) ).toBeInTheDocument();
			expect( screen.getByRole( 'spinbutton' ) ).toHaveAttribute( 'type', 'number' );
		} );

		it( 'should render with startIcon when provided', () => {
			// Arrange & Act.
			renderSizeField( {
				startIcon: <span data-testid="start-icon">Icon</span>,
			} );

			// Assert.
			// eslint-disable-next-line testing-library/no-test-id-queries
			expect( screen.getByTestId( 'start-icon' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Icon' ) ).toBeInTheDocument();
		} );

		it( 'should render input type text when unit is extended', () => {
			// Arrange & Act.
			isExtendedUnitMock.mockReturnValue( true );

			renderSizeField( { value: { size: '', unit: 'auto' } } );

			// Assert.
			expect( screen.getByRole( 'textbox' ) ).toHaveAttribute( 'type', 'text' );
		} );

		it( 'should not throw when value is null', () => {
			// Arrange.
			Object.assign( defaultUseSizeValueReturn, { size: '', unit: 'px' } );

			// Act & Assert.
			expect( () => renderSizeField( { value: null } ) ).not.toThrow();
		} );

		it( 'should not throw when units is empty', () => {
			// Act & Assert.
			expect( () => renderSizeField( { units: [] } ) ).not.toThrow();
		} );
	} );

	describe( 'Event handlers', () => {
		it( 'should call setSize when input value changes', () => {
			// Arrange.
			renderSizeField();

			const input = screen.getByRole( 'spinbutton' );

			// Act.
			fireEvent.input( input, { target: { value: '20' } } );

			// Assert.
			expect( mockSetSize ).toHaveBeenCalledTimes( 1 );
			expect( mockSetSize ).toHaveBeenCalledWith( '20' );
		} );

		it( 'should call setUnit when unit is selected from selector', () => {
			// Arrange.
			renderSizeField();

			const unitButton = screen.getByRole( 'button', { name: 'px' } );

			// Act.
			fireEvent.click( unitButton );

			const remOption = screen.getByText( 'REM' );

			fireEvent.click( remOption );

			// Assert.
			expect( mockSetUnit ).toHaveBeenCalledWith( 'rem' );
		} );

		it( 'should pass onUnitKeyDown from useSizeUnitKeyboard to input', () => {
			// Arrange.
			renderSizeField();

			const input = screen.getByRole( 'spinbutton' );

			// Act.
			fireEvent.keyDown( input, { key: 'r' } );

			// Assert.
			expect( mockOnKeyDown ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'Blur behavior', () => {
		it( 'should call onChange with null when input is blurred with empty string', () => {
			// Arrange.
			const onChange = jest.fn();

			Object.assign( defaultUseSizeValueReturn, { size: '', unit: 'px' } );

			renderSizeField( { onChange } );

			const input = screen.getByRole( 'spinbutton' );

			// Act.
			fireEvent.blur( input );

			// Assert.
			expect( onChange ).toHaveBeenCalledWith( null );
		} );

		it( 'should call onChange with null when input is blurred with null size', () => {
			// Arrange.
			const onChange = jest.fn();

			Object.assign( defaultUseSizeValueReturn, { size: '', unit: 'px' } );

			renderSizeField( { onChange } );

			const input = screen.getByRole( 'spinbutton' );

			// Act.
			fireEvent.blur( input );

			// Assert.
			expect( onChange ).toHaveBeenCalledWith( null );
		} );

		it( 'should not call onChange when input is blurred with a valid size', () => {
			// Arrange.
			const onChange = jest.fn();

			renderSizeField( { onChange } );

			const input = screen.getByRole( 'spinbutton' );

			// Act.
			fireEvent.blur( input );

			// Assert.
			expect( onChange ).not.toHaveBeenCalled();
		} );

		it( 'should call onBlur prop when input is blurred', () => {
			// Arrange.
			const onBlur = jest.fn();

			renderSizeField( { onBlur } );

			const input = screen.getByRole( 'spinbutton' );

			// Act.
			fireEvent.blur( input );

			// Assert.
			expect( onBlur ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should call onBlur prop even when onChange with null is triggered', () => {
			// Arrange.
			const onChange = jest.fn();
			const onBlur = jest.fn();

			Object.assign( defaultUseSizeValueReturn, { size: '', unit: 'px' } );

			renderSizeField( { onChange, onBlur } );

			const input = screen.getByRole( 'spinbutton' );

			// Act.
			fireEvent.blur( input );

			// Assert.
			expect( onChange ).toHaveBeenCalledWith( null );
			expect( onBlur ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should call onChange with null when input is blurred with undefined size', () => {
			// Arrange.
			const onChange = jest.fn();

			Object.assign( defaultUseSizeValueReturn, { size: undefined, unit: 'px' } );

			renderSizeField( { onChange } );

			const input = screen.getByRole( 'spinbutton' );

			// Act.
			fireEvent.blur( input );

			// Assert.
			expect( onChange ).toHaveBeenCalledWith( null );
		} );
	} );

	describe( 'KeyDown behavior', () => {
		it( 'should call onKeyDown prop when key is pressed', () => {
			// Arrange.
			const onKeyDown = jest.fn();

			renderSizeField( { onKeyDown } );

			const input = screen.getByRole( 'spinbutton' );

			// Act.
			fireEvent.keyDown( input, { key: 'ArrowUp' } );

			// Assert.
			expect( onKeyDown ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should call both onUnitKeyDown and onKeyDown prop when key is pressed', () => {
			// Arrange.
			const onKeyDown = jest.fn();

			renderSizeField( { onKeyDown } );

			const input = screen.getByRole( 'spinbutton' );

			// Act.
			fireEvent.keyDown( input, { key: 'r' } );

			// Assert.
			expect( mockOnKeyDown ).toHaveBeenCalledTimes( 1 );
			expect( onKeyDown ).toHaveBeenCalledTimes( 1 );
		} );
	} );
} );
