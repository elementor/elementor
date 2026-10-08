import * as React from 'react';
import { useEffect, useRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { VariableEditableCell } from '../variable-editable-cell';

jest.mock( '@elementor/ui', () => ( {
	...jest.requireActual( '@elementor/ui' ),
	ClickAwayListener: ( {
		children,
		onClickAway,
	}: {
		children: React.ReactNode;
		onClickAway: ( event: MouseEvent | TouchEvent ) => void;
	} ) => {
		const rootRef = useRef< HTMLDivElement >( null );

		useEffect( () => {
			const handleMouseDown = ( event: MouseEvent ) => {
				if ( rootRef.current?.contains( event.target as Node ) ) {
					return;
				}

				onClickAway( event );
			};

			document.addEventListener( 'mousedown', handleMouseDown );

			return () => document.removeEventListener( 'mousedown', handleMouseDown );
		}, [ onClickAway ] );

		return (
			<>
				<div ref={ rootRef }>{ children }</div>
				<div role="presentation" aria-label="Click away area" />
			</>
		);
	},
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

	const getEditTrigger = () =>
		screen.getByRole( 'button', { name: 'Double click or press Space to edit' } );

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
		fireEvent.doubleClick( getEditTrigger() );

		expect( screen.getByLabelText( 'Edit value' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'initial value' ) ).not.toBeInTheDocument();
	} );

	it( 'should enter edit mode on space key press', () => {
		renderComponent();
		const button = getEditTrigger();

		fireEvent.keyDown( button, { key: ' ' } );

		expect( screen.getByLabelText( 'Edit value' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'initial value' ) ).not.toBeInTheDocument();
	} );

	it( 'should save changes on Enter key press', () => {
		renderComponent();
		fireEvent.doubleClick( getEditTrigger() );
		const input = screen.getByLabelText( 'Edit value' );

		fireEvent.change( input, { target: { value: 'new value' } } );
		fireEvent.keyDown( input, { key: 'Enter' } );

		expect( mockOnChange ).toHaveBeenCalledWith( 'new value' );
		expect( screen.getByText( 'initial value' ) ).toBeInTheDocument();
	} );

	it( 'should cancel changes on Escape key press', () => {
		renderComponent();
		fireEvent.doubleClick( getEditTrigger() );
		const input = screen.getByLabelText( 'Edit value' );

		fireEvent.change( input, { target: { value: 'new value' } } );
		fireEvent.keyDown( input, { key: 'Escape' } );

		expect( mockOnChange ).not.toHaveBeenCalled();
		expect( screen.getByText( 'initial value' ) ).toBeInTheDocument();
	} );

	it( 'should save changes when clicking away', () => {
		renderComponent();
		fireEvent.doubleClick( getEditTrigger() );
		const input = screen.getByLabelText( 'Edit value' );

		fireEvent.change( input, { target: { value: 'new value' } } );
		fireEvent.mouseDown( screen.getByRole( 'presentation' ) );

		expect( mockOnChange ).toHaveBeenCalledWith( 'new value' );
		expect( screen.getByText( 'initial value' ) ).toBeInTheDocument();
	} );

	it( 'should not save when clicking inside a portaled MUI overlay', () => {
		renderComponent();
		fireEvent.doubleClick( getEditTrigger() );
		const input = screen.getByLabelText( 'Edit value' );

		fireEvent.change( input, { target: { value: 'new value' } } );

		const portalTarget = document.createElement( 'span' );
		const portal = document.createElement( 'div' );
		portal.className = 'MuiPopover-root';
		portal.appendChild( portalTarget );
		document.body.appendChild( portal );

		const event = new MouseEvent( 'mousedown', { bubbles: true } );
		Object.defineProperty( event, 'target', { value: portalTarget } );
		document.dispatchEvent( event );

		expect( mockOnChange ).not.toHaveBeenCalled();
		expect( screen.getByLabelText( 'Edit value' ) ).toBeInTheDocument();

		document.body.removeChild( portal );
	} );

	it( 'should have correct ARIA attributes', () => {
		renderComponent();
		const element = getEditTrigger();

		expect( element ).toHaveAttribute( 'aria-label', 'Double click or press Space to edit' );
		expect( element ).toHaveAttribute( 'tabIndex', '0' );
	} );

	it( 'should call onChange callback when value changes', () => {
		// Arrange
		renderComponent();
		fireEvent.doubleClick( getEditTrigger() );
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
		fireEvent.doubleClick( getEditTrigger() );
		const input = screen.getByLabelText( 'Edit value' );

		// Act
		fireEvent.keyDown( input, { key: 'Enter' } );

		// Assert
		expect( mockOnChange ).toHaveBeenCalledWith( 'initial value' );
	} );

	it( 'should enter edit mode automatically when autoEdit is true', () => {
		// Arrange
		const mockOnAutoEditComplete = jest.fn();
		const props = {
			initialValue: 'auto-edit value',
			editableElement: TestEditableElement,
			children: <span>auto-edit value</span>,
			onChange: mockOnChange,
			autoEdit: true,
			onAutoEditComplete: mockOnAutoEditComplete,
		};

		// Act
		render( <VariableEditableCell { ...props } /> );

		// Assert
		expect( screen.getByLabelText( 'Edit value' ) ).toBeInTheDocument();
		expect( mockOnAutoEditComplete ).toHaveBeenCalled();
	} );
} );
