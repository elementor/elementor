import * as React from 'react';
import { createMockStyleDefinition, renderWithStore } from 'test-utils';
import { type StyleDefinition } from '@elementor/editor-styles';
import { validateStyleLabel } from '@elementor/editor-styles-repository';
import {
	__createStore as createStore,
	__dispatch as dispatch,
	__registerSlice as registerSlice,
} from '@elementor/store';
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';

import { slice } from '../../../store';
import { GlobalClassesList } from '../global-classes-list';

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	...jest.requireActual( '@elementor/editor-v1-adapters' ),
	blockCommand: jest.fn(),
} ) );

jest.mock( '@elementor/editor-styles-repository' );

describe( 'GlobalClassesList', () => {
	let store: ReturnType< typeof createStore >;

	beforeEach( () => {
		jest.mocked( validateStyleLabel ).mockReturnValue( { isValid: true, errorMessage: null } );

		registerSlice( slice );

		store = createStore();
	} );

	it( 'should render the list of classes with its order', () => {
		// Arrange.
		mockClasses( [
			{ id: 'class-1', label: 'Class 1' },
			{ id: 'class-2', label: 'Class 2' },
		] );

		// Act.
		renderWithStore( <GlobalClassesList />, store );

		// Assert.
		const [ firstClass, secondClass ] = screen.getAllByRole( 'listitem' );

		expect( within( firstClass ).getByText( 'Class 1' ) ).toBeInTheDocument();

		expect( within( secondClass ).getByText( 'Class 2' ) ).toBeInTheDocument();
	} );

	it( 'should allow renaming a class on click', async () => {
		// Arrange.
		mockClasses( [ { id: 'class-1', label: 'Class 1' } ] );

		// Act.
		renderWithStore( <GlobalClassesList />, store );

		fireEvent.doubleClick( screen.getByRole( 'button', { name: 'Class 1' } ) );

		const editableField = screen.getByRole( 'textbox' );

		// Assert.
		expect( editableField ).toBeInTheDocument();

		// Act.
		fireEvent.input( editableField, { target: { innerText: 'New-Class-Name' } } );

		fireEvent.keyDown( editableField, { key: 'Enter' } );

		// Assert.
		expect( editableField ).not.toBeInTheDocument();

		expect( screen.getByText( 'New-Class-Name' ) ).toBeInTheDocument();
	} );

	it( 'should not allow rename if the name is invalid', () => {
		// Arrange.
		mockClasses( [
			{ id: 'class-1', label: 'Class-1' },
			{ id: 'class-2', label: 'Class-2' },
		] );

		jest.mocked( validateStyleLabel ).mockReturnValue( { isValid: false, errorMessage: 'Test Error' } );

		// Act.
		renderWithStore( <GlobalClassesList />, store );

		fireEvent.doubleClick( screen.getByRole( 'button', { name: 'Class-1' } ) );

		const editableField = screen.getByRole( 'textbox' );

		// Assert.
		expect( editableField ).toBeInTheDocument();

		// Act.
		fireEvent.input( editableField, { target: { innerText: 'new-name' } } );

		fireEvent.keyDown( editableField, { key: 'Enter' } );

		// Assert.
		expect( editableField ).toBeInTheDocument();

		expect( screen.queryByText( 'new-name' ) ).not.toBeInTheDocument();
	} );

	it( 'should allow renaming a class from actions menu', async () => {
		// Arrange.
		mockClasses( [ { id: 'class-1', label: 'Class 1' } ] );

		// Act.
		renderWithStore( <GlobalClassesList />, store );

		fireEvent.click( screen.getByRole( 'button', { name: 'More actions' } ) );

		const renameButton = screen.getByRole( 'menuitem', { name: 'Rename' } );

		// Assert.
		expect( renameButton ).toBeInTheDocument();

		// Act.
		fireEvent.click( renameButton );

		const editableField = screen.getByRole( 'textbox' );

		// Assert.
		// Menu should be closed after clicking rename.
		await waitFor( () => {
			expect( renameButton ).not.toBeInTheDocument();
		} );

		expect( editableField ).toBeInTheDocument();

		// Act.
		fireEvent.input( editableField, { target: { innerText: 'New-Class-Name' } } );

		fireEvent.keyDown( editableField, { key: 'Enter' } );

		// Assert.
		expect( editableField ).not.toBeInTheDocument();

		expect( screen.getByText( 'New-Class-Name' ) ).toBeInTheDocument();
	} );

	it( 'should show empty state when there are no classes', () => {
		// Arrange.
		mockClasses( [] );

		// Act.
		renderWithStore( <GlobalClassesList />, store );

		// Assert.
		expect( screen.getByText( 'There are no global classes yet.' ) ).toBeInTheDocument();
	} );

	it( 'should allow deleting a class from actions menu', async () => {
		// Arrange.
		mockClasses( [
			{ id: 'class-1', label: 'Class 1' },
			{ id: 'class-2', label: 'Class 2' },
		] );

		// Act.
		renderWithStore( <GlobalClassesList />, store );

		const [ firstClass ] = screen.getAllByRole( 'listitem' );

		fireEvent.click( within( firstClass ).getByRole( 'button', { name: 'More actions' } ) );

		const deleteButton = screen.getByRole( 'menuitem', { name: 'Delete' } );

		fireEvent.click( deleteButton );

		// Assert.
		await waitFor( () => {
			expect( screen.getByRole( 'dialog', { name: 'Delete this class?' } ) ).toBeInTheDocument();
		} );

		// Act.
		fireEvent.click( screen.getByRole( 'button', { name: 'Delete' } ) );

		// Assert.
		expect( screen.queryByText( 'Class 1' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'Class 2' ) ).toBeInTheDocument();
	} );

	it( 'should close the delete dialog when clicking cancel, without deleting', async () => {
		// Arrange.
		mockClasses( [ { id: 'class-1', label: 'Class 1' } ] );

		// Act.
		renderWithStore( <GlobalClassesList />, store );

		fireEvent.click( screen.getByRole( 'button', { name: 'More actions' } ) );

		const deleteButton = screen.getByRole( 'menuitem', { name: 'Delete' } );

		fireEvent.click( deleteButton );

		// Assert.
		await waitFor( () => {
			expect( screen.getByRole( 'dialog', { name: 'Delete this class?' } ) ).toBeInTheDocument();
		} );

		// Act.
		fireEvent.click( screen.getByRole( 'button', { name: 'Not now' } ) );

		// Assert.
		expect( screen.queryByRole( 'dialog', { name: 'Delete this class?' } ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'Class 1' ) ).toBeInTheDocument();
	} );
} );

const mockClasses = ( classes: Pick< StyleDefinition, 'id' | 'label' >[] ) => {
	const data = {
		items: Object.fromEntries(
			classes.map( ( { id, label } ) => [ id, createMockStyleDefinition( { id, label } ) ] )
		),
		order: classes.map( ( { id } ) => id ),
	};

	act( () =>
		dispatch(
			slice.actions.load( {
				preview: data,
				frontend: data,
			} )
		)
	);
};
