import { render, screen, fireEvent, within } from '@testing-library/react';
import eventsConfig from 'elementor/core/common/modules/events-manager/assets/js/events-config';
import KitPartsSelection from 'elementor/app/modules/import-export-customization/assets/js/shared/components/kit-parts-selection';

jest.mock( 'elementor/app/modules/import-export-customization/assets/js/shared/hooks/use-context-detection', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

jest.mock( 'elementor/app/modules/import-export-customization/assets/js/shared/kit-content-data', () => [
	{
		type: 'templates',
		data: {
			title: 'Templates',
			features: {
				open: [ 'Pages', 'Posts', 'Headers', 'Footers' ],
			},
		},
		required: false,
		dialog: null,
	},
	{
		type: 'settings',
		data: {
			title: 'Site Settings',
			features: {
				open: [ 'Global Colors', 'Global Fonts', 'Theme Style Settings' ],
			},
		},
		required: false,
		dialog: null,
	},
	{
		type: 'content',
		data: {
			title: 'Content',
			features: {
				open: [ 'Pages', 'Posts', 'Media' ],
			},
		},
		required: true,
		dialog: null,
	},
] );

import useContextDetection from 'elementor/app/modules/import-export-customization/assets/js/shared/hooks/use-context-detection';

describe( 'KitPartsSelection Component', () => {
	const mockOnCheckboxChange = jest.fn();
	const mockHandleSaveCustomization = jest.fn();
	const mockData = {
		includes: [ 'templates', 'settings', 'content' ],
		customization: {},
	};

	beforeEach( () => {
		jest.clearAllMocks();
		global.__ = jest.fn( ( text ) => text );
		global.elementorAppConfig = {};
		global.elementorCommon = {
			eventsManager: {
				dispatchEvent: jest.fn(),
				config: eventsConfig,
			},
		};

		useContextDetection.mockReturnValue( {
			isImport: false,
			contextData: {
				data: mockData,
			},
		} );
	} );

	describe( 'Component Rendering', () => {
		it( 'should render all kit content items', () => {
			// Arrange
			const props = {
				data: mockData,
				onCheckboxChange: mockOnCheckboxChange,
				handleSaveCustomization: mockHandleSaveCustomization,
				testId: 'test-kit-parts',
			};

			// Act
			render( <KitPartsSelection { ...props } /> );

			// Assert
			expect( screen.getByText( 'Templates' ) ).toBeTruthy();
			expect( screen.getByText( 'Site Settings' ) ).toBeTruthy();
			expect( screen.getByText( 'Content' ) ).toBeTruthy();
		} );

		it( 'should render features for each item', () => {
			// Arrange
			const props = {
				data: mockData,
				onCheckboxChange: mockOnCheckboxChange,
				handleSaveCustomization: mockHandleSaveCustomization,
				testId: 'test-kit-parts',
			};

			// Act
			render( <KitPartsSelection { ...props } /> );

			// Assert
			expect( screen.getByText( 'Pages, Posts, Headers, Footers' ) ).toBeTruthy();
			expect( screen.getByText( 'Global Colors, Global Fonts, Theme Style Settings' ) ).toBeTruthy();
			expect( screen.getByText( 'Pages, Posts, Media' ) ).toBeTruthy();
		} );

		it( 'should render Edit buttons for each item', () => {
			// Arrange
			const props = {
				data: mockData,
				onCheckboxChange: mockOnCheckboxChange,
				handleSaveCustomization: mockHandleSaveCustomization,
				testId: 'test-kit-parts',
			};

			// Act
			render( <KitPartsSelection { ...props } /> );

			// Assert
			const editButtons = screen.getAllByText( 'Edit' );
			expect( editButtons.length ).toBe( 3 );
		} );

		it( 'should render with custom testId', () => {
			// Arrange
			const props = {
				data: mockData,
				onCheckboxChange: mockOnCheckboxChange,
				handleSaveCustomization: mockHandleSaveCustomization,
				testId: 'custom-test-id',
			};

			// Act
			render( <KitPartsSelection { ...props } /> );

			// Assert
			expect( screen.getByTestId( 'custom-test-id' ) ).toBeTruthy();
		} );
	} );

	describe( 'Checkbox State Management', () => {
		it( 'should show checkboxes as checked for included items', () => {
			// Arrange
			const data = {
				includes: [ 'templates', 'settings' ],
				customization: {},
			};

			useContextDetection.mockReturnValue( {
				isImport: false,
				contextData: {
					data,
				},
			} );

			const props = {
				onCheckboxChange: mockOnCheckboxChange,
				handleSaveCustomization: mockHandleSaveCustomization,
				testId: 'test-kit-parts',
			};

			// Act
			render( <KitPartsSelection { ...props } /> );

			// Assert
			const templatesCheckbox = within( screen.getByTestId( 'KitContentDataSelection-templates' ) ).getByRole( 'checkbox' );
			const settingsCheckbox = within( screen.getByTestId( 'KitContentDataSelection-settings' ) ).getByRole( 'checkbox' );
			const contentCheckbox = within( screen.getByTestId( 'KitContentDataSelection-content' ) ).getByRole( 'checkbox' );

			expect( templatesCheckbox.checked ).toBe( true );
			expect( settingsCheckbox.checked ).toBe( true );
			expect( contentCheckbox.checked ).toBe( false );
		} );

		it( 'should show checkboxes as unchecked for non-included items', () => {
			// Arrange
			const data = {
				includes: [],
				customization: {},
			};

			useContextDetection.mockReturnValue( {
				isImport: false,
				contextData: {
					data,
				},
			} );

			const props = {
				onCheckboxChange: mockOnCheckboxChange,
				handleSaveCustomization: mockHandleSaveCustomization,
				testId: 'test-kit-parts',
			};

			// Act
			render( <KitPartsSelection { ...props } /> );

			// Assert
			const templatesCheckbox = within( screen.getByTestId( 'KitContentDataSelection-templates' ) ).getByRole( 'checkbox' );
			const settingsCheckbox = within( screen.getByTestId( 'KitContentDataSelection-settings' ) ).getByRole( 'checkbox' );
			const contentCheckbox = within( screen.getByTestId( 'KitContentDataSelection-content' ) ).getByRole( 'checkbox' );

			expect( templatesCheckbox.checked ).toBe( false );
			expect( settingsCheckbox.checked ).toBe( false );
			expect( contentCheckbox.checked ).toBe( false );
		} );
	} );

	describe( 'Export Mode Functionality', () => {
		it( 'should detect export mode when uploadedData is not present', () => {
			// Arrange
			const props = {
				data: mockData,
				onCheckboxChange: mockOnCheckboxChange,
				handleSaveCustomization: mockHandleSaveCustomization,
				testId: 'test-kit-parts',
			};

			// Act
			render( <KitPartsSelection { ...props } /> );

			// Assert
			const contentCheckbox = within( screen.getByTestId( 'KitContentDataSelection-content' ) ).getByRole( 'checkbox' );
			expect( contentCheckbox.disabled ).toBe( true );
		} );

		it( 'should disable required items in export mode', async () => {
			// Arrange
			const props = {
				data: mockData,
				onCheckboxChange: mockOnCheckboxChange,
				handleSaveCustomization: mockHandleSaveCustomization,
				testId: 'test-kit-parts',
			};

			// Act
			render( <KitPartsSelection { ...props } /> );

			// Assert
			const contentCheckbox = within( screen.getByTestId( 'KitContentDataSelection-content' ) ).getByRole( 'checkbox' );

			expect( contentCheckbox.disabled ).toBe( true );
		} );

		it( 'should enable non-required items in export mode', () => {
			// Arrange
			const props = {
				data: mockData,
				onCheckboxChange: mockOnCheckboxChange,
				handleSaveCustomization: mockHandleSaveCustomization,
				testId: 'test-kit-parts',
			};

			// Act
			render( <KitPartsSelection { ...props } /> );

			// Assert
			const templatesCheckbox = within( screen.getByTestId( 'KitContentDataSelection-templates' ) ).getByRole( 'checkbox' );
			const settingsCheckbox = within( screen.getByTestId( 'KitContentDataSelection-settings' ) ).getByRole( 'checkbox' );

			expect( templatesCheckbox.disabled ).toBe( false );
			expect( settingsCheckbox.disabled ).toBe( false );
		} );
	} );

	describe( 'Import Mode Functionality', () => {
		it( 'should detect import mode when uploadedData is present', () => {
			// Arrange
			const importData = {
				includes: [ 'templates', 'settings' ],
				customization: {},
				uploadedData: {
					manifest: {
						templates: true,
						'site-settings': true,
						content: false,
					},
				},
			};
			const props = {
				data: importData,
				onCheckboxChange: mockOnCheckboxChange,
				handleSaveCustomization: mockHandleSaveCustomization,
				testId: 'test-kit-parts',
			};

			// Act
			render( <KitPartsSelection { ...props } /> );

			// Assert
			expect( screen.getByText( 'Templates' ) ).toBeTruthy();
			expect( screen.getByText( 'Site Settings' ) ).toBeTruthy();
		} );

		it( 'should disable items not available in manifest', () => {
			// Arrange
			const importData = {
				includes: [ 'templates', 'settings' ],
				customization: {},
				uploadedData: {
					manifest: {
						templates: true,
						content: false,
					},
				},
			};

			useContextDetection.mockReturnValue( {
				isImport: true,
				contextData: {
					isImport: true,
					isOldExport: false,
					data: importData,
				},
			} );

			const props = {
				data: importData,
				onCheckboxChange: mockOnCheckboxChange,
				handleSaveCustomization: mockHandleSaveCustomization,
				testId: 'test-kit-parts',
			};

			// Act
			render( <KitPartsSelection { ...props } /> );

			// Assert
			const templatesCheckbox = within( screen.getByTestId( 'KitContentDataSelection-templates' ) ).getByRole( 'checkbox' );
			const settingsCheckbox = within( screen.getByTestId( 'KitContentDataSelection-settings' ) ).getByRole( 'checkbox' );
			const contentCheckbox = within( screen.getByTestId( 'KitContentDataSelection-content' ) ).getByRole( 'checkbox' );

			expect( templatesCheckbox.disabled ).toBe( false );
			expect( settingsCheckbox.disabled ).toBe( true );
			expect( contentCheckbox.disabled ).toBe( true );
		} );

		it( 'should enable items available in manifest', () => {
			// Arrange
			const importData = {
				includes: [ 'templates', 'settings' ],
				customization: {},
				uploadedData: {
					manifest: {
						templates: true,
						'site-settings': { test: true },
						content: true,
					},
				},
			};

			useContextDetection.mockReturnValue( {
				isImport: true,
				contextData: {
					data: importData,
				},
			} );

			const props = {
				data: importData,
				onCheckboxChange: mockOnCheckboxChange,
				handleSaveCustomization: mockHandleSaveCustomization,
				testId: 'test-kit-parts',
			};

			// Act
			render( <KitPartsSelection { ...props } /> );

			// Assert
			const templatesCheckbox = within( screen.getByTestId( 'KitContentDataSelection-templates' ) ).getByRole( 'checkbox' );
			const settingsCheckbox = within( screen.getByTestId( 'KitContentDataSelection-settings' ) ).getByRole( 'checkbox' );
			const contentCheckbox = within( screen.getByTestId( 'KitContentDataSelection-content' ) ).getByRole( 'checkbox' );

			expect( templatesCheckbox.disabled ).toBe( false );
			expect( settingsCheckbox.disabled ).toBe( false );
			expect( contentCheckbox.disabled ).toBe( true );
		} );

		it( 'should map settings type to site-settings in manifest', () => {
			// Arrange
			const importData = {
				includes: [ 'settings' ],
				customization: {},
				uploadedData: {
					manifest: {
						'site-settings': true,
					},
				},
			};
			const props = {
				data: importData,
				onCheckboxChange: mockOnCheckboxChange,
				handleSaveCustomization: mockHandleSaveCustomization,
				testId: 'test-kit-parts',
			};

			// Act
			render( <KitPartsSelection { ...props } /> );

			// Assert
			const settingsCheckbox = within( screen.getByTestId( 'KitContentDataSelection-settings' ) ).getByRole( 'checkbox' );
			expect( settingsCheckbox.disabled ).toBe( false );
		} );

		it( 'should handle missing manifest gracefully', () => {
			// Arrange
			const importData = {
				includes: [ 'templates', 'settings' ],
				customization: {},
				uploadedData: {},
			};
			const props = {
				data: importData,
				onCheckboxChange: mockOnCheckboxChange,
				handleSaveCustomization: mockHandleSaveCustomization,
				testId: 'test-kit-parts',
			};

			// Act
			render( <KitPartsSelection { ...props } /> );

			// Assert
			expect( screen.getByText( 'Templates' ) ).toBeTruthy();
			expect( screen.getByText( 'Site Settings' ) ).toBeTruthy();
		} );

		it( 'should handle empty manifest gracefully', () => {
			// Arrange
			const importData = {
				includes: [ 'templates', 'settings' ],
				customization: {},
				uploadedData: {
					manifest: {},
				},
			};
			const props = {
				data: importData,
				onCheckboxChange: mockOnCheckboxChange,
				handleSaveCustomization: mockHandleSaveCustomization,
				testId: 'test-kit-parts',
			};

			// Act
			render( <KitPartsSelection { ...props } /> );

			// Assert
			expect( screen.getByText( 'Templates' ) ).toBeTruthy();
			expect( screen.getByText( 'Site Settings' ) ).toBeTruthy();
		} );
	} );

	describe( 'User Interactions', () => {
		it( 'should call onCheckboxChange when checkbox is clicked', () => {
			// Arrange
			const props = {
				data: mockData,
				onCheckboxChange: mockOnCheckboxChange,
				handleSaveCustomization: mockHandleSaveCustomization,
				testId: 'test-kit-parts',
			};
			render( <KitPartsSelection { ...props } /> );
			const templatesCheckbox = screen.getByTestId( 'KitContentDataSelection-templates' );

			// Act
			fireEvent.click( templatesCheckbox );

			// Assert
			expect( mockOnCheckboxChange ).toHaveBeenCalledWith( 'templates' );
		} );

		it( 'should not call onCheckboxChange when disabled checkbox is clicked', () => {
			// Arrange
			const importData = {
				includes: [ 'templates' ],
				customization: {},
				uploadedData: {
					manifest: {
						templates: true,
					},
				},
			};

			useContextDetection.mockReturnValue( {
				isImport: true,
				contextData: {
					isOldExport: false,
					data: importData,
				},
			} );

			const props = {
				onCheckboxChange: mockOnCheckboxChange,
				handleSaveCustomization: mockHandleSaveCustomization,
				testId: 'test-kit-parts',
			};
			render( <KitPartsSelection { ...props } /> );
			const settingsCheckbox = screen.getByTestId( 'KitContentDataSelection-settings' );

			// Act
			fireEvent.click( settingsCheckbox );

			// Assert
			expect( mockOnCheckboxChange ).not.toHaveBeenCalledWith( 'settings' );
		} );

		it( 'should call handleSaveCustomization when Edit button is clicked', () => {
			// Arrange
			const props = {
				data: mockData,
				onCheckboxChange: mockOnCheckboxChange,
				handleSaveCustomization: mockHandleSaveCustomization,
				testId: 'test-kit-parts',
			};
			render( <KitPartsSelection { ...props } /> );
			const editButtons = screen.getAllByText( 'Edit' );
			const firstEditButton = editButtons[ 0 ];

			// Act
			fireEvent.click( firstEditButton );

			// Assert
			expect( firstEditButton ).toBeTruthy();
		} );

		it( 'should disable Edit button for disabled items in import mode', () => {
			// Arrange
			const importData = {
				includes: [ 'templates' ],
				customization: {},
				uploadedData: {
					manifest: {
						templates: {
							123: {},
						},
					},
				},
			};

			useContextDetection.mockReturnValue( {
				isImport: true,
				contextData: {
					isOldExport: false,
					data: importData,
				},
			} );

			const props = {
				data: importData,
				onCheckboxChange: mockOnCheckboxChange,
				handleSaveCustomization: mockHandleSaveCustomization,
				testId: 'test-kit-parts',
			};
			render( <KitPartsSelection { ...props } /> );
			const settingsSection = screen.getByTestId( `KitPartsSelectionRow-settings` );
			const settingsCheckbox = within( screen.getByTestId( 'KitContentDataSelection-settings' ) ).getByRole( 'checkbox' );
			const contentCheckbox = within( screen.getByTestId( 'KitContentDataSelection-content' ) ).getByRole( 'checkbox' );

			// Act & Assert
			expect( within( settingsSection ).getByText( 'Not exported' ) ).toBeTruthy();
			expect( settingsCheckbox.disabled ).toBe( true );
			expect( contentCheckbox.disabled ).toBe( true );
		} );
	} );

	describe( 'Edge Cases', () => {
		it( 'should handle empty includes array', () => {
			// Arrange
			const data = {
				includes: [],
				customization: {},
			};

			useContextDetection.mockReturnValue( {
				isImport: false,
				contextData: {
					data,
				},
			} );

			const props = {
				onCheckboxChange: mockOnCheckboxChange,
				handleSaveCustomization: mockHandleSaveCustomization,
				testId: 'test-kit-parts',
			};

			// Act
			render( <KitPartsSelection { ...props } /> );

			// Assert
			const templatesCheckbox = within( screen.getByTestId( 'KitContentDataSelection-templates' ) ).getByRole( 'checkbox' );
			const settingsCheckbox = within( screen.getByTestId( 'KitContentDataSelection-settings' ) ).getByRole( 'checkbox' );
			const contentCheckbox = within( screen.getByTestId( 'KitContentDataSelection-content' ) ).getByRole( 'checkbox' );

			expect( templatesCheckbox.checked ).toBe( false );
			expect( settingsCheckbox.checked ).toBe( false );
			expect( contentCheckbox.checked ).toBe( false );
		} );

		it( 'should handle includes with non-existent types', () => {
			// Arrange
			const data = {
				includes: [ 'non-existent-type' ],
				customization: {},
			};

			useContextDetection.mockReturnValue( {
				isImport: false,
				contextData: {
					data,
				},
			} );

			const props = {
				onCheckboxChange: mockOnCheckboxChange,
				handleSaveCustomization: mockHandleSaveCustomization,
				testId: 'test-kit-parts',
			};

			// Act
			render( <KitPartsSelection { ...props } /> );

			// Assert
			expect( screen.getByText( 'Templates' ) ).toBeTruthy();
			expect( screen.getByText( 'Site Settings' ) ).toBeTruthy();
		} );

		it( 'should handle import data with missing uploadedData properties', () => {
			// Arrange
			const importData = {
				includes: [ 'templates', 'settings' ],
				customization: {},
				uploadedData: {},
			};

			useContextDetection.mockReturnValue( {
				isImport: false,
				contextData: {
					data: importData,
				},
			} );

			const props = {
				onCheckboxChange: mockOnCheckboxChange,
				handleSaveCustomization: mockHandleSaveCustomization,
				testId: 'test-kit-parts',
			};

			// Act
			render( <KitPartsSelection { ...props } /> );

			// Assert
			expect( screen.getByText( 'Templates' ) ).toBeTruthy();
			expect( screen.getByText( 'Site Settings' ) ).toBeTruthy();
		} );
	} );
} );
