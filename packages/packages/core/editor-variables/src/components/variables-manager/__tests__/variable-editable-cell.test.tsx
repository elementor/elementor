import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { VariableEditableCell } from '../variable-editable-cell';

describe( 'VariableEditableCell', () => {
	const mockOnSave = jest.fn();

	const TestEditableElement = ( { value, onChange }: { value: string; onChange: ( value: string ) => void } ) => (
		<input
			aria-label="Edit value"
			value={ value }
			onChange={ ( e ) => onChange( e.target.value ) }
		/>
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
			renderComponent();

			expect( screen.getByText( 'initial value' ) ).toBeInTheDocument();
			expect( screen.queryByLabelText( 'Edit value' ) ).not.toBeInTheDocument();
		} );

		it( 'should render prefix element when provided', () => {
			const prefixElement = <div>Prefix Text</div>;
			renderComponent( { prefixElement } );

			expect( screen.getByText( 'Prefix Text' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'Edit Mode Triggers', () => {
		it( 'should enter edit mode on double click', () => {
			renderComponent();
			const displayElement = screen.getByRole( 'button' );

			fireEvent.doubleClick( displayElement );

			expect( screen.getByLabelText( 'Edit value' ) ).toBeInTheDocument();
			expect( screen.queryByText( 'initial value' ) ).not.toBeInTheDocument();
		} );

		it( 'should enter edit mode on space key press', () => {
			renderComponent();
			const displayElement = screen.getByRole( 'button' );

			fireEvent.keyDown( displayElement, { key: ' ' } );

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
			const input = setupEditMode();
			fireEvent.change( input, { target: { value: 'new value' } } );
			fireEvent.keyDown( input, { key: 'Enter' } );

			expect( mockOnSave ).toHaveBeenCalledWith( 'new value' );
			expect( screen.getByText( 'initial value' ) ).toBeInTheDocument();
		} );

		it( 'should cancel changes on Escape key press', () => {
			const input = setupEditMode();
			fireEvent.change( input, { target: { value: 'new value' } } );
			fireEvent.keyDown( input, { key: 'Escape' } );

			expect( mockOnSave ).not.toHaveBeenCalled();
			expect( screen.getByText( 'initial value' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'Accessibility', () => {
		it( 'should have correct ARIA attributes in display mode', () => {
			renderComponent();
			const element = screen.getByRole( 'button' );

			expect( element ).toHaveAttribute( 'aria-label', 'Double click or press Space to edit' );
			expect( element ).toHaveAttribute( 'tabIndex', '0' );
		} );
	} );
} );