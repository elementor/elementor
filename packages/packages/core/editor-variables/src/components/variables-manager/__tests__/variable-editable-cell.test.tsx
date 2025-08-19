import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { VariableEditableCell } from '../variable-editable-cell';

describe( 'VariableEditableCell', () => {
	const mockOnSave = jest.fn();

	const TestEditableElement = ( { value, onChange }: { value: string; onChange: ( value: string ) => void } ) => (
		<input aria-label="Edit value" value={ value } onChange={ ( e ) => onChange( e.target.value ) } />
	);

	const renderComponent = ( props = {} ) => {
		const defaultProps = {
			initialValue: 'initial value',
			onSave: mockOnSave,
			editableElement: TestEditableElement,
			children: <span>initial value</span>,
		};

		return render(
			<div>
				<div>Outside Element</div>
				<VariableEditableCell { ...defaultProps } { ...props } />
			</div>
		);
	};

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'Display Mode', () => {
		it( 'should render in display mode initially', () => {
			// Arrange & Act
			renderComponent();

			// Assert
			expect( screen.getByText( 'initial value' ) ).toBeInTheDocument();
			expect( screen.queryByLabelText( 'Edit value' ) ).not.toBeInTheDocument();
		} );

		it( 'should render prefix element when provided', () => {
			// Arrange
			const prefixElement = <div>Prefix Text</div>;

			// Act
			renderComponent( { prefixElement } );

			// Assert
			expect( screen.getByText( 'Prefix Text' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'Edit Mode Triggers', () => {
		it( 'should enter edit mode on double click', () => {
			// Arrange
			renderComponent();
			const displayElement = screen.getByRole( 'button' );

			// Act
			fireEvent.doubleClick( displayElement );

			// Assert
			expect( screen.getByLabelText( 'Edit value' ) ).toBeInTheDocument();
			expect( screen.queryByText( 'initial value' ) ).not.toBeInTheDocument();
		} );

		it( 'should enter edit mode on space key press', () => {
			// Arrange
			renderComponent();
			const displayElement = screen.getByRole( 'button' );

			// Act
			fireEvent.keyDown( displayElement, { key: ' ' } );

			// Assert
			expect( screen.getByLabelText( 'Edit value' ) ).toBeInTheDocument();
			expect( screen.queryByText( 'initial value' ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'Edit Mode Interactions', () => {
		const setupEditMode = () => {
			renderComponent();
			const displayElement = screen.getByRole( 'button' );
			fireEvent.doubleClick( displayElement );
			return screen.getByLabelText( 'Edit value' );
		};

		it( 'should save changes on Enter key press', () => {
			// Arrange
			const input = setupEditMode();

			// Act
			fireEvent.change( input, { target: { value: 'new value' } } );
			fireEvent.keyDown( input, { key: 'Enter' } );

			// Assert
			expect( mockOnSave ).toHaveBeenCalledWith( 'new value' );
			expect( screen.getByText( 'initial value' ) ).toBeInTheDocument();
		} );

		it( 'should cancel changes on Escape key press', () => {
			// Arrange
			const input = setupEditMode();

			// Act
			fireEvent.change( input, { target: { value: 'new value' } } );
			fireEvent.keyDown( input, { key: 'Escape' } );

			// Assert
			expect( mockOnSave ).not.toHaveBeenCalled();
			expect( screen.getByText( 'initial value' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'Accessibility', () => {
		it( 'should have correct ARIA attributes in display mode', () => {
			// Arrange & Act
			renderComponent();
			const element = screen.getByRole( 'button' );

			// Assert
			expect( element ).toHaveAttribute( 'aria-label', 'Double click or press Space to edit' );
			expect( element ).toHaveAttribute( 'tabIndex', '0' );
		} );
	} );
} );