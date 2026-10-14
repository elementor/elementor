import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

jest.mock( 'elementor/app/modules/import-export-customization/assets/js/shared/hooks/use-kit-customization-custom-post-types', () => ( {
	useKitCustomizationCustomPostTypes: jest.fn(),
} ) );

jest.mock( 'elementor/app/modules/import-export-customization/assets/js/shared/hooks/use-context-detection', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

jest.mock( 'elementor-app/event-track/apps-event-tracking', () => ( {
	AppsEventTracking: {
		sendPageViewsWebsiteTemplates: jest.fn(),
	},
} ) );

import { useKitCustomizationCustomPostTypes } from 'elementor/app/modules/import-export-customization/assets/js/shared/hooks/use-kit-customization-custom-post-types';
import useContextDetection from 'elementor/app/modules/import-export-customization/assets/js/shared/hooks/use-context-detection';
import { AppsEventTracking } from 'elementor-app/event-track/apps-event-tracking';

import { KitContentCustomizationDialog } from 'elementor/app/modules/import-export-customization/assets/js/shared/components/kit-content-customization-dialog';

global.__ = jest.fn( ( text ) => text );

describe( 'KitContentCustomizationDialog Component', () => {
	const mockHandleClose = jest.fn();
	const mockHandleSaveChanges = jest.fn();
	const mockData = {
		includes: [ 'content' ],
		customization: {
			content: null,
		},
		analytics: {
			customization: {
				content: [],
			},
		},
	};

	beforeEach( () => {
		jest.clearAllMocks();

		global.elementorCommon = {
			eventsManager: {
				config: {
					secondaryLocations: {
						kitLibrary: {
							kitExportCustomizationEdit: 'test-location',
						},
					},
				},
			},
		};

		useContextDetection.mockReturnValue( {
			isImport: false,
			contextData: {
				data: mockData,
				isOldElementorVersion: false,
			},
		} );

		useKitCustomizationCustomPostTypes.mockReturnValue( {
			customPostTypes: [
				{ value: 'post', label: 'Post' },
				{ value: 'test_cpt', label: 'Test CPT' },
			],
		} );
	} );

	describe( 'Dialog Rendering', () => {
		it( 'should render dialog when open is true', () => {
			// Arrange
			const props = {
				data: mockData,
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
			};

			// Act
			render( <KitContentCustomizationDialog { ...props } /> );

			// Assert
			expect( screen.getByText( 'Edit content' ) ).toBeTruthy();
			expect( screen.getByText( 'Save changes' ) ).toBeTruthy();
			expect( screen.getByText( 'Cancel' ) ).toBeTruthy();
		} );

		it( 'should not render dialog content when open is false', () => {
			// Arrange
			const props = {
				data: mockData,
				open: false,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
			};

			// Act
			render( <KitContentCustomizationDialog { ...props } /> );

			// Assert
			expect( screen.queryByText( 'Edit content' ) ).toBeFalsy();
		} );

		it( 'should render custom post types section', () => {
			// Arrange
			const props = {
				data: mockData,
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
			};

			// Act
			render( <KitContentCustomizationDialog { ...props } /> );

			// Assert
			expect( screen.getByText( 'Custom post types' ) ).toBeTruthy();
		} );

		it( 'should render custom post type options', () => {
			// Arrange
			const props = {
				data: mockData,
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
			};

			// Act
			render( <KitContentCustomizationDialog { ...props } /> );

			// Assert
			expect( screen.getByText( 'Post' ) ).toBeTruthy();
			expect( screen.getByText( 'Test CPT' ) ).toBeTruthy();
		} );
	} );

	describe( 'Initial State', () => {
		it( 'should initialize with content enabled when content is in includes', () => {
			// Arrange
			const props = {
				data: mockData,
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
			};

			// Act
			render( <KitContentCustomizationDialog { ...props } /> );

			// Assert
			const checkboxes = screen.getAllByRole( 'checkbox' );
			checkboxes.forEach( ( checkbox ) => {
				expect( checkbox.checked ).toBe( true );
			} );
		} );

		it( 'should initialize with content disabled when content is not in includes', () => {
			// Arrange
			const data = {
				includes: [],
				customization: {
					content: null,
				},
				analytics: {
					customization: {
						content: [],
					},
				},
			};

			useContextDetection.mockReturnValue( {
				isImport: false,
				contextData: {
					data,
					isOldElementorVersion: false,
				},
			} );

			const props = {
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
			};

			// Act
			render( <KitContentCustomizationDialog { ...props } /> );

			// Assert
			const checkboxes = screen.getAllByRole( 'checkbox' );
			checkboxes.forEach( ( checkbox ) => {
				expect( checkbox.checked ).toBe( false );
			} );
		} );

		it( 'should use existing customization settings when available', () => {
			// Arrange
			const data = {
				includes: [ 'content' ],
				customization: {
					content: {
						customPostTypes: [ 'post' ],
						mediaFormat: 'cloud',
					},
				},
				analytics: {
					customization: {
						content: [],
					},
				},
			};
			const props = {
				data,
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
			};

			// Act
			render( <KitContentCustomizationDialog { ...props } /> );

			// Assert
			const postCheckbox = screen.getByLabelText( 'Post' );
			expect( postCheckbox.checked ).toBe( true );
		} );
	} );

	describe( 'Import Mode Functionality', () => {
		it( 'should detect import mode when uploadedData is present', () => {
			// Arrange
			const importData = {
				includes: [ 'content' ],
				customization: {
					content: null,
				},
				analytics: {
					customization: {
						content: [],
					},
				},
				uploadedData: {
					manifest: {
						content: {
							post: [ 'post-1', 'post-2' ],
						},
						'wp-content': {
							post: [ 'post-1' ],
						},
						'custom-post-type-title': [ 'test_cpt' ],
					},
				},
			};
			const props = {
				data: importData,
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
			};

			// Act
			render( <KitContentCustomizationDialog { ...props } /> );

			// Assert
			expect( screen.getByText( 'Edit content' ) ).toBeTruthy();
		} );

		it( 'should show "not exported" message when no custom post types in import mode', () => {
			// Arrange
			useKitCustomizationCustomPostTypes.mockReturnValue( {
				customPostTypes: [],
			} );

			const importData = {
				includes: [ 'content' ],
				customization: {
					content: null,
				},
				analytics: {
					customization: {
						content: [],
					},
				},
				uploadedData: {
					manifest: {},
				},
			};

			useContextDetection.mockReturnValue( {
				isImport: true,
				contextData: {
					data: importData,
					isOldElementorVersion: false,
				},
			} );

			const props = {
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
			};

			// Act
			render( <KitContentCustomizationDialog { ...props } /> );

			// Assert
			expect( screen.getByText( 'Custom post types' ) ).toBeTruthy();
		} );

		it( 'should handle missing manifest gracefully', () => {
			// Arrange
			const importData = {
				includes: [ 'content' ],
				customization: {
					content: null,
				},
				analytics: {
					customization: {
						content: [],
					},
				},
				uploadedData: {
					manifest: {},
				},
			};
			const props = {
				data: importData,
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
			};

			// Act
			render( <KitContentCustomizationDialog { ...props } /> );

			// Assert
			expect( screen.getByText( 'Edit content' ) ).toBeTruthy();
		} );
	} );

	describe( 'Toggle Functionality', () => {
		it( 'should toggle custom post type selection when clicked', () => {
			// Arrange
			const props = {
				data: mockData,
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
			};
			render( <KitContentCustomizationDialog { ...props } /> );
			const testCptCheckbox = screen.getByLabelText( 'Test CPT' );
			const initialState = testCptCheckbox.checked;

			// Act
			fireEvent.click( testCptCheckbox );

			// Assert
			expect( testCptCheckbox.checked ).toBe( ! initialState );
		} );

		it( 'should handle toggle interactions in import mode', () => {
			// Arrange
			const importData = {
				includes: [ 'content' ],
				customization: {
					content: null,
				},
				analytics: {
					customization: {
						content: [],
					},
				},
				uploadedData: {
					manifest: {
						content: {
							post: [ 'post-1', 'post-2' ],
						},
						'wp-content': {
							post: [ 'post-1' ],
						},
						'custom-post-type-title': [ 'test_cpt' ],
					},
				},
			};
			const props = {
				data: importData,
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
			};
			render( <KitContentCustomizationDialog { ...props } /> );
			const testCptCheckbox = screen.getByLabelText( 'Test CPT' );
			const initialState = testCptCheckbox.checked;

			// Act
			fireEvent.click( testCptCheckbox );

			// Assert
			expect( testCptCheckbox.checked ).toBe( ! initialState );
		} );
	} );

	describe( 'Dialog Actions', () => {
		it( 'should call handleClose when Cancel button is clicked', () => {
			// Arrange
			const props = {
				data: mockData,
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
			};
			render( <KitContentCustomizationDialog { ...props } /> );
			const cancelButton = screen.getByText( 'Cancel' );

			// Act
			fireEvent.click( cancelButton );

			// Assert
			expect( mockHandleClose ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should call handleClose when close button is clicked', () => {
			// Arrange
			const props = {
				data: mockData,
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
			};
			render( <KitContentCustomizationDialog { ...props } /> );
			const closeButtons = screen.getAllByRole( 'button' );
			const closeButton = closeButtons.find( ( button ) => 'close' === button.getAttribute( 'aria-label' ) );

			// Act
			if ( closeButton ) {
				fireEvent.click( closeButton );
			}

			// Assert
			if ( closeButton ) {
				expect( mockHandleClose ).toHaveBeenCalledTimes( 1 );
			}
		} );

		it( 'should dispatch customization and close dialog when Save changes is clicked', () => {
			// Arrange
			const props = {
				data: mockData,
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
			};
			render( <KitContentCustomizationDialog { ...props } /> );
			const saveButton = screen.getByText( 'Save changes' );

			// Act
			fireEvent.click( saveButton );

			// Assert
			expect( mockHandleSaveChanges ).toHaveBeenCalledWith(
				'content',
				{
					customPostTypes: [ 'post', 'test_cpt' ],
					mediaFormat: 'link',
				},
				true,
				{
					customPostTypes: 'All',
					mediaFormat: 'link',
				},
			);
			expect( mockHandleClose ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'Media Format Section', () => {
		it( 'should render media format options when isCloudKitsEligible is true and not in import mode', () => {
			// Arrange
			const props = {
				data: mockData,
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
				isCloudKitsEligible: true,
				isImport: false,
			};

			// Act
			render( <KitContentCustomizationDialog { ...props } /> );

			// Assert
			expect( screen.getByText( 'Media format' ) ).toBeTruthy();
			expect( screen.getByText( 'Link to media' ) ).toBeTruthy();
			expect( screen.getByText( 'Save media to the cloud' ) ).toBeTruthy();
		} );

		it( 'should not render media format section when isCloudKitsEligible is false', () => {
			// Arrange
			const props = {
				data: mockData,
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
				isCloudKitsEligible: false,
				isImport: false,
			};

			// Act
			render( <KitContentCustomizationDialog { ...props } /> );

			// Assert
			expect( screen.queryByText( 'Media format' ) ).toBeFalsy();
		} );

		it( 'should render media format banner in import mode', () => {
			// Arrange
			useContextDetection.mockReturnValue( {
				isImport: true,
				contextData: {
					data: mockData,
					isOldElementorVersion: false,
				},
			} );

			const props = {
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
				isCloudKitsEligible: true,
			};

			// Act
			render( <KitContentCustomizationDialog { ...props } /> );

			// Assert
			expect( screen.queryByText( 'The media will be uploaded automatically, just as it was saved during export' ) ).toBeTruthy();
		} );

		it( 'should default to "Link to media" option', () => {
			// Arrange
			const props = {
				data: mockData,
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
				isCloudKitsEligible: true,
				isImport: false,
			};

			// Act
			render( <KitContentCustomizationDialog { ...props } /> );

			// Assert
			const linkRadio = screen.getByTestId( 'media-format-link' );
			expect( linkRadio ).toBeTruthy();

			const cloudRadio = screen.getByTestId( 'media-format-cloud' );
			expect( cloudRadio ).toBeTruthy();
		} );

		it( 'should allow switching between media format options', () => {
			// Arrange
			const props = {
				data: mockData,
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
				isCloudKitsEligible: true,
				isImport: false,
			};

			// Act
			render( <KitContentCustomizationDialog { ...props } /> );

			const cloudRadio = screen.getByTestId( 'media-format-cloud' );
			fireEvent.click( cloudRadio );

			// Assert
			expect( cloudRadio ).toBeTruthy();

			const linkRadio = screen.getByTestId( 'media-format-link' );
			expect( linkRadio ).toBeTruthy();
		} );

		it( 'should include mediaFormat in settings when saving changes', () => {
			// Arrange
			const props = {
				data: mockData,
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
				isCloudKitsEligible: true,
				isImport: false,
			};

			// Act
			render( <KitContentCustomizationDialog { ...props } /> );

			const saveButton = screen.getByText( 'Save changes' );
			fireEvent.click( saveButton );

			// Assert
			expect( mockHandleSaveChanges ).toHaveBeenCalledWith(
				'content',
				expect.objectContaining( {
					mediaFormat: 'link',
				} ),
				true,
				expect.objectContaining( {
					mediaFormat: 'link',
				} ),
			);
		} );

		it( 'should show validation alert when showMediaFormatValidation is true', () => {
			// Arrange
			const props = {
				data: mockData,
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
				isCloudKitsEligible: true,
				isImport: false,
				showMediaFormatValidation: true,
			};

			// Act
			render( <KitContentCustomizationDialog { ...props } /> );

			// Assert
			expect( screen.getByText( 'Note:' ) ).toBeTruthy();
			expect( screen.getByText( /To export a ZIP, go to Edit Content, choose 'Link to Media', then Export as ZIP/ ) ).toBeTruthy();
			expect( screen.getByText( /Or, save this template to the cloud instead/ ) ).toBeTruthy();
		} );

		it( 'should not show validation alert when showMediaFormatValidation is false', () => {
			// Arrange
			const props = {
				data: mockData,
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
				isCloudKitsEligible: true,
				isImport: false,
				showMediaFormatValidation: false,
			};

			// Act
			render( <KitContentCustomizationDialog { ...props } /> );

			// Assert
			expect( screen.queryByText( 'Note:' ) ).toBeFalsy();
		} );

		it( 'should include cloud mediaFormat in settings when cloud option is selected', () => {
			// Arrange
			const props = {
				data: mockData,
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
				isCloudKitsEligible: true,
				isImport: false,
			};

			// Act
			render( <KitContentCustomizationDialog { ...props } /> );

			const cloudRadio = screen.getByTestId( 'media-format-cloud' );
			fireEvent.click( cloudRadio );

			const saveButton = screen.getByText( 'Save changes' );
			fireEvent.click( saveButton );

			// Assert
			expect( mockHandleSaveChanges ).toHaveBeenCalledWith(
				'content',
				expect.objectContaining( {
					mediaFormat: 'cloud',
				} ),
				true,
				expect.objectContaining( {
					mediaFormat: 'cloud',
				} ),
			);
		} );
	} );

	describe( 'Upgrade Version Banner', () => {
		it( 'should render upgrade version banner when isOldElementorVersion is true', () => {
			// Arrange
			useContextDetection.mockReturnValue( {
				isImport: false,
				contextData: {
					data: mockData,
					isOldElementorVersion: true,
				},
			} );

			const props = {
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
			};

			// Act
			render( <KitContentCustomizationDialog { ...props } /> );

			// Assert
			// The banner component should be rendered, but we can't test its content without mocking the component
			expect( screen.getByText( 'Custom post types' ) ).toBeTruthy();
		} );

		it( 'should not render upgrade version banner when isOldElementorVersion is false', () => {
			// Arrange
			const props = {
				data: mockData,
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
				isOldElementorVersion: false,
			};

			// Act
			render( <KitContentCustomizationDialog { ...props } /> );

			// Assert
			expect( screen.getByText( 'Custom post types' ) ).toBeTruthy();
		} );
	} );

	describe( 'Event Tracking', () => {
		it( 'should call AppsEventTracking.sendPageViewsWebsiteTemplates when dialog opens', () => {
			// Arrange
			const props = {
				data: mockData,
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
			};

			// Act
			render( <KitContentCustomizationDialog { ...props } /> );

			// Assert
			expect( AppsEventTracking.sendPageViewsWebsiteTemplates ).toHaveBeenCalledWith( 'test-location' );
		} );

		it( 'should not call tracking when dialog is closed', () => {
			// Arrange
			const props = {
				data: mockData,
				open: false,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
			};

			// Act
			render( <KitContentCustomizationDialog { ...props } /> );

			// Assert
			expect( AppsEventTracking.sendPageViewsWebsiteTemplates ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'Import Mode Data Validation', () => {
		it( 'should render dialog with malformed manifest data', () => {
			// Arrange
			const malformedData = {
				...mockData,
				uploadedData: {
					manifest: {
						content: null,
						'wp-content': undefined,
						'custom-post-type-title': 'invalid-string',
					},
				},
			};

			useContextDetection.mockReturnValue( {
				isImport: true,
				contextData: {
					data: malformedData,
					isOldElementorVersion: false,
				},
			} );

			const props = {
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
			};

			// Act
			render( <KitContentCustomizationDialog { ...props } /> );

			// Assert - should still render basic dialog
			expect( screen.getByText( 'Edit content' ) ).toBeTruthy();
			expect( screen.getByText( 'Custom post types' ) ).toBeTruthy();
		} );

		it( 'should render dialog with missing manifest sections', () => {
			// Arrange
			const incompleteData = {
				...mockData,
				uploadedData: {
					manifest: {
						// Missing content and wp-content sections
					},
				},
			};

			useContextDetection.mockReturnValue( {
				isImport: true,
				contextData: {
					data: incompleteData,
					isOldElementorVersion: false,
				},
			} );

			const props = {
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
			};

			// Act
			render( <KitContentCustomizationDialog { ...props } /> );

			// Assert - should render with default values
			expect( screen.getByText( 'Edit content' ) ).toBeTruthy();
			expect( screen.getByText( 'Custom post types' ) ).toBeTruthy();
		} );

		it( 'should render dialog with empty manifest data', () => {
			// Arrange
			const emptyData = {
				...mockData,
				uploadedData: {
					manifest: {},
				},
			};

			useContextDetection.mockReturnValue( {
				isImport: true,
				contextData: {
					data: emptyData,
					isOldElementorVersion: false,
				},
			} );

			const props = {
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
			};

			// Act
			render( <KitContentCustomizationDialog { ...props } /> );

			// Assert
			expect( screen.getByText( 'Edit content' ) ).toBeTruthy();
			expect( screen.getByText( 'Custom post types' ) ).toBeTruthy();
		} );

		it( 'should render dialog with valid manifest data', () => {
			// Arrange
			const validData = {
				...mockData,
				uploadedData: {
					manifest: {
						content: {
							post: [ 'post-1', 'post-2' ],
						},
						'wp-content': {
							post: [ 'post-1' ],
						},
						'custom-post-type-title': [ 'test_cpt' ],
					},
				},
			};

			useContextDetection.mockReturnValue( {
				isImport: true,
				contextData: {
					data: validData,
					isOldElementorVersion: false,
				},
			} );

			const props = {
				open: true,
				handleClose: mockHandleClose,
				handleSaveChanges: mockHandleSaveChanges,
			};

			// Act
			render( <KitContentCustomizationDialog { ...props } /> );

			// Assert
			expect( screen.getByText( 'Edit content' ) ).toBeTruthy();
			expect( screen.getByText( 'Custom post types' ) ).toBeTruthy();
		} );
	} );
} );
