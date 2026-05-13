import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { Direction } from '../direction';

jest.mock( '@wordpress/i18n', () => ( {
	__: ( str: string ) => str,
} ) );

describe( 'Direction', () => {
	const mockOnChange = jest.fn();

	const defaultProps = {
		value: '',
		onChange: mockOnChange,
		interactionType: 'in',
	};

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'rendering', () => {
		it( 'should render all four direction buttons with "From" labels when interactionType is "in"', () => {
			// Arrange & Act.
			renderWithTheme( <Direction { ...defaultProps } /> );

			// Assert.
			expect( screen.getByRole( 'button', { name: 'From top' } ) ).toBeInTheDocument();
			expect( screen.getByRole( 'button', { name: 'From bottom' } ) ).toBeInTheDocument();
			expect( screen.getByRole( 'button', { name: 'From left' } ) ).toBeInTheDocument();
			expect( screen.getByRole( 'button', { name: 'From right' } ) ).toBeInTheDocument();
		} );

		it( 'should render all four direction buttons with "To" labels when interactionType is "out"', () => {
			// Arrange & Act.
			renderWithTheme( <Direction { ...defaultProps } interactionType="out" /> );

			// Assert.
			expect( screen.getByRole( 'button', { name: 'To top' } ) ).toBeInTheDocument();
			expect( screen.getByRole( 'button', { name: 'To bottom' } ) ).toBeInTheDocument();
			expect( screen.getByRole( 'button', { name: 'To left' } ) ).toBeInTheDocument();
			expect( screen.getByRole( 'button', { name: 'To right' } ) ).toBeInTheDocument();
		} );
	} );

	describe( 'selection state (value → aria-pressed)', () => {
		it( 'should mark no button as selected when value is empty', () => {
			// Arrange & Act.
			renderWithTheme( <Direction { ...defaultProps } value="" /> );

			// Assert.
			expect( screen.getByRole( 'button', { name: 'From top' } ) ).toHaveAttribute( 'aria-pressed', 'false' );
			expect( screen.getByRole( 'button', { name: 'From bottom' } ) ).toHaveAttribute( 'aria-pressed', 'false' );
			expect( screen.getByRole( 'button', { name: 'From left' } ) ).toHaveAttribute( 'aria-pressed', 'false' );
			expect( screen.getByRole( 'button', { name: 'From right' } ) ).toHaveAttribute( 'aria-pressed', 'false' );
		} );

		it( 'should mark only the matching button as selected for a single direction value', () => {
			// Arrange & Act.
			renderWithTheme( <Direction { ...defaultProps } value="top" /> );

			// Assert.
			expect( screen.getByRole( 'button', { name: 'From top' } ) ).toHaveAttribute( 'aria-pressed', 'true' );
			expect( screen.getByRole( 'button', { name: 'From bottom' } ) ).toHaveAttribute( 'aria-pressed', 'false' );
			expect( screen.getByRole( 'button', { name: 'From left' } ) ).toHaveAttribute( 'aria-pressed', 'false' );
			expect( screen.getByRole( 'button', { name: 'From right' } ) ).toHaveAttribute( 'aria-pressed', 'false' );
		} );

		it( 'should mark both axis buttons as selected for a diagonal value', () => {
			// Arrange & Act.
			renderWithTheme( <Direction { ...defaultProps } value="top-left" /> );

			// Assert.
			expect( screen.getByRole( 'button', { name: 'From top' } ) ).toHaveAttribute( 'aria-pressed', 'true' );
			expect( screen.getByRole( 'button', { name: 'From left' } ) ).toHaveAttribute( 'aria-pressed', 'true' );
			expect( screen.getByRole( 'button', { name: 'From bottom' } ) ).toHaveAttribute( 'aria-pressed', 'false' );
			expect( screen.getByRole( 'button', { name: 'From right' } ) ).toHaveAttribute( 'aria-pressed', 'false' );
		} );

		it.each( [
			[ 'top-left', 'From top', 'From left' ],
			[ 'top-right', 'From top', 'From right' ],
			[ 'bottom-left', 'From bottom', 'From left' ],
			[ 'bottom-right', 'From bottom', 'From right' ],
		] )( 'should select the correct two buttons for diagonal value "%s"', ( value, firstLabel, secondLabel ) => {
			// Arrange & Act.
			renderWithTheme( <Direction { ...defaultProps } value={ value } /> );

			// Assert.
			expect( screen.getByRole( 'button', { name: firstLabel } ) ).toHaveAttribute( 'aria-pressed', 'true' );
			expect( screen.getByRole( 'button', { name: secondLabel } ) ).toHaveAttribute( 'aria-pressed', 'true' );
		} );
	} );

	describe( 'onChange behaviour (toggle logic)', () => {
		it( 'should call onChange with a single direction when clicking an unselected button', () => {
			// Arrange.
			renderWithTheme( <Direction { ...defaultProps } value="" /> );

			// Act.
			fireEvent.click( screen.getByRole( 'button', { name: 'From top' } ) );

			// Assert.
			expect( mockOnChange ).toHaveBeenCalledWith( 'top' );
		} );

		it( 'should call onChange with a diagonal value when clicking a compatible second direction', () => {
			// Arrange.
			renderWithTheme( <Direction { ...defaultProps } value="top" /> );

			// Act.
			fireEvent.click( screen.getByRole( 'button', { name: 'From left' } ) );

			// Assert.
			expect( mockOnChange ).toHaveBeenCalledWith( 'top-left' );
		} );

		it( 'should replace the same-axis direction when clicking an incompatible vertical button', () => {
			// Arrange — "top" is selected, clicking "bottom" should replace it.
			renderWithTheme( <Direction { ...defaultProps } value="top" /> );

			// Act.
			fireEvent.click( screen.getByRole( 'button', { name: 'From bottom' } ) );

			// Assert.
			expect( mockOnChange ).toHaveBeenCalledWith( 'bottom' );
		} );

		it( 'should replace the horizontal direction in a diagonal when clicking the opposing horizontal button', () => {
			// Arrange — "top-left" selected, clicking "right" should produce "top-right".
			renderWithTheme( <Direction { ...defaultProps } value="top-left" /> );

			// Act.
			fireEvent.click( screen.getByRole( 'button', { name: 'From right' } ) );

			// Assert.
			expect( mockOnChange ).toHaveBeenCalledWith( 'top-right' );
		} );

		it( 'should replace the vertical direction in a diagonal when clicking the opposing vertical button', () => {
			// Arrange — "top-left" selected, clicking "bottom" should produce "bottom-left".
			renderWithTheme( <Direction { ...defaultProps } value="top-left" /> );

			// Act.
			fireEvent.click( screen.getByRole( 'button', { name: 'From bottom' } ) );

			// Assert.
			expect( mockOnChange ).toHaveBeenCalledWith( 'bottom-left' );
		} );

		it( 'should deselect a single direction when clicking the already-selected button', () => {
			// Arrange.
			renderWithTheme( <Direction { ...defaultProps } value="top" /> );

			// Act.
			fireEvent.click( screen.getByRole( 'button', { name: 'From top' } ) );

			// Assert.
			expect( mockOnChange ).toHaveBeenCalledWith( '' );
		} );

		it( 'should remove only the clicked direction from a diagonal, leaving the other selected', () => {
			// Arrange.
			renderWithTheme( <Direction { ...defaultProps } value="top-left" /> );

			// Act.
			fireEvent.click( screen.getByRole( 'button', { name: 'From top' } ) );

			// Assert.
			expect( mockOnChange ).toHaveBeenCalledWith( 'left' );
		} );
	} );
} );
