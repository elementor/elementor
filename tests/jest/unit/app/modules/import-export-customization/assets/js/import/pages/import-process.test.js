import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ImportProcess from 'elementor/app/modules/import-export-customization/assets/js/import/pages/import-process';

const mockUseImportContext = jest.fn();
const mockUseImportKit = jest.fn();
const mockNavigate = jest.fn();

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

describe( 'ImportProcess Page', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		global.elementorAppConfig = { base_url: 'http://localhost' };
		global.elementorCommon = {};
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
		mockUseImportContext.mockReturnValue( { isProcessing } );
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
		setup( { status: 'IN_PROGRESS', error: { message: 'Failed!' } } );
		// Act
		render( <ImportProcess /> );
		// Assert
		expect( screen.getByTestId( 'import-error' ) ).toBeTruthy();
		expect( screen.getByText( 'Failed!' ) ).toBeTruthy();
	} );

	it( 'navigates to /import-customization/complete when status is DONE and no error (first useEffect)', () => {
		// Arrange
		setup( { status: 'DONE', error: null } );
		// Act
		render( <ImportProcess /> );
		// Assert
		waitFor( () => {
			expect( mockNavigate ).toHaveBeenCalledWith( '/import-customization/complete' );
		} );
	} );

	it( 'navigates to import-customization/complete when status is DONE and no error (second useEffect)', () => {
		// Arrange
		setup( { status: 'DONE', error: null } );
		// Act
		render( <ImportProcess /> );
		// Assert
		expect( mockNavigate ).toHaveBeenCalledWith( 'import-customization/complete' );
	} );

	it( 'navigates to import-customization with replace when isProcessing is false', () => {
		// Arrange
		setup( { isProcessing: false, status: 'IN_PROGRESS', error: null } );
		// Act
		render( <ImportProcess /> );
		// Assert
		expect( mockNavigate ).toHaveBeenCalledWith( 'import-customization', { replace: true } );
	} );
} );
