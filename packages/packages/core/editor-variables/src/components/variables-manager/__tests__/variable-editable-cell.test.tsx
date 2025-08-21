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
	const mockOnSave = jest.fn();

	const TestEditableElement = ( { value, onChange }: { value: string; onChange: ( value: string ) => void } ) => (
		<input aria-label="Edit value" value={ value } onChange={ ( e ) => onChange( e.target.value ) } />
	);

	const renderComponent = ( props: { initialValue?: string; prefixElement?: React.ReactNode } = {} ) => {
		const defaultProps = {
			initialValue: props.initialValue || 'initial value',
			onSave: mockOnSave,
			editableElement: TestEditableElement,
			children: <span>{ props.initialValue || 'initial value' }</span>,
		};

		return render( <VariableEditableCell { ...defaultProps } { ...props } /> );
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

		expect( mockOnSave ).toHaveBeenCalledWith( 'new value' );
		expect( screen.getByText( 'initial value' ) ).toBeInTheDocument();
	} );

	it( 'should cancel changes on Escape key press', () => {
		renderComponent();
		fireEvent.doubleClick( screen.getByRole( 'button' ) );
		const input = screen.getByLabelText( 'Edit value' );

		fireEvent.change( input, { target: { value: 'new value' } } );
		fireEvent.keyDown( input, { key: 'Escape' } );

		expect( mockOnSave ).not.toHaveBeenCalled();
		expect( screen.getByText( 'initial value' ) ).toBeInTheDocument();
	} );

	it( 'should save changes when clicking away', () => {
		renderComponent();
		fireEvent.doubleClick( screen.getByRole( 'button' ) );
		const input = screen.getByLabelText( 'Edit value' );

		fireEvent.change( input, { target: { value: 'new value' } } );
		fireEvent.click( screen.getByRole( 'presentation' ) );

		expect( mockOnSave ).toHaveBeenCalledWith( 'new value' );
		expect( screen.getByText( 'initial value' ) ).toBeInTheDocument();
	} );

	it( 'should have correct ARIA attributes', () => {
		renderComponent();
		const element = screen.getByRole( 'button' );

		expect( element ).toHaveAttribute( 'aria-label', 'Double click or press Space to edit' );
		expect( element ).toHaveAttribute( 'tabIndex', '0' );
	} );
} );
