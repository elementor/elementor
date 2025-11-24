import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ImportProcess from 'elementor/app/modules/import-export-customization/assets/js/import/pages/import-process';
import eventsConfig from 'elementor/core/common/modules/events-manager/assets/js/events-config';
import useContextDetection from 'elementor/app/modules/import-export-customization/assets/js/shared/hooks/use-context-detection';

const mockUseImportContext = jest.fn();
const mockUseImportKit = jest.fn();
const mockNavigate = jest.fn();

jest.mock( 'elementor/app/modules/import-export-customization/assets/js/shared/hooks/use-context-detection' );

jest.mock( 'elementor/app/modules/import-export-customization/assets/js/import/context/import-context', () => ( {
	useImportContext: () => mockUseImportContext(),
} ) );

jest.mock( 'elementor/app/modules/import-export-customization/assets/js/import/hooks/use-import-kit', () => ( {
	...jest.requireActual( 'elementor/app/modules/import-export-customization/assets/js/import/hooks/use-import-kit' ),
	useImportKit: () => mockUseImportKit(),
} ) );

jest.mock( '@reach/router', () => ( {
	useNavigate: () => mockNavigate,
} ) );

jest.mock( 'elementor/app/modules/import-export-customization/assets/js/import/components/plugin-activation', () => ( {
	PluginActivation: () => <div data-testid="plugin-activation" />,
} ) );

const mockSendKitImportStatus = jest.fn();
jest.mock( 'elementor/app/assets/js/event-track/apps-event-tracking', () => ( {
	AppsEventTracking: {
		sendKitImportStatus: ( ...args ) => mockSendKitImportStatus( ...args ),
	},
} ) );

describe( 'ImportProcess Page', () => {
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
		isProcessing = true,
		status = 'IN_PROGRESS',
		error = null,
		runnersState = {},
	} = {} ) {
		mockUseImportContext.mockReturnValue( {
			isProcessing,
			data: {
				includes: [ 'settings', 'content', 'plugins' ],
				customization: {},
			},
			dispatch: jest.fn(),
			runnersState,
		} );
		mockUseImportKit.mockReturnValue( { status, error, runnersState } );
	}

	it( 'renders loader and PluginActivation when in progress and no error', () => {
		// Arrange
		setup( { status: 'IN_PROGRESS', error: null, runnersState: { plugins: [ 'foo' ] } } );
		// Act
		render( <ImportProcess /> );
		// Assert
		expect( screen.getByRole( 'progressbar' ) ).toBeTruthy();
		expect( screen.getByTestId( 'plugin-activation' ) ).toBeTruthy();
	} );

	it( 'renders ImportError when error is present', () => {
		// Arrange
		setup( {
			status: 'IN_PROGRESS',
			error: { code: 'general', message: 'Failed' },
		} );
		// Act
		render( <ImportProcess /> );
		// Assert
		expect( screen.getByTestId( 'error-dialog' ) ).toBeTruthy();
		expect( screen.getByText( 'We couldn’t download the Website Template due to technical difficulties on our part. Try again and if the problem persists contact' ) ).toBeTruthy();
	} );

	it( 'navigates to /import/complete when status is DONE and no error (first useEffect)', () => {
		// Arrange
		setup( { status: 'DONE', error: null } );
		// Act
		render( <ImportProcess /> );
		// Assert
		waitFor( () => {
			expect( mockNavigate ).toHaveBeenCalledWith( '/import/complete' );
		} );
	} );

	it( 'navigates to import/complete when status is DONE and no error (second useEffect)', () => {
		// Arrange
		setup( { status: 'DONE', error: null } );
		// Act
		render( <ImportProcess /> );
		// Assert
		expect( mockNavigate ).toHaveBeenCalledWith( 'import/complete' );
	} );

	it( 'navigates to import with replace when isProcessing is false', () => {
		// Arrange
		setup( { isProcessing: false, status: 'IN_PROGRESS', error: null } );
		// Act
		render( <ImportProcess /> );
		// Assert
		expect( mockNavigate ).toHaveBeenCalledWith( 'import', { replace: true } );
	} );
} );
