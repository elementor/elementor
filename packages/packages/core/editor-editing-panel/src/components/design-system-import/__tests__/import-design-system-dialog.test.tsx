import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { getCurrentDocument, getV1DocumentsManager } from '@elementor/editor-documents';
import { dismissNotification, notify } from '@elementor/editor-notifications';
import { closeDialog, openDialog } from '@elementor/editor-ui';
import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';
import { service as variablesService } from '@elementor/editor-variables';
import { httpService } from '@elementor/http-client';
import { type QueryClient, QueryClientProvider } from '@elementor/query';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';

import { TriggerButton } from '../components/trigger-button';
import { IMPORT_DESIGN_SYSTEM_MUTATION_KEY } from '../hooks/use-import-request';
import { ImportDesignSystemDialog } from '../import-design-system-dialog';
import { ImportResultsDialog } from '../import-results-dialog';

jest.mock( '@elementor/http-client', () => ( {
	httpService: jest.fn(),
} ) );

jest.mock( '@elementor/editor-notifications', () => ( {
	dismissNotification: jest.fn(),
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

jest.mock( '@elementor/editor-ui', () => ( {
	...jest.requireActual( '@elementor/editor-ui' ),
	openDialog: jest.fn(),
	closeDialog: jest.fn(),
} ) );

jest.mock( '@elementor/editor-variables', () => ( {
	service: { load: jest.fn().mockResolvedValue( undefined ) },
} ) );

jest.mock( '@elementor/query', () => {
	const actual = jest.requireActual( '@elementor/query' );
	const sharedClient = new actual.QueryClient( {
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	} );

	return {
		...actual,
		getQueryClient: jest.fn( () => sharedClient ),
		__sharedClient: sharedClient,
	};
} );

const ASYNC_TIMEOUT_MS = 5000;

const sharedQueryClient: QueryClient = require( '@elementor/query' ).__sharedClient;

const renderWithQuery = ( ui: React.ReactElement ) =>
	renderWithTheme( <QueryClientProvider client={ sharedQueryClient }>{ ui }</QueryClientProvider> );

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

const dropFile = ( file: File ) => {
	const dropTarget = screen.getByRole( 'region', { name: 'Design system file dropzone' } );
	fireEvent.dragEnter( dropTarget );
	fireEvent.drop( dropTarget, {
		dataTransfer: { files: [ file ] },
	} );
};

const submitImport = ( fileName = 'design-system.zip' ) => {
	const file = new File( [ 'zip' ], fileName, { type: 'application/zip' } );
	dropFile( file );
	fireEvent.click( screen.getByLabelText( 'Keep existing values' ) );
	fireEvent.click( screen.getByRole( 'button', { name: 'Import' } ) );
	return file;
};

const isImporting = () => sharedQueryClient.isMutating( { mutationKey: [ ...IMPORT_DESIGN_SYSTEM_MUTATION_KEY ] } ) > 0;

describe( '<ImportDesignSystemDialog />', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		sharedQueryClient.clear();
	} );

	it( 'disables the import button until a file and conflict strategy are selected', async () => {
		setupHttpServiceMock();
		setupDocumentsMock();

		renderWithQuery( <ImportDesignSystemDialog onClose={ jest.fn() } /> );

		const importButton = await screen.findByRole( 'button', { name: 'Import' } );
		expect( importButton ).toBeDisabled();

		const file = new File( [ 'zip' ], 'design-system.zip', { type: 'application/zip' } );
		dropFile( file );

		expect( importButton ).toBeDisabled();
		expect( screen.getByText( 'design-system.zip' ) ).toBeInTheDocument();

		fireEvent.click( screen.getByLabelText( 'Replace existing values' ) );

		await waitFor( () => expect( importButton ).toBeEnabled() );
	} );

	it( 'fires the in-progress notification, calls onClose and triggers the import request', async () => {
		const { post } = setupHttpServiceMock();
		setupDocumentsMock();
		const onClose = jest.fn();

		renderWithQuery( <ImportDesignSystemDialog onClose={ onClose } /> );

		const file = submitImport();

		const inProgressCall = ( notify as jest.Mock ).mock.calls.find(
			( [ payload ] ) => payload.id === 'design-system-import-started'
		);
		expect( inProgressCall?.[ 0 ].type ).toBe( 'info' );

		expect( onClose ).toHaveBeenCalledTimes( 1 );

		await waitFor( () => expect( post ).toHaveBeenCalledTimes( 1 ), { timeout: ASYNC_TIMEOUT_MS } );
		const [ url, body, options ] = post.mock.calls[ 0 ];
		expect( url ).toBe( '/design-system/import' );
		expect( body ).toBeInstanceOf( FormData );
		expect( ( body as FormData ).get( 'file' ) ).toBe( file );
		expect( ( body as FormData ).get( 'conflict_strategy' ) ).toBe( 'keep' );
		expect( options.headers[ 'Content-Type' ] ).toBe( 'multipart/form-data' );
	} );

	it( 'on success: refreshes globals, reloads the document and notifies success with a View action', async () => {
		setupHttpServiceMock();
		const { invalidateCache } = setupDocumentsMock();

		const eventListener = jest.fn();
		window.addEventListener( 'elementor/global-styles/imported', eventListener );

		renderWithQuery( <ImportDesignSystemDialog onClose={ jest.fn() } /> );

		submitImport();

		const successCall = await waitFor(
			() => {
				const call = ( notify as jest.Mock ).mock.calls.find(
					( [ payload ] ) => payload.id === 'design-system-import-succeeded'
				);
				expect( call?.[ 0 ].type ).toBe( 'success' );
				return call;
			},
			{ timeout: ASYNC_TIMEOUT_MS }
		);

		expect( dismissNotification ).toHaveBeenCalledWith( 'design-system-import-started' );
		expect( eventListener ).toHaveBeenCalledTimes( 1 );
		expect( variablesService.load ).toHaveBeenCalledTimes( 1 );
		expect( invalidateCache ).toHaveBeenCalledTimes( 1 );
		expect( runCommand ).toHaveBeenCalledWith( 'editor/documents/switch', expect.objectContaining( { id: 99 } ) );

		await waitFor( () => expect( isImporting() ).toBe( false ) );

		const successPayload = successCall ? successCall[ 0 ] : undefined;
		const viewAction = successPayload?.additionalActionProps?.[ 0 ];
		expect( viewAction ).toEqual( expect.objectContaining( { children: 'View' } ) );

		act( () => {
			viewAction?.onClick?.();
		} );

		expect( dismissNotification ).toHaveBeenCalledWith( 'design-system-import-succeeded' );
		expect( openDialog ).toHaveBeenCalledWith(
			expect.objectContaining( {
				component: expect.objectContaining( { type: ImportResultsDialog } ),
			} )
		);

		window.removeEventListener( 'elementor/global-styles/imported', eventListener );
	} );

	it( 'on failure: notifies error and the Try again action reopens the import dialog', async () => {
		const post = jest.fn().mockRejectedValue( new Error( 'boom' ) );
		( httpService as jest.Mock ).mockReturnValue( { post } );
		setupDocumentsMock();

		renderWithQuery( <ImportDesignSystemDialog onClose={ jest.fn() } /> );

		submitImport();

		const errorCall = await waitFor(
			() => {
				const call = ( notify as jest.Mock ).mock.calls.find(
					( [ payload ] ) => payload.id === 'design-system-import-failed'
				);
				expect( call?.[ 0 ].type ).toBe( 'error' );
				return call;
			},
			{ timeout: ASYNC_TIMEOUT_MS }
		);

		expect( dismissNotification ).toHaveBeenCalledWith( 'design-system-import-started' );
		expect( runCommand ).not.toHaveBeenCalled();

		await waitFor( () => expect( isImporting() ).toBe( false ) );

		const errorPayload = errorCall ? errorCall[ 0 ] : undefined;
		const retryAction = errorPayload?.additionalActionProps?.[ 0 ];
		expect( retryAction ).toEqual( expect.objectContaining( { children: 'Try again' } ) );

		act( () => {
			retryAction?.onClick?.();
		} );

		expect( dismissNotification ).toHaveBeenCalledWith( 'design-system-import-failed' );
		expect( openDialog ).toHaveBeenCalledWith(
			expect.objectContaining( {
				component: expect.objectContaining( { type: ImportDesignSystemDialog } ),
			} )
		);
	} );

	it( 'Try again is a no-op while another import is in progress', async () => {
		const post = jest.fn().mockRejectedValue( new Error( 'boom' ) );
		( httpService as jest.Mock ).mockReturnValue( { post } );
		setupDocumentsMock();

		renderWithQuery( <ImportDesignSystemDialog onClose={ jest.fn() } /> );

		submitImport();

		const errorCall = await waitFor(
			() => {
				const call = ( notify as jest.Mock ).mock.calls.find(
					( [ payload ] ) => payload.id === 'design-system-import-failed'
				);
				expect( call?.[ 0 ].type ).toBe( 'error' );
				return call;
			},
			{ timeout: ASYNC_TIMEOUT_MS }
		);

		( openDialog as jest.Mock ).mockClear();

		const isMutatingSpy = jest.spyOn( sharedQueryClient, 'isMutating' ).mockReturnValue( 1 );

		const retryAction = errorCall?.[ 0 ].additionalActionProps?.[ 0 ];

		act( () => {
			retryAction?.onClick?.();
		} );

		expect( openDialog ).not.toHaveBeenCalled();

		isMutatingSpy.mockRestore();
	} );
} );

describe( '<ImportResultsDialog />', () => {
	it( 'renders the result counts and calls onClose when Close is clicked', () => {
		const onClose = jest.fn();

		renderWithTheme(
			<ImportResultsDialog result={ { successfulCount: 7, unsuccessfulCount: 2 } } onClose={ onClose } />
		);

		expect( screen.getByText( 'Import results' ) ).toBeInTheDocument();
		expect( screen.getByText( '7' ) ).toBeInTheDocument();
		expect( screen.getByText( '2' ) ).toBeInTheDocument();

		fireEvent.click( screen.getByRole( 'button', { name: 'Close' } ) );

		expect( onClose ).toHaveBeenCalledTimes( 1 );
	} );
} );

describe( '<TriggerButton />', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		sharedQueryClient.clear();
	} );

	it( 'opens the import dialog via openDialog when clicked while idle', () => {
		renderWithQuery( <TriggerButton /> );

		fireEvent.click( screen.getByRole( 'button', { name: 'Import Design System' } ) );

		expect( openDialog ).toHaveBeenCalledWith(
			expect.objectContaining( {
				component: expect.objectContaining( { type: ImportDesignSystemDialog } ),
			} )
		);
		expect( ( openDialog as jest.Mock ).mock.calls[ 0 ][ 0 ].component.props.onClose ).toBe( closeDialog );
	} );

	it( 'is disabled while an import is in progress', async () => {
		setupDocumentsMock();
		const longRunningPost = jest.fn(
			() => new Promise( () => undefined ) as Promise< { data: Record< string, never > } >
		);
		( httpService as jest.Mock ).mockReturnValue( { post: longRunningPost } );

		renderWithQuery(
			<>
				<TriggerButton />
				<ImportDesignSystemDialog onClose={ jest.fn() } />
			</>
		);

		const initialButton = screen.getByRole( 'button', { name: 'Import Design System' } );
		expect( initialButton ).toBeEnabled();

		submitImport();

		await waitFor( () => {
			expect( screen.getByRole( 'button', { name: 'Importing design system…' } ) ).toBeDisabled();
		} );
	} );
} );
