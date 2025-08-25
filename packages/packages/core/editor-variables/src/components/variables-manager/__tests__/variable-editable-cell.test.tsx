import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { VariableEditableCell } from '../variable-editable-cell';

jest.mock( '@elementor/ui', () => ( {
	...jest.requireActual( '@elementor/ui' ),
	ClickAwayListener: ( { children, onClickAway }: { children: React.ReactNode; onClickAway: () => void } ) => (
		<div role="presentation" onClick={ onClickAway } aria-label="Click away area">
			{ children }
		</div>
	),
} ) );

describe( 'VariableEditableCell', () => {
	const mockOnChange = jest.fn();

	const TestEditableElement = ( { value, onChange }: { value: string; onChange: ( value: string ) => void } ) => {
		const handleChange = ( e: React.ChangeEvent< HTMLInputElement > ) => {
			onChange( e.target.value );
		};

		const handleKeyDown = ( e: React.KeyboardEvent< HTMLInputElement > ) => {
			if ( e.key === 'Enter' ) {
				e.currentTarget.blur();
			}
		};

		return <input aria-label="Edit value" value={ value } onChange={ handleChange } onKeyDown={ handleKeyDown } />;
	};

	const renderComponent = (
		props: { initialValue?: string; prefixElement?: React.ReactNode; onChange?: ( value: string ) => void } = {}
	) => {
		const defaultProps = {
			initialValue: props.initialValue || 'initial value',
			editableElement: TestEditableElement,
			children: <span>{ props.initialValue || 'initial value' }</span>,
			onChange: mockOnChange,
			prefixElement: props.prefixElement,
		};

		return render( <VariableEditableCell { ...defaultProps } /> );
	};

	beforeEach( () => {
		jest.clearAllMocks();
	} );

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

	it( 'should enter edit mode on double click', () => {
		renderComponent();
		fireEvent.doubleClick( screen.getByRole( 'button' ) );

		expect( screen.getByLabelText( 'Edit value' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'initial value' ) ).not.toBeInTheDocument();
	} );

	it( 'should enter edit mode on space key press', () => {
		renderComponent();
		const button = screen.getByRole( 'button' );

		fireEvent.keyDown( button, { key: ' ' } );

		expect( screen.getByLabelText( 'Edit value' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'initial value' ) ).not.toBeInTheDocument();
	} );

	it( 'should save changes on Enter key press', () => {
		renderComponent();
		fireEvent.doubleClick( screen.getByRole( 'button' ) );
		const input = screen.getByLabelText( 'Edit value' );

		fireEvent.change( input, { target: { value: 'new value' } } );
		fireEvent.keyDown( input, { key: 'Enter' } );

		expect( mockOnChange ).toHaveBeenCalledWith( 'new value' );
		expect( screen.getByText( 'initial value' ) ).toBeInTheDocument();
	} );

	it( 'should cancel changes on Escape key press', () => {
		renderComponent();
		fireEvent.doubleClick( screen.getByRole( 'button' ) );
		const input = screen.getByLabelText( 'Edit value' );

		fireEvent.change( input, { target: { value: 'new value' } } );
		fireEvent.keyDown( input, { key: 'Escape' } );

		expect( mockOnChange ).not.toHaveBeenCalled();
		expect( screen.getByText( 'initial value' ) ).toBeInTheDocument();
	} );

	it( 'should save changes when clicking away', () => {
		renderComponent();
		fireEvent.doubleClick( screen.getByRole( 'button' ) );
		const input = screen.getByLabelText( 'Edit value' );

		fireEvent.change( input, { target: { value: 'new value' } } );
		fireEvent.click( screen.getByRole( 'presentation' ) );

		expect( mockOnChange ).toHaveBeenCalledWith( 'new value' );
		expect( screen.getByText( 'initial value' ) ).toBeInTheDocument();
	} );

	it( 'should have correct ARIA attributes', () => {
		renderComponent();
		const element = screen.getByRole( 'button' );

		expect( element ).toHaveAttribute( 'aria-label', 'Double click or press Space to edit' );
		expect( element ).toHaveAttribute( 'tabIndex', '0' );
	} );

	it( 'should call onChange callback when value changes', () => {
		// Arrange
		renderComponent();
		fireEvent.doubleClick( screen.getByRole( 'button' ) );
		const input = screen.getByLabelText( 'Edit value' );

		// Act
		fireEvent.change( input, { target: { value: 'new test value' } } );
		fireEvent.keyDown( input, { key: 'Enter' } );

		// Assert
		expect( mockOnChange ).toHaveBeenCalledWith( 'new test value' );
	} );

	it( 'should call onSave with initial value when value is unchanged', () => {
		// Arrange
		renderComponent();
		fireEvent.doubleClick( screen.getByRole( 'button' ) );
		const input = screen.getByLabelText( 'Edit value' );

		// Act
		fireEvent.keyDown( input, { key: 'Enter' } );

		// Assert
		expect( mockOnChange ).toHaveBeenCalledWith( 'initial value' );
	} );
} );
