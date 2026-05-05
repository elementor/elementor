import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { GLOBAL_STYLES_IMPORTED_EVENT } from '@elementor/editor-canvas';
import { reloadCurrentDocument } from '@elementor/editor-documents';
import { dismissNotification, notify } from '@elementor/editor-notifications';
import { closeDialog, openDialog } from '@elementor/editor-ui';
import { httpService } from '@elementor/http-client';
import { type QueryClient, QueryClientProvider } from '@elementor/query';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';

import { DesignSystemHeaderMenu } from '../../components/design-system-header-menu';
import { downloadBlob } from '../../export/download';
import { IMPORT_DESIGN_SYSTEM_MUTATION_KEY } from '../hooks/use-import-request';
import { ImportDesignSystemDialog } from '../import-design-system-dialog';
import { trackDesignSystem } from '../tracking';

jest.mock( '@elementor/http-client', () => ( {
	httpService: jest.fn(),
} ) );

jest.mock( '@elementor/editor-notifications', () => ( {
	dismissNotification: jest.fn(),
	notify: jest.fn(),
} ) );

jest.mock( '@elementor/editor-documents', () => ( {
	...jest.requireActual( '@elementor/editor-documents' ),
	reloadCurrentDocument: jest.fn().mockResolvedValue( undefined ),
} ) );

jest.mock( '@elementor/editor-ui', () => ( {
	...jest.requireActual( '@elementor/editor-ui' ),
	openDialog: jest.fn(),
	closeDialog: jest.fn(),
} ) );

jest.mock( '../tracking', () => ( {
	...jest.requireActual( '../tracking' ),
	trackDesignSystem: jest.fn(),
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

type HttpPostMock = jest.Mock< Promise< { data: unknown } >, [ url: string, body?: unknown, options?: unknown ] >;

const setupHttpServiceMock = ( runners: string[] = [ 'global-classes', 'global-variables' ] ) => {
	const post: HttpPostMock = jest.fn( ( url: string ) => {
		if ( url.endsWith( '/upload' ) ) {
			return Promise.resolve( { data: { data: { session: 'sess-1' }, meta: [] } } );
		}
		if ( url.endsWith( '/import' ) ) {
			return Promise.resolve( { data: { data: { session: 'sess-1', runners }, meta: [] } } );
		}
		return Promise.resolve( { data: { data: {}, meta: [] } } );
	} );
	( httpService as jest.Mock ).mockReturnValue( { post } );
	return { post };
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

	it( 'fires the in-progress notification, calls onClose and triggers the upload→import→runner flow', async () => {
		const { post } = setupHttpServiceMock();
		const onClose = jest.fn();

		renderWithQuery( <ImportDesignSystemDialog onClose={ onClose } /> );

		const file = submitImport();

		const inProgressCall = ( notify as jest.Mock ).mock.calls.find(
			( [ payload ] ) => payload.id === 'design-system-import-started'
		);
		expect( inProgressCall?.[ 0 ].type ).toBe( 'info' );

		expect( onClose ).toHaveBeenCalledTimes( 1 );

		await waitFor( () => expect( post.mock.calls.length ).toBeGreaterThanOrEqual( 4 ), {
			timeout: ASYNC_TIMEOUT_MS,
		} );

		const [ uploadUrl, uploadBody, uploadOptions ] = post.mock.calls[ 0 ];
		expect( uploadUrl ).toBe( 'elementor/v1/import-export-customization/upload' );
		expect( uploadBody ).toBeInstanceOf( FormData );
		expect( ( uploadBody as FormData ).get( 'e_import_file' ) ).toBe( file );
		expect( ( uploadOptions as { headers: Record< string, string > } ).headers[ 'Content-Type' ] ).toBe(
			'multipart/form-data'
		);

		const [ importUrl, importBody ] = post.mock.calls[ 1 ];
		expect( importUrl ).toBe( 'elementor/v1/import-export-customization/import' );
		expect( importBody ).toEqual( {
			session: 'sess-1',
			include: [ 'design-system' ],
			customization: { 'design-system': { conflict_resolution: 'skip' } },
		} );

		const [ runnerUrl, runnerBody ] = post.mock.calls[ 2 ];
		expect( runnerUrl ).toBe( 'elementor/v1/import-export-customization/import-runner' );
		expect( runnerBody ).toEqual( { session: 'sess-1', runner: 'global-classes' } );
	} );

	it( 'on success: refreshes globals, reloads the document and notifies success', async () => {
		setupHttpServiceMock();

		const eventListener = jest.fn();
		window.addEventListener( GLOBAL_STYLES_IMPORTED_EVENT, eventListener );

		renderWithQuery( <ImportDesignSystemDialog onClose={ jest.fn() } /> );

		submitImport();

		await waitFor(
			() => {
				const call = ( notify as jest.Mock ).mock.calls.find(
					( [ payload ] ) => payload.id === 'design-system-import-succeeded'
				);
				expect( call?.[ 0 ].type ).toBe( 'success' );
			},
			{ timeout: ASYNC_TIMEOUT_MS }
		);

		expect( dismissNotification ).toHaveBeenCalledWith( 'design-system-import-started' );
		expect( eventListener ).toHaveBeenCalledTimes( 1 );
		expect( reloadCurrentDocument ).toHaveBeenCalledTimes( 1 );

		await waitFor( () => expect( isImporting() ).toBe( false ) );

		window.removeEventListener( GLOBAL_STYLES_IMPORTED_EVENT, eventListener );
	} );

	it( 'on failure: notifies error and the Try again action reopens the import dialog', async () => {
		const post = jest.fn().mockRejectedValue( new Error( 'boom' ) );
		( httpService as jest.Mock ).mockReturnValue( { post } );

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
		expect( reloadCurrentDocument ).not.toHaveBeenCalled();

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

	it( 'fires the PRD analytics events along the happy path', async () => {
		setupHttpServiceMock();

		renderWithQuery( <ImportDesignSystemDialog onClose={ jest.fn() } /> );

		submitImport();

		const eventNames = () => ( trackDesignSystem as jest.Mock ).mock.calls.map( ( [ payload ] ) => payload.event );

		expect( eventNames() ).toEqual( expect.arrayContaining( [ 'fileSelected', 'conflictChoice', 'confirmed' ] ) );

		await waitFor( () => expect( eventNames() ).toContain( 'imported' ), { timeout: ASYNC_TIMEOUT_MS } );
	} );

	it( 'fires validationFailed analytics when the upload step fails', async () => {
		const post = jest.fn( ( url: string ) => {
			if ( url.endsWith( '/upload' ) ) {
				return Promise.reject( new Error( 'bad zip' ) );
			}
			return Promise.resolve( { data: {} } );
		} );
		( httpService as jest.Mock ).mockReturnValue( { post } );

		renderWithQuery( <ImportDesignSystemDialog onClose={ jest.fn() } /> );

		submitImport();

		await waitFor(
			() =>
				expect(
					( trackDesignSystem as jest.Mock ).mock.calls.some(
						( [ payload ] ) => payload.event === 'validationFailed'
					)
				).toBe( true ),
			{ timeout: ASYNC_TIMEOUT_MS }
		);
	} );

	it( 'Try again is a no-op while another import is in progress', async () => {
		const post = jest.fn().mockRejectedValue( new Error( 'boom' ) );
		( httpService as jest.Mock ).mockReturnValue( { post } );

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

jest.mock( '../../export/download', () => ( {
	downloadBlob: jest.fn(),
} ) );

const openHeaderMenu = () => {
	fireEvent.click( screen.getByRole( 'button', { name: 'More actions' } ) );
};

describe( '<DesignSystemHeaderMenu />', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		sharedQueryClient.clear();
	} );

	it( 'opens the import dialog when the Import menu item is clicked', async () => {
		setupHttpServiceMock();

		renderWithQuery( <DesignSystemHeaderMenu /> );

		openHeaderMenu();
		fireEvent.click( await screen.findByRole( 'menuitem', { name: 'Import' } ) );

		expect( openDialog ).toHaveBeenCalledWith(
			expect.objectContaining( {
				component: expect.objectContaining( { type: ImportDesignSystemDialog } ),
			} )
		);
		expect( ( openDialog as jest.Mock ).mock.calls[ 0 ][ 0 ].component.props.onClose ).toBe( closeDialog );
	} );

	it( 'POSTs the design-system export request and triggers a download on success', async () => {
		const { post } = setupHttpServiceMock();
		post.mockImplementation( ( url: string ) => {
			if ( url.endsWith( '/export' ) ) {
				return Promise.resolve( { data: { data: { file: btoa( 'zip-bytes' ), manifest: {} }, meta: [] } } );
			}
			return Promise.resolve( { data: { data: {}, meta: [] } } );
		} );

		renderWithQuery( <DesignSystemHeaderMenu /> );

		openHeaderMenu();
		fireEvent.click( await screen.findByRole( 'menuitem', { name: 'Export' } ) );

		await waitFor(
			() => expect( downloadBlob ).toHaveBeenCalledWith( expect.any( Blob ), 'design-system-export.zip' ),
			{ timeout: ASYNC_TIMEOUT_MS }
		);

		const exportCall = post.mock.calls.find( ( [ url ] ) => url.endsWith( '/export' ) );
		expect( exportCall?.[ 0 ] ).toBe( 'elementor/v1/import-export-customization/export' );
		expect( exportCall?.[ 1 ] ).toEqual( {
			include: [ 'settings' ],
			kitInfo: { title: 'design-system', description: '', source: 'local' },
			customization: { settings: { theme: false, classes: true, variables: true } },
		} );

		const successCall = ( notify as jest.Mock ).mock.calls.find(
			( [ payload ] ) => payload.id === 'design-system-export-succeeded'
		);
		expect( successCall?.[ 0 ].type ).toBe( 'success' );
	} );

	it( 'on export failure: notifies error and the Try again action retries the export', async () => {
		const post = jest.fn().mockRejectedValue( new Error( 'boom' ) );
		( httpService as jest.Mock ).mockReturnValue( { post } );

		renderWithQuery( <DesignSystemHeaderMenu /> );

		openHeaderMenu();
		fireEvent.click( await screen.findByRole( 'menuitem', { name: 'Export' } ) );

		const errorCall = await waitFor(
			() => {
				const call = ( notify as jest.Mock ).mock.calls.find(
					( [ payload ] ) => payload.id === 'design-system-export-failed'
				);
				expect( call?.[ 0 ].type ).toBe( 'error' );
				return call;
			},
			{ timeout: ASYNC_TIMEOUT_MS }
		);

		expect( dismissNotification ).toHaveBeenCalledWith( 'design-system-export-started' );
		expect( downloadBlob ).not.toHaveBeenCalled();

		const retryAction = errorCall?.[ 0 ].additionalActionProps?.[ 0 ];
		expect( retryAction ).toEqual( expect.objectContaining( { children: 'Try again' } ) );

		act( () => {
			retryAction?.onClick?.();
		} );

		await waitFor( () => expect( post.mock.calls.length ).toBeGreaterThanOrEqual( 2 ), {
			timeout: ASYNC_TIMEOUT_MS,
		} );
	} );

	it( 'is disabled while an import is in progress', async () => {
		const longRunningPost = jest.fn(
			() => new Promise( () => undefined ) as Promise< { data: Record< string, never > } >
		);
		( httpService as jest.Mock ).mockReturnValue( { post: longRunningPost } );

		renderWithQuery(
			<>
				<DesignSystemHeaderMenu />
				<ImportDesignSystemDialog onClose={ jest.fn() } />
			</>
		);

		expect( screen.getByRole( 'button', { name: 'More actions' } ) ).toBeEnabled();

		submitImport();

		await waitFor( () => {
			expect( screen.getByRole( 'button', { name: 'More actions' } ) ).toBeDisabled();
		} );
	} );
} );
