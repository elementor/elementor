import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { EditableField } from '../../components/editable-field';
import { useEditable } from '../use-editable';

// Test utility component that uses the hook with EditableField
const TestComponent = ( {
	value,
	onSubmit,
	validation,
	onClick,
	onError,
}: {
	value: string;
	onSubmit: ( value: string ) => unknown;
	validation?: ( value: string ) => string | null;
	onClick?: ( event: React.MouseEvent< HTMLDivElement > ) => void;
	onError?: ( error: string | null ) => void;
} ) => {
	const { ref, isEditing, openEditMode, error, getProps } = useEditable( {
		value,
		onSubmit,
		validation,
		onClick,
		onError,
	} );

	return (
		<div>
			<button onClick={ openEditMode } data-testid="open-edit">
				Open Edit
			</button>
			<EditableField ref={ ref } { ...getProps() } data-testid="editable-field" />
			<div data-testid="editing-state">{ isEditing ? 'editing' : 'not-editing' }</div>
			<div data-testid="error-state">{ error || 'no-error' }</div>
		</div>
	);
};

describe( 'useEditable', () => {
	it( 'should return editable content attributes and handlers', () => {
		// Arrange & Act.
		render( <TestComponent value="" onSubmit={ jest.fn() } /> );

		// Assert.
		const editableField = screen.getByRole( 'textbox' );

		expect( editableField ).toHaveAttribute( 'role', 'textbox' );
		expect( editableField ).toHaveAttribute( 'contentEditable', 'false' );
		expect( editableField ).toHaveTextContent( '' );
	} );

	it( 'should set editable to true', () => {
		// Arrange & Act.
		render( <TestComponent value="" onSubmit={ jest.fn() } /> );

		// Assert.
		const editableField = screen.getByRole( 'textbox' );
		const editingState = screen.getByText( 'not-editing' );
		const openEditButton = screen.getByRole( 'button', { name: 'Open Edit' } );

		expect( editingState ).toHaveTextContent( 'not-editing' );
		expect( editableField ).toHaveAttribute( 'contentEditable', 'false' );

		// Act.
		fireEvent.click( openEditButton );

		// Assert.
		expect( screen.getByText( 'editing' ) ).toBeInTheDocument();
		expect( editableField ).toHaveAttribute( 'contentEditable', 'true' );
	} );

	it( 'should call onSubmit with the new value on enter', async () => {
		// Arrange.
		const onSubmit = jest.fn();
		const newValue = 'New value';
		const validation = jest.fn().mockReturnValue( null );

		render( <TestComponent value={ 'Some value' } onSubmit={ onSubmit } validation={ validation } /> );

		const editableField = screen.getByRole( 'textbox' );
		const openEditButton = screen.getByRole( 'button', { name: 'Open Edit' } );

		// Act.
		fireEvent.click( openEditButton );

		fireEvent.input( editableField, { target: { innerText: newValue } } );

		// Assert.
		expect( validation ).toHaveBeenCalledWith( newValue );

		// Act.
		fireEvent.keyDown( editableField, { key: 'Enter' } );

		fireEvent.blur( editableField );

		// Assert.
		expect( onSubmit ).toHaveBeenCalledWith( newValue );
	} );

	it( 'should remove the editable content attribute on blur', () => {
		// Arrange & Act.
		render( <TestComponent value="" onSubmit={ jest.fn() } /> );

		fireEvent.click( screen.getByRole( 'button', { name: 'Open Edit' } ) );

		// Assert.
		expect( screen.getByText( 'editing' ) ).toBeInTheDocument();

		// Act.
		fireEvent.blur( screen.getByRole( 'textbox' ) );

		// Assert.
		expect( screen.getByText( 'not-editing' ) ).toBeInTheDocument();
	} );

	it( 'should call onSubmit with the new value on blur', () => {
		// Arrange.
		const onSubmit = jest.fn();
		const newValue = 'New value';
		const validation = jest.fn().mockReturnValue( null );

		render( <TestComponent value={ 'Some value' } onSubmit={ onSubmit } validation={ validation } /> );

		const editableField = screen.getByRole( 'textbox' );

		// Act.
		fireEvent.click( screen.getByRole( 'button', { name: 'Open Edit' } ) );

		fireEvent.input( editableField, { target: { innerText: newValue } } );

		// Assert.
		expect( validation ).toHaveBeenCalledWith( newValue );

		// Act.
		fireEvent.blur( editableField );

		// Assert.
		expect( onSubmit ).toHaveBeenCalledWith( newValue );
	} );

	it( 'should set error message id validation fails', () => {
		// Arrange.
		const newValue = 'invalid-value';
		const onSubmit = jest.fn();

		const validation = ( v: string ) => {
			if ( v === newValue ) {
				return 'Nope';
			}

			return null;
		};

		render( <TestComponent value={ 'Some value' } onSubmit={ onSubmit } validation={ validation } /> );

		// Act.
		fireEvent.click( screen.getByRole( 'button', { name: 'Open Edit' } ) );

		// Assert.
		expect( screen.getByText( 'no-error' ) ).toBeInTheDocument();

		// Act.
		const editableField = screen.getByRole( 'textbox' );
		fireEvent.input( editableField, { target: { innerText: newValue } } );

		// Assert.
		expect( screen.getByText( 'Nope' ) ).toBeInTheDocument();

		// Act.
		fireEvent.keyDown( editableField, { key: 'Enter' } );

		// Assert.
		expect( onSubmit ).not.toHaveBeenCalled();
	} );

	it( 'should not run validation & submit if the value has not changed', () => {
		// Arrange.
		const value = 'initial value';
		const onSubmit = jest.fn();

		const validation = () => {
			return 'test-error';
		};

		render( <TestComponent value={ value } onSubmit={ onSubmit } validation={ validation } /> );

		const editableField = screen.getByRole( 'textbox' );
		const openEditButton = screen.getByRole( 'button', { name: 'Open Edit' } );

		// Act.
		fireEvent.click( openEditButton );

		// Assert.
		expect( screen.getByText( 'no-error' ) ).toBeInTheDocument();

		// Act.
		fireEvent.input( editableField, { target: { innerText: 'new value' } } );

		// Assert.
		expect( screen.getByText( 'test-error' ) ).toBeInTheDocument();

		// Act.
		fireEvent.input( editableField, { target: { innerText: value } } );

		// Assert.
		expect( screen.getByText( 'no-error' ) ).toBeInTheDocument();

		// Act.
		fireEvent.keyDown( editableField, { key: 'Enter' } );

		// Assert.
		expect( onSubmit ).not.toHaveBeenCalled();
	} );
} );
