import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { getCurrentDocument, getV1DocumentsManager } from '@elementor/editor-documents';
import { notify } from '@elementor/editor-notifications';
import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';
import { httpService } from '@elementor/http-client';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';

import { TriggerButton } from '../components/trigger-button';
import { DialogHost } from '../dialog-host';
import { importDialogState } from '../state';

jest.mock( '@elementor/http-client', () => ( {
	httpService: jest.fn(),
} ) );

jest.mock( '@elementor/editor-notifications', () => ( {
	notify: jest.fn(),
} ) );

jest.mock( '@elementor/editor-documents', () => ( {
	...jest.requireActual( '@elementor/editor-documents' ),
	getCurrentDocument: jest.fn(),
	getV1DocumentsManager: jest.fn(),
} ) );

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	...jest.requireActual( '@elementor/editor-v1-adapters' ),
	__privateRunCommand: jest.fn().mockResolvedValue( undefined ),
} ) );

const ASYNC_TIMEOUT_MS = 5000;

const setupHttpServiceMock = () => {
	const post = jest.fn().mockResolvedValue( { data: { success: true, global_classes: {} } } );
	( httpService as jest.Mock ).mockReturnValue( { post } );
	return { post };
};

const setupDocumentsMock = () => {
	const invalidateCache = jest.fn();
	( getCurrentDocument as jest.Mock ).mockReturnValue( { id: 99 } );
	( getV1DocumentsManager as jest.Mock ).mockReturnValue( { invalidateCache } );
	return { invalidateCache };
};

const openDialog = () => {
	act( () => {
		importDialogState.open();
	} );
};

const dropFile = ( file: File ) => {
	const dropTarget = screen.getByRole( 'region', { name: 'Design system file dropzone' } );
	fireEvent.dragEnter( dropTarget );
	fireEvent.drop( dropTarget, {
		dataTransfer: { files: [ file ] },
	} );
};

const submitImport = ( fileName = 'tokens.json' ) => {
	const file = new File( [ '{}' ], fileName, { type: 'application/json' } );
	dropFile( file );
	fireEvent.click( screen.getByLabelText( 'Keep existing values' ) );
	fireEvent.click( screen.getByRole( 'button', { name: 'Import' } ) );
	return file;
};

describe( '<ImportDesignSystemDialog />', () => {
	beforeEach( () => {
		act( () => {
			importDialogState.close();
			importDialogState.markIdle();
		} );
		jest.clearAllMocks();
	} );

	it( 'is hidden by default and opens when state opens', async () => {
		setupHttpServiceMock();
		setupDocumentsMock();

		renderWithTheme( <DialogHost /> );

		expect( screen.queryByText( 'Import Design System' ) ).not.toBeInTheDocument();

		openDialog();

		await waitFor( () => {
			expect( screen.getByText( 'Import Design System' ) ).toBeInTheDocument();
		} );
	} );

	it( 'disables the import button until a file and conflict strategy are selected', async () => {
		setupHttpServiceMock();
		setupDocumentsMock();
		renderWithTheme( <DialogHost /> );
		openDialog();

		const importButton = await screen.findByRole( 'button', { name: 'Import' } );
		expect( importButton ).toBeDisabled();

		const file = new File( [ '{}' ], 'tokens.json', { type: 'application/json' } );
		dropFile( file );

		expect( importButton ).toBeDisabled();
		expect( screen.getByText( 'tokens.json' ) ).toBeInTheDocument();

		fireEvent.click( screen.getByLabelText( 'Replace existing values' ) );

		await waitFor( () => expect( importButton ).toBeEnabled() );
	} );

	it( 'fires the in-progress notification, closes the dialog and triggers the import request', async () => {
		const { post } = setupHttpServiceMock();
		setupDocumentsMock();
		renderWithTheme( <DialogHost /> );
		openDialog();
		await screen.findByText( 'Import Design System' );

		const file = submitImport();

		const inProgressCall = ( notify as jest.Mock ).mock.calls.find(
			( [ payload ] ) => payload.id === 'design-system-import-started'
		);
		expect( inProgressCall?.[ 0 ].type ).toBe( 'info' );

		await waitFor( () => {
			expect( screen.queryByText( 'Import Design System' ) ).not.toBeInTheDocument();
		} );

		await waitFor( () => expect( post ).toHaveBeenCalledTimes( 1 ), { timeout: ASYNC_TIMEOUT_MS } );
		const [ url, body, options ] = post.mock.calls[ 0 ];
		expect( url ).toBe( '/design-system/import' );
		expect( body ).toBeInstanceOf( FormData );
		expect( ( body as FormData ).get( 'file' ) ).toBe( file );
		expect( ( body as FormData ).get( 'conflict_strategy' ) ).toBe( 'keep' );
		expect( options.headers[ 'Content-Type' ] ).toBe( 'multipart/form-data' );
	} );

	it( 'on success: refreshes globals, reloads the document and notifies success', async () => {
		setupHttpServiceMock();
		const { invalidateCache } = setupDocumentsMock();

		const eventListener = jest.fn();
		window.addEventListener( 'elementor/global-styles/imported', eventListener );

		renderWithTheme( <DialogHost /> );
		openDialog();
		await screen.findByText( 'Import Design System' );

		submitImport();

		await waitFor(
			() => {
				const successCall = ( notify as jest.Mock ).mock.calls.find(
					( [ payload ] ) => payload.id === 'design-system-import-succeeded'
				);
				expect( successCall?.[ 0 ].type ).toBe( 'success' );
			},
			{ timeout: ASYNC_TIMEOUT_MS }
		);

		expect( eventListener ).toHaveBeenCalledTimes( 1 );
		expect( invalidateCache ).toHaveBeenCalledTimes( 1 );
		expect( runCommand ).toHaveBeenCalledWith( 'editor/documents/switch', expect.objectContaining( { id: 99 } ) );
		expect( importDialogState.getSnapshot().isImporting ).toBe( false );

		window.removeEventListener( 'elementor/global-styles/imported', eventListener );
	} );

	it( 'on failure: notifies error and resets the importing flag', async () => {
		const post = jest.fn().mockRejectedValue( new Error( 'boom' ) );
		( httpService as jest.Mock ).mockReturnValue( { post } );
		setupDocumentsMock();

		renderWithTheme( <DialogHost /> );
		openDialog();
		await screen.findByText( 'Import Design System' );

		submitImport();

		await waitFor(
			() => {
				const errorCall = ( notify as jest.Mock ).mock.calls.find(
					( [ payload ] ) => payload.id === 'design-system-import-failed'
				);
				expect( errorCall?.[ 0 ].type ).toBe( 'error' );
			},
			{ timeout: ASYNC_TIMEOUT_MS }
		);

		expect( runCommand ).not.toHaveBeenCalled();
		expect( importDialogState.getSnapshot().isImporting ).toBe( false );
	} );
} );

describe( '<TriggerButton />', () => {
	beforeEach( () => {
		act( () => {
			importDialogState.close();
			importDialogState.markIdle();
		} );
	} );

	it( 'opens the dialog state when clicked while idle', () => {
		renderWithTheme( <TriggerButton /> );

		fireEvent.click( screen.getByRole( 'button', { name: 'Import Design System' } ) );

		expect( importDialogState.getSnapshot().isOpen ).toBe( true );
	} );

	it( 'is disabled while an import is in progress', async () => {
		renderWithTheme( <TriggerButton /> );

		const initialButton = screen.getByRole( 'button', { name: 'Import Design System' } );
		expect( initialButton ).toBeEnabled();

		act( () => {
			importDialogState.markImporting();
		} );

		await waitFor( () => {
			expect( screen.getByRole( 'button', { name: 'Importing design system…' } ) ).toBeDisabled();
		} );
	} );
} );
