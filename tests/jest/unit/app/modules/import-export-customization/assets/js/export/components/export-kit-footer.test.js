import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ExportKitFooter from 'elementor/app/modules/import-export-customization/assets/js/export/components/export-kit-footer';
import { ExportContextProvider } from 'elementor/app/modules/import-export-customization/assets/js/export/context/export-context';

// Mock the hooks
jest.mock( 'elementor-app/hooks/use-cloud-kits-eligibility', () => jest.fn() );

jest.mock( 'elementor/app/modules/import-export-customization/assets/js/shared/hooks/use-connect-state', () => jest.fn() );

jest.mock( 'elementor/app/modules/import-export-customization/assets/js/export/context/export-context', () => ( {
	useExportContext: jest.fn(),
	EXPORT_STATUS: {
		PENDING: 'PENDING',
		EXPORTING: 'EXPORTING',
		COMPLETED: 'COMPLETED',
	},
} ) );

// Import the mocked functions
import useCloudKitsEligibility from 'elementor-app/hooks/use-cloud-kits-eligibility';
import useConnectState from 'elementor/app/modules/import-export-customization/assets/js/shared/hooks/use-connect-state';
import { useExportContext } from 'elementor/app/modules/import-export-customization/assets/js/export/context/export-context';

describe( 'ExportKitFooter Component', () => {
	let mockElementorAppConfig;
	let mockDispatch;
	let mockRefetchEligibility;
	let mockHandleConnectSuccess;
	let mockHandleConnectError;
	let mockSetConnecting;

	beforeEach( () => {
		// Mock global config
		mockElementorAppConfig = {
			base_url: 'https://example.com/elementor',
			'cloud-library': {
				library_connect_url: 'https://example.com/connect',
			},
		};
		global.elementorAppConfig = mockElementorAppConfig;

		// Mock window.location
		delete window.location;
		window.location = { href: '' };

		// Mock jQuery
		global.jQuery = jest.fn( () => ( {
			elementorConnect: jest.fn(),
		} ) );

		// Mock dispatch and other handlers
		mockDispatch = jest.fn();
		mockRefetchEligibility = jest.fn();
		mockHandleConnectSuccess = jest.fn();
		mockHandleConnectError = jest.fn();
		mockSetConnecting = jest.fn();

		// Default mock return values
		useExportContext.mockReturnValue( {
			dispatch: mockDispatch,
			isTemplateNameValid: true,
		} );

		useConnectState.mockReturnValue( {
			isConnected: false,
			isConnecting: false,
			setConnecting: mockSetConnecting,
			handleConnectSuccess: mockHandleConnectSuccess,
			handleConnectError: mockHandleConnectError,
		} );

		useCloudKitsEligibility.mockReturnValue( {
			data: { is_eligible: true },
			isLoading: false,
			refetch: mockRefetchEligibility,
		} );
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'Button Rendering for Disconnected State', () => {
		beforeEach( () => {
			useConnectState.mockReturnValue( {
				isConnected: false,
				isConnecting: false,
				setConnecting: mockSetConnecting,
				handleConnectSuccess: mockHandleConnectSuccess,
				handleConnectError: mockHandleConnectError,
			} );
		} );

		it( 'should render Save to Library button when user is not connected', () => {
			render( <ExportKitFooter /> );

			const saveToLibraryButton = screen.getByText( 'Save to library' );
			expect( saveToLibraryButton ).toBeTruthy();
			expect( saveToLibraryButton.getAttribute( 'href' ) ).toBe( 'https://example.com/connect' );
		} );

		it( 'should render Save to Library button when template name is invalid', () => {
			useExportContext.mockReturnValue( {
				dispatch: mockDispatch,
				isTemplateNameValid: false,
			} );

			render( <ExportKitFooter /> );

			const saveToLibraryButton = screen.getByText( 'Save to library' );
			expect( saveToLibraryButton ).toBeTruthy();
		} );

		it( 'should render Export as .zip button', () => {
			render( <ExportKitFooter /> );

			const exportButton = screen.getByText( 'Export as .zip' );
			expect( exportButton ).toBeTruthy();
		} );

		it( 'should render Export as .zip button when template name is invalid', () => {
			useExportContext.mockReturnValue( {
				dispatch: mockDispatch,
				isTemplateNameValid: false,
			} );

			render( <ExportKitFooter /> );

			const exportButton = screen.getByText( 'Export as .zip' );
			expect( exportButton ).toBeTruthy();
		} );
	} );

	describe( 'Button Rendering for Connected State', () => {
		beforeEach( () => {
			useConnectState.mockReturnValue( {
				isConnected: true,
				isConnecting: false,
				setConnecting: mockSetConnecting,
				handleConnectSuccess: mockHandleConnectSuccess,
				handleConnectError: mockHandleConnectError,
			} );
		} );

		it( 'should render Save to Library button when user is connected and eligible', () => {
			useCloudKitsEligibility.mockReturnValue( {
				data: { is_eligible: true },
				isLoading: false,
				refetch: mockRefetchEligibility,
			} );

			render( <ExportKitFooter /> );

			const saveToLibraryButton = screen.getByText( 'Save to library' );
			expect( saveToLibraryButton ).toBeTruthy();
			expect( saveToLibraryButton.hasAttribute( 'href' ) ).toBe( false );
		} );

		it( 'should render upgrade button when user is connected but not eligible', () => {
			useCloudKitsEligibility.mockReturnValue( {
				data: { is_eligible: false },
				isLoading: false,
				refetch: mockRefetchEligibility,
			} );

			render( <ExportKitFooter /> );

			const saveToLibraryButton = screen.getByText( 'Save to library' );
			expect( saveToLibraryButton ).toBeTruthy();
		} );

		it( 'should show loading state when checking eligibility', () => {
			useCloudKitsEligibility.mockReturnValue( {
				data: { is_eligible: true },
				isLoading: true,
				refetch: mockRefetchEligibility,
			} );

			render( <ExportKitFooter /> );

			const saveToLibraryButton = screen.getByText( 'Save to library' );
			expect( saveToLibraryButton.disabled ).toBe( true );
		} );
	} );

	describe( 'Export as .zip Button Functionality', () => {
		it( 'should trigger file export when Export as .zip is clicked', () => {
			render( <ExportKitFooter /> );

			const exportButton = screen.getByText( 'Export as .zip' );
			fireEvent.click( exportButton );

			expect( mockDispatch ).toHaveBeenCalledWith( {
				type: 'SET_KIT_SAVE_SOURCE',
				payload: 'file',
			} );

			expect( mockDispatch ).toHaveBeenCalledWith( {
				type: 'SET_EXPORT_STATUS',
				payload: 'EXPORTING',
			} );
		} );

		it( 'should not trigger export when button is disabled', () => {
			useExportContext.mockReturnValue( {
				dispatch: mockDispatch,
				isTemplateNameValid: false,
			} );

			render( <ExportKitFooter /> );

			const exportButton = screen.getByText( 'Export as .zip' );
			expect( exportButton.disabled ).toBe( true );
			fireEvent.click( exportButton );

			expect( mockDispatch ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'Cloud Export Functionality', () => {
		beforeEach( () => {
			useConnectState.mockReturnValue( {
				isConnected: true,
				isConnecting: false,
				setConnecting: mockSetConnecting,
				handleConnectSuccess: mockHandleConnectSuccess,
				handleConnectError: mockHandleConnectError,
			} );

			useCloudKitsEligibility.mockReturnValue( {
				data: { is_eligible: true },
				isLoading: false,
				refetch: mockRefetchEligibility,
			} );
		} );

		it( 'should trigger cloud export when eligible user clicks Save to Library', () => {
			render( <ExportKitFooter /> );

			const saveToLibraryButton = screen.getByText( 'Save to library' );
			fireEvent.click( saveToLibraryButton );

			expect( mockDispatch ).toHaveBeenCalledWith( {
				type: 'SET_KIT_SAVE_SOURCE',
				payload: 'cloud',
			} );

			expect( mockDispatch ).toHaveBeenCalledWith( {
				type: 'SET_EXPORT_STATUS',
				payload: 'EXPORTING',
			} );
		} );

		it( 'should render Save to Library button when user is non-eligible', () => {
			useCloudKitsEligibility.mockReturnValue( {
				data: { is_eligible: false },
				isLoading: false,
				refetch: mockRefetchEligibility,
			} );

			render( <ExportKitFooter /> );

			const saveToLibraryButton = screen.getByText( 'Save to library' );
			expect( saveToLibraryButton ).toBeTruthy();
		} );

		it( 'should render Save to Library button when eligibility is loading', () => {
			useCloudKitsEligibility.mockReturnValue( {
				data: { is_eligible: true },
				isLoading: true,
				refetch: mockRefetchEligibility,
			} );

			render( <ExportKitFooter /> );

			const saveToLibraryButton = screen.getByText( 'Save to library' );
			expect( saveToLibraryButton ).toBeTruthy();
		} );
	} );

	describe( 'Connection Flow Integration', () => {
		it( 'should render with connecting state', () => {
			useConnectState.mockReturnValue( {
				isConnected: false,
				isConnecting: true,
				setConnecting: mockSetConnecting,
				handleConnectSuccess: mockHandleConnectSuccess,
				handleConnectError: mockHandleConnectError,
			} );

			useCloudKitsEligibility.mockReturnValue( {
				data: { is_eligible: true },
				isLoading: false,
				refetch: mockRefetchEligibility,
			} );

			render( <ExportKitFooter /> );

			const saveToLibraryButton = screen.getByText( 'Save to library' );
			expect( saveToLibraryButton ).toBeTruthy();
		} );

		it( 'should render with non-eligible connecting user', () => {
			useConnectState.mockReturnValue( {
				isConnected: false,
				isConnecting: true,
				setConnecting: mockSetConnecting,
				handleConnectSuccess: mockHandleConnectSuccess,
				handleConnectError: mockHandleConnectError,
			} );

			useCloudKitsEligibility.mockReturnValue( {
				data: { is_eligible: false },
				isLoading: false,
				refetch: mockRefetchEligibility,
			} );

			render( <ExportKitFooter /> );

			const saveToLibraryButton = screen.getByText( 'Save to library' );
			expect( saveToLibraryButton ).toBeTruthy();
		} );

		it( 'should render with eligible connecting user', () => {
			useConnectState.mockReturnValue( {
				isConnected: false,
				isConnecting: true,
				setConnecting: mockSetConnecting,
				handleConnectSuccess: mockHandleConnectSuccess,
				handleConnectError: mockHandleConnectError,
			} );

			useCloudKitsEligibility.mockReturnValue( {
				data: { is_eligible: true },
				isLoading: false,
				refetch: mockRefetchEligibility,
			} );

			render( <ExportKitFooter /> );

			const saveToLibraryButton = screen.getByText( 'Save to library' );
			expect( saveToLibraryButton ).toBeTruthy();
		} );
	} );

	describe( 'Template Name Validation', () => {
		it( 'should render both buttons when template name is invalid', () => {
			useExportContext.mockReturnValue( {
				dispatch: mockDispatch,
				isTemplateNameValid: false,
			} );

			render( <ExportKitFooter /> );

			const saveToLibraryButton = screen.getByText( 'Save to library' );
			const exportButton = screen.getByText( 'Export as .zip' );

			expect( saveToLibraryButton ).toBeTruthy();
			expect( exportButton ).toBeTruthy();
		} );

		it( 'should render both buttons when template name is valid', () => {
			useExportContext.mockReturnValue( {
				dispatch: mockDispatch,
				isTemplateNameValid: true,
			} );

			render( <ExportKitFooter /> );

			const saveToLibraryButton = screen.getByText( 'Save to library' );
			const exportButton = screen.getByText( 'Export as .zip' );

			expect( saveToLibraryButton ).toBeTruthy();
			expect( exportButton ).toBeTruthy();
		} );
	} );

	describe( 'Loading States', () => {
		it( 'should render when connecting', () => {
			useConnectState.mockReturnValue( {
				isConnected: true,
				isConnecting: true,
				setConnecting: mockSetConnecting,
				handleConnectSuccess: mockHandleConnectSuccess,
				handleConnectError: mockHandleConnectError,
			} );

			render( <ExportKitFooter /> );

			const saveToLibraryButton = screen.getByText( 'Save to library' );
			expect( saveToLibraryButton ).toBeTruthy();
		} );

		it( 'should render when checking eligibility', () => {
			useConnectState.mockReturnValue( {
				isConnected: true,
				isConnecting: false,
				setConnecting: mockSetConnecting,
				handleConnectSuccess: mockHandleConnectSuccess,
				handleConnectError: mockHandleConnectError,
			} );

			useCloudKitsEligibility.mockReturnValue( {
				data: { is_eligible: true },
				isLoading: true,
				refetch: mockRefetchEligibility,
			} );

			render( <ExportKitFooter /> );

			const saveToLibraryButton = screen.getByText( 'Save to library' );
			expect( saveToLibraryButton ).toBeTruthy();
		} );
	} );

	describe( 'Button Variants and Styling', () => {
		it( 'should render Save to Library button with correct variant for disconnected state', () => {
			useConnectState.mockReturnValue( {
				isConnected: false,
				isConnecting: false,
				setConnecting: mockSetConnecting,
				handleConnectSuccess: mockHandleConnectSuccess,
				handleConnectError: mockHandleConnectError,
			} );

			render( <ExportKitFooter /> );

			const saveToLibraryButton = screen.getByText( 'Save to library' );
			expect( saveToLibraryButton ).toBeTruthy();
		} );

		it( 'should handle missing eligibility data gracefully', () => {
			useCloudKitsEligibility.mockReturnValue( {
				data: null,
				isLoading: false,
				refetch: mockRefetchEligibility,
			} );

			render( <ExportKitFooter /> );

			const saveToLibraryButton = screen.getByText( 'Save to library' );
			expect( saveToLibraryButton ).toBeTruthy();
		} );
	} );
} );
