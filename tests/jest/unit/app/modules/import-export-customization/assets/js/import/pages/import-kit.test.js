import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ImportKit from 'elementor/app/modules/import-export-customization/assets/js/import/pages/import-kit';
import eventsConfig from 'elementor/core/common/modules/events-manager/assets/js/events-config';
import useContextDetection from 'elementor/app/modules/import-export-customization/assets/js/shared/hooks/use-context-detection';

const mockDispatch = jest.fn();
const mockNavigate = jest.fn();
const mockUseImportContext = jest.fn();
const mockUseUploadKit = jest.fn();
const mockUseQueryParams = jest.fn();

jest.mock( 'elementor/app/modules/import-export-customization/assets/js/import/context/import-context', () => ( {
	useImportContext: () => mockUseImportContext(),
	IMPORT_STATUS: {
		PENDING: 'PENDING',
		UPLOADING: 'UPLOADING',
		CUSTOMIZING: 'CUSTOMIZING',
		IMPORTING: 'IMPORTING',
		COMPLETED: 'COMPLETED',
	},
	ACTION_TYPE: {
		APPLY_ALL: 'apply-all',
	},
} ) );

jest.mock( 'elementor/app/modules/import-export-customization/assets/js/shared/hooks/use-context-detection' );

jest.mock( 'elementor/app/modules/import-export-customization/assets/js/import/hooks/use-upload-kit', () => ( {
	useUploadKit: () => mockUseUploadKit(),
} ) );

jest.mock( '@reach/router', () => ( {
	useNavigate: () => mockNavigate,
} ) );

jest.mock( 'elementor-app/hooks/use-query-params', () => ( {
	__esModule: true,
	default: () => ( {
		getAll: () => mockUseQueryParams(),
	} ),
} ) );

const mockSendPageViewsWebsiteTemplates = jest.fn();
jest.mock( 'elementor/app/assets/js/event-track/apps-event-tracking', () => ( {
	AppsEventTracking: {
		sendPageViewsWebsiteTemplates: ( ...args ) => mockSendPageViewsWebsiteTemplates( ...args ),
	},
} ) );

describe( 'ImportKit Page', () => {
	beforeEach( () => {
		jest.clearAllMocks();

		useContextDetection.mockImplementation( () => ( {
			isImport: true,
			contextData: { data: { kitUploadParams: { source: 'cloud' } } },
		} ) );

		global.elementorAppConfig = {
			base_url: 'http://localhost',
			pages_url: 'http://localhost',
		};
		global.elementorCommon = {
			eventsManager: {
				config: eventsConfig,
			},
		};
	} );

	afterEach( () => {
		delete global.elementorAppConfig;
		delete global.elementorCommon;
	} );

	function setup( {
		uploading = false,
		error = null,
		data = {},
		queryParams = {},
	} = {} ) {
		mockUseImportContext.mockReturnValue( {
			data,
			dispatch: mockDispatch,
		} );
		mockUseUploadKit.mockReturnValue( { uploading, error } );
		mockUseQueryParams.mockReturnValue( queryParams );
	}

	it( 'renders loader when uploading', async () => {
		// Arrange
		setup( { uploading: true } );
		// Act
		render( <ImportKit /> );
		// Assert
		expect( screen.getByRole( 'progressbar' ) ).toBeTruthy();

		await waitFor( () => expect( mockSendPageViewsWebsiteTemplates ).toHaveBeenCalledWith( 'kit_import_upload_box' ) );
	} );

	it( 'renders ImportError when error is present', () => {
		// Arrange
		setup( { error: { code: 'general' } } );
		// Act
		render( <ImportKit /> );
		// Assert
		expect( screen.getByTestId( 'try-again-button' ) ).toBeTruthy();
		expect( screen.getByTestId( 'error-dialog' ) ).toBeTruthy();
	} );

	it.each( [
		'general',
		'timeout',
		'cloud-upload-failed',
		'third-party-error',
		'invalid-zip-file',
		'zip-archive-module-missing',
		'no-write-permissions',
		'plugin-installation-permissions-error',
		'failed-to-fetch-quota',
		'insufficient-quota',
		'error-loading-resource',
	] )( 'renders Try Again button for all required types of errors', ( code ) => {
		// Arrange
		setup( { error: { code } } );
		// Act
		render( <ImportKit /> );
		// Assert
		expect( screen.getByTestId( 'try-again-button' ) ).toBeTruthy();
		expect( screen.getByTestId( 'error-dialog' ) ).toBeTruthy();
	} );

	it( 'renders main content and DropZone when not uploading or error', () => {
		// Arrange
		setup();
		// Act
		render( <ImportKit /> );
		// Assert
		expect( screen.getByTestId( 'content-container' ) ).toBeTruthy();
		expect( screen.getByTestId( 'drop-zone' ) ).toBeTruthy();
	} );

	it( 'dispatches SET_FILE when file is dropped on DropZone', () => {
		// Arrange
		setup();
		render( <ImportKit /> );
		const dropZone = screen.getByTestId( 'drop-zone' );
		const file = new File( [ 'dummy' ], 'test.zip', { type: 'application/zip' } );
		// Act
		fireEvent.drop( dropZone, {
			dataTransfer: {
				files: [ file ],
			},
		} );
		// Assert
		expect( mockDispatch ).toHaveBeenCalledWith( { type: 'SET_FILE', payload: file } );
	} );

	it( 'stores action_type in context when kit upload params are present', () => {
		// Arrange
		const queryParams = {
			id: 'test-id',
			referrer: 'kit-library',
			action_type: 'apply-all',
		};
		setup( { queryParams } );
		// Act
		render( <ImportKit /> );
		// Assert
		expect( mockDispatch ).toHaveBeenCalledWith( { type: 'SET_ACTION_TYPE', payload: 'apply-all' } );
	} );

	it( 'bypasses customization and goes directly to process when apply-all action is detected', () => {
		// Arrange
		const mockUploadedData = {
			manifest: {
				'site-settings': { some: 'settings' },
				templates: { template1: {} },
				content: { post1: {} },
				plugins: [ { plugin: 'test-plugin' } ],
			},
		};
		setup( {
			data: {
				actionType: 'apply-all',
				uploadedData: mockUploadedData,
			},
		} );
		// Act
		render( <ImportKit /> );
		// Assert
		expect( mockDispatch ).toHaveBeenCalledWith( { type: 'ADD_INCLUDES', payload: [ 'settings', 'templates', 'content', 'plugins' ] } );
		expect( mockDispatch ).toHaveBeenCalledWith( { type: 'SET_IMPORT_STATUS', payload: 'IMPORTING' } );
		expect( mockNavigate ).toHaveBeenCalledWith( 'import/process' );
	} );

	it( 'goes to customization when no apply-all action is detected', () => {
		// Arrange
		const mockUploadedData = {
			manifest: {
				'site-settings': { some: 'settings' },
				templates: { template1: {} },
				content: { post1: {} },
			},
		};
		setup( {
			data: {
				actionType: null,
				uploadedData: mockUploadedData,
			},
		} );
		// Act
		render( <ImportKit /> );
		// Assert
		expect( mockDispatch ).toHaveBeenCalledWith( { type: 'SET_IMPORT_STATUS', payload: 'CUSTOMIZING' } );
		expect( mockNavigate ).toHaveBeenCalledWith( 'import/content' );
	} );
} );
