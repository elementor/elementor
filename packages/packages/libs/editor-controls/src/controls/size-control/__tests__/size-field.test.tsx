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
			setValue={ jest.fn() }
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

	describe( 'readOnly when extended unit', () => {
		it( 'should set input readOnly when unit is extended (auto)', () => {
			isExtendedUnitMock.mockReturnValue( true );
			Object.assign( defaultUseSizeValueReturn, { size: '', unit: 'auto' } );

			renderSizeField( { value: { size: '', unit: 'auto' } } );

			const input = screen.getByRole( 'textbox' );
			expect( input ).toHaveAttribute( 'readonly' );
		} );

		it( 'should set input readOnly when unit is extended (custom)', () => {
			isExtendedUnitMock.mockReturnValue( true );
			Object.assign( defaultUseSizeValueReturn, { size: 'calc(1em)', unit: 'custom' } );

			renderSizeField( { value: { size: 'calc(1em)', unit: 'custom' } } );

			const input = screen.getByRole( 'textbox' );
			expect( input ).toHaveAttribute( 'readonly' );
		} );

		it( 'should not set input readOnly when unit is not extended', () => {
			isExtendedUnitMock.mockReturnValue( false );

			renderSizeField();

			const input = screen.getByRole( 'spinbutton' );
			expect( input ).not.toHaveAttribute( 'readonly' );
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
			expect( mockSetSize ).toHaveBeenCalledWith( '20', true );
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
