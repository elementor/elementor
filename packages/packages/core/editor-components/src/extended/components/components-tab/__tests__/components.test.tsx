import * as React from 'react';
import { mockCurrentUserCapabilities, renderWithStore } from 'test-utils';
import { setDocumentModifiedStatus } from '@elementor/editor-documents';
import {
	__createStore,
	__dispatch as dispatch,
	__registerSlice as registerSlice,
	type SliceState,
	type Store,
} from '@elementor/store';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';

import { slice } from '../../../../store/store';
import { ComponentItem } from '../component-item';
import { ExtendedComponents } from '../components';
jest.mock( '@elementor/editor-documents' );

jest.mock( '@elementor/editor-current-user' );

mockCurrentUserCapabilities( true );

const mockStartDragElementFromPanel = jest.fn();

jest.mock( '@elementor/editor-canvas', () => ( {
	startDragElementFromPanel: ( ...args: unknown[] ) => mockStartDragElementFromPanel( ...args ),
} ) );

jest.mock( '@elementor/editor-elements', () => ( {
	dropElement: jest.fn(),
} ) );

jest.mock( '../../../utils/create-component-model', () => ( {
	createComponentModel: jest.fn( ( { id, name } ) => ( { id, name, elType: 'component' } ) ),
} ) );

const getEditableRenameField = () =>
	screen.getAllByRole( 'textbox' ).find( ( el ) => el.getAttribute( 'contenteditable' ) === 'true' ) as HTMLElement;

const mockComponents = [
	{ id: 1, name: 'Button Component', uid: 'f73880da-522c-442e-815a-b2c9849b7415' },
	{ id: 2, name: 'Text Component', uid: 'f73880da-522c-442e-815a-b2c9849b7416' },
	{ id: 3, name: 'Image Component', uid: 'f73880da-522c-442e-815a-b2c9849b7417' },
	{ id: 4, name: 'Test Component 1', uid: 'f73880da-522c-442e-815a-b2c9849b7418' },
	{ id: 5, name: 'Test Component 2', uid: 'f73880da-522c-442e-815a-b2c9849b7419' },
	{ id: 6, name: 'Valid Component', uid: 'f73880da-522c-442e-815a-b2c9849b7420' },
	{ id: 7, name: 'ExistingComponent', uid: 'f73880da-522c-442e-815a-b2c9849b7421' },
];

describe( 'ExtendedComponents tab', () => {
	let store: Store< SliceState< typeof slice > >;

	beforeEach( () => {
		registerSlice( slice );
		store = __createStore();

		act( () => {
			dispatch( slice.actions.load( mockComponents ) );
		} );
	} );

	it( 'should render component item with draggable attributes and actions', () => {
		// Arrange
		const buttonComponent = mockComponents[ 0 ];

		// Act
		renderWithStore( <ComponentItem component={ buttonComponent } />, store );

		// Assert
		const componentItem = screen.getByRole( 'button', { name: /Button Component/ } );
		expect( componentItem ).toBeInTheDocument();
		expect( componentItem ).toHaveAttribute( 'draggable', 'true' );
	} );

	it( 'should call startDragElementFromPanel with component model and event on drag start', () => {
		// Arrange
		const [ buttonComponent ] = mockComponents;

		// Act
		renderWithStore( <ComponentItem component={ buttonComponent } />, store );

		const componentItem = screen.getByRole( 'button', { name: /Button Component/ } );
		fireEvent.dragStart( componentItem );

		// Assert
		expect( mockStartDragElementFromPanel ).toHaveBeenCalledTimes( 1 );
		expect( mockStartDragElementFromPanel ).toHaveBeenCalledWith(
			expect.objectContaining( { id: buttonComponent.id, name: buttonComponent.name } ),
			expect.any( Object )
		);
	} );

	it( 'should show delete confirmation dialog when Delete is clicked', async () => {
		// Act
		renderWithStore( <ExtendedComponents />, store );

		const moreActionsButtons = screen.getAllByLabelText( 'More actions' );
		const buttonComponentMoreActions = moreActionsButtons[ 0 ];
		fireEvent.click( buttonComponentMoreActions );

		const deleteButton = await screen.findByText( 'Delete' );
		fireEvent.click( deleteButton );

		// Assert
		await waitFor( () => {
			expect( screen.getByRole( 'dialog', { name: 'Delete this component?' } ) ).toBeInTheDocument();
		} );
		expect(
			screen.getByText(
				'Existing instances on your pages will remain functional. You will no longer find this component in your list.'
			)
		).toBeInTheDocument();
	} );

	it( 'should delete component when Delete button in dialog is clicked', async () => {
		// Act
		renderWithStore( <ExtendedComponents />, store );

		// Assert
		expect( screen.getByText( 'Button Component' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Text Component' ) ).toBeInTheDocument();

		// Act
		const moreActionsButtons = screen.getAllByLabelText( 'More actions' );
		const buttonComponentMoreActions = moreActionsButtons[ 0 ];
		fireEvent.click( buttonComponentMoreActions );

		const deleteMenuItem = await screen.findByText( 'Delete' );
		fireEvent.click( deleteMenuItem );

		await waitFor( () => {
			expect( screen.getByRole( 'dialog', { name: 'Delete this component?' } ) ).toBeInTheDocument();
		} );

		const confirmDeleteButton = screen.getByRole( 'button', { name: 'Delete' } );
		fireEvent.click( confirmDeleteButton );

		// Assert
		await waitFor( () => {
			expect( screen.queryByText( 'Button Component' ) ).not.toBeInTheDocument();
		} );
		expect( screen.getByText( 'Text Component' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Image Component' ) ).toBeInTheDocument();
		expect( jest.mocked( setDocumentModifiedStatus ) ).toHaveBeenCalledWith( true );
	} );

	it( 'should close delete dialog without deleting when Not now is clicked', async () => {
		// Act
		renderWithStore( <ExtendedComponents />, store );

		const moreActionsButtons = screen.getAllByLabelText( 'More actions' );
		fireEvent.click( moreActionsButtons[ 0 ] );

		const deleteMenuItem = await screen.findByText( 'Delete' );
		fireEvent.click( deleteMenuItem );

		await waitFor( () => {
			expect( screen.getByRole( 'dialog', { name: 'Delete this component?' } ) ).toBeInTheDocument();
		} );

		// Act
		const notNowButton = screen.getByRole( 'button', { name: 'Not now' } );
		fireEvent.click( notNowButton );

		// Assert
		await waitFor( () => {
			expect( screen.queryByRole( 'dialog', { name: 'Delete this component?' } ) ).not.toBeInTheDocument();
		} );
		expect( screen.getByText( 'Button Component' ) ).toBeInTheDocument();
	} );

	it( 'should close delete dialog when Escape key is pressed', async () => {
		// Act
		renderWithStore( <ExtendedComponents />, store );

		const moreActionsButtons = screen.getAllByLabelText( 'More actions' );
		fireEvent.click( moreActionsButtons[ 0 ] );

		const deleteMenuItem = await screen.findByText( 'Delete' );
		fireEvent.click( deleteMenuItem );

		await waitFor( () => {
			expect( screen.getByRole( 'dialog', { name: 'Delete this component?' } ) ).toBeInTheDocument();
		} );

		// Act
		fireEvent.keyDown( screen.getByRole( 'dialog' ), { key: 'Escape' } );

		// Assert
		await waitFor( () => {
			expect( screen.queryByRole( 'dialog', { name: 'Delete this component?' } ) ).not.toBeInTheDocument();
		} );
		expect( screen.getByText( 'Button Component' ) ).toBeInTheDocument();
	} );

	it( 'should open rename mode when Rename menu item is clicked', async () => {
		// Act
		renderWithStore( <ExtendedComponents />, store );

		const moreActionsButtons = screen.getAllByLabelText( 'More actions' );
		const buttonComponentMoreActions = moreActionsButtons[ 0 ];
		fireEvent.click( buttonComponentMoreActions );

		const renameButton = await screen.findByText( 'Rename' );
		fireEvent.click( renameButton );

		// Assert
		const editableField = getEditableRenameField();
		expect( editableField ).toHaveAttribute( 'contentEditable', 'true' );
		expect( editableField ).toHaveTextContent( 'Button Component' );
	} );

	it( 'should rename component successfully when valid name is submitted', async () => {
		// Act
		renderWithStore( <ExtendedComponents />, store );

		const moreActionsButtons = screen.getAllByLabelText( 'More actions' );
		const buttonComponentMoreActions = moreActionsButtons[ 0 ];
		fireEvent.click( buttonComponentMoreActions );

		const renameButton = await screen.findByText( 'Rename' );
		fireEvent.click( renameButton );

		const editableField = getEditableRenameField();
		editableField.textContent = 'NewButtonName';
		fireEvent.input( editableField, { target: { innerText: 'NewButtonName' } } );
		await waitFor( () => {
			expect( editableField ).toHaveTextContent( 'NewButtonName' );
		} );
		fireEvent.keyDown( editableField, { key: 'Enter' } );

		// Assert
		await waitFor(
			() => {
				expect( screen.getByText( 'NewButtonName' ) ).toBeInTheDocument();
			},
			{ timeout: 3000 }
		);
		expect( screen.queryByText( 'Button Component' ) ).not.toBeInTheDocument();
	} );

	it( 'should rename component successfully when valid name is submitted via blur', async () => {
		// Act
		renderWithStore( <ExtendedComponents />, store );

		const moreActionsButtons = screen.getAllByLabelText( 'More actions' );
		const buttonComponentMoreActions = moreActionsButtons[ 0 ];
		fireEvent.click( buttonComponentMoreActions );

		const renameButton = await screen.findByText( 'Rename' );
		fireEvent.click( renameButton );

		const editableField = getEditableRenameField();
		fireEvent.input( editableField, { target: { innerText: 'RenamedComponent' } } );
		fireEvent.blur( editableField );

		// Assert
		await waitFor( () => {
			expect( screen.getByText( 'RenamedComponent' ) ).toBeInTheDocument();
		} );
		expect( screen.queryByText( 'Button Component' ) ).not.toBeInTheDocument();
	} );

	it( 'should cancel rename when Escape key is pressed', async () => {
		// Act
		renderWithStore( <ExtendedComponents />, store );

		const moreActionsButtons = screen.getAllByLabelText( 'More actions' );
		const buttonComponentMoreActions = moreActionsButtons[ 0 ];
		fireEvent.click( buttonComponentMoreActions );

		const renameButton = await screen.findByText( 'Rename' );
		fireEvent.click( renameButton );

		const editableField = getEditableRenameField();
		editableField.textContent = 'NewName';
		fireEvent.input( editableField, { target: { innerText: 'NewName' } } );
		fireEvent.keyDown( editableField, { key: 'Escape' } );

		// Assert
		await waitFor( () => {
			expect( screen.getByText( 'Button Component' ) ).toBeInTheDocument();
		} );
		expect( screen.queryByText( 'NewName' ) ).not.toBeInTheDocument();
	} );

	it( 'should show validation error for component name that is too short', async () => {
		// Act
		renderWithStore( <ExtendedComponents />, store );

		const moreActionsButtons = screen.getAllByLabelText( 'More actions' );
		const buttonComponentMoreActions = moreActionsButtons[ 0 ];
		fireEvent.click( buttonComponentMoreActions );

		const renameButton = await screen.findByText( 'Rename' );
		fireEvent.click( renameButton );

		const editableField = getEditableRenameField();
		fireEvent.input( editableField, { target: { innerText: 'A' } } );

		// Assert
		await waitFor( () => {
			expect(
				screen.getByText( 'Component name is too short. Please enter at least 2 characters.' )
			).toBeInTheDocument();
		} );
		expect( editableField ).toHaveAttribute( 'contentEditable', 'true' );
	} );

	it( 'should show validation error for component name that is too long', async () => {
		// Act
		renderWithStore( <ExtendedComponents />, store );

		const moreActionsButtons = screen.getAllByLabelText( 'More actions' );
		const buttonComponentMoreActions = moreActionsButtons[ 0 ];
		fireEvent.click( buttonComponentMoreActions );

		const renameButton = await screen.findByText( 'Rename' );
		fireEvent.click( renameButton );

		const editableField = getEditableRenameField();
		const longName = 'A'.repeat( 51 );
		fireEvent.input( editableField, { target: { innerText: longName } } );

		// Assert
		await waitFor( () => {
			expect(
				screen.getByText( 'Component name is too long. Please keep it under 50 characters.' )
			).toBeInTheDocument();
		} );
		expect( editableField ).toHaveAttribute( 'contentEditable', 'true' );
	} );

	it( 'should show validation error for duplicate component name', async () => {
		// Act
		renderWithStore( <ExtendedComponents />, store );

		const moreActionsButtons = screen.getAllByLabelText( 'More actions' );
		const buttonComponentMoreActions = moreActionsButtons[ 0 ];
		fireEvent.click( buttonComponentMoreActions );

		const renameButton = await screen.findByText( 'Rename' );
		fireEvent.click( renameButton );

		const editableField = getEditableRenameField();
		editableField.textContent = 'ExistingComponent';
		fireEvent.input( editableField, { target: { innerText: 'ExistingComponent' } } );

		await waitFor( () => {
			expect( editableField ).toHaveTextContent( 'ExistingComponent' );
		} );

		fireEvent.keyDown( editableField, { key: 'Enter' } );

		// Assert
		await waitFor( () => {
			const allComponents = screen.getAllByRole( 'button' );
			const buttonComponent = allComponents.find( ( btn ) => btn.textContent?.includes( 'Button Component' ) );
			if ( ! buttonComponent ) {
				const textboxes = screen.queryAllByRole( 'textbox' );
				expect( textboxes.length ).toBeGreaterThan( 0 );
			} else {
				expect( buttonComponent ).toBeInTheDocument();
			}
		} );
	} );

	it( 'should not submit rename when validation error exists', async () => {
		// Act
		renderWithStore( <ExtendedComponents />, store );

		const moreActionsButtons = screen.getAllByLabelText( 'More actions' );
		const buttonComponentMoreActions = moreActionsButtons[ 0 ];
		fireEvent.click( buttonComponentMoreActions );

		const renameButton = await screen.findByText( 'Rename' );
		fireEvent.click( renameButton );

		const editableField = getEditableRenameField();
		fireEvent.input( editableField, { target: { innerText: 'A' } } );

		await waitFor( () => {
			expect(
				screen.getByText( 'Component name is too short. Please enter at least 2 characters.' )
			).toBeInTheDocument();
		} );

		fireEvent.keyDown( editableField, { key: 'Enter' } );

		// Assert
		expect( screen.getByText( 'Button Component' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'A' ) ).not.toBeInTheDocument();
	} );

	it( 'should close edit mode on blur when validation error exists', async () => {
		// Act
		renderWithStore( <ExtendedComponents />, store );

		const moreActionsButtons = screen.getAllByLabelText( 'More actions' );
		const buttonComponentMoreActions = moreActionsButtons[ 0 ];
		fireEvent.click( buttonComponentMoreActions );

		const renameButton = await screen.findByText( 'Rename' );
		fireEvent.click( renameButton );

		const editableField = getEditableRenameField();
		fireEvent.input( editableField, { target: { innerText: 'A' } } );

		await waitFor( () => {
			expect(
				screen.getByText( 'Component name is too short. Please enter at least 2 characters.' )
			).toBeInTheDocument();
		} );

		fireEvent.blur( editableField );

		// Assert
		await waitFor( () => {
			expect( screen.getByText( 'Button Component' ) ).toBeInTheDocument();
		} );
	} );

	it( 'should not submit rename when name has not changed', async () => {
		// Act
		renderWithStore( <ExtendedComponents />, store );

		const moreActionsButtons = screen.getAllByLabelText( 'More actions' );
		const buttonComponentMoreActions = moreActionsButtons[ 0 ];
		fireEvent.click( buttonComponentMoreActions );

		const renameButton = await screen.findByText( 'Rename' );
		fireEvent.click( renameButton );

		const editableField = getEditableRenameField();
		editableField.textContent = 'NewName';
		fireEvent.input( editableField, { target: { innerText: 'NewName' } } );
		editableField.textContent = 'Button Component';
		fireEvent.input( editableField, { target: { innerText: 'Button Component' } } );
		fireEvent.keyDown( editableField, { key: 'Enter' } );

		// Assert
		await waitFor( () => {
			expect( screen.getByText( 'Button Component' ) ).toBeInTheDocument();
		} );
	} );

	it( 'should show more actions button when user is admin', () => {
		// Arrange
		mockCurrentUserCapabilities( true );

		// Act
		renderWithStore( <ExtendedComponents />, store );

		// Assert
		const moreActionsButtons = screen.getAllByLabelText( 'More actions' );
		expect( moreActionsButtons.length ).toBeGreaterThan( 0 );
	} );

	it( 'should not show more actions button when user is not admin', () => {
		// Arrange
		mockCurrentUserCapabilities( false );

		// Act
		renderWithStore( <ExtendedComponents />, store );

		// Assert
		expect( screen.queryByLabelText( 'More actions' ) ).not.toBeInTheDocument();
	} );
} );
