import {
	KIT_SECTIONS,
	KIT_SECTION_ITEMS,
} from 'elementor/app/modules/import-export-customization/assets/js/shared/constants';
import {
	createRegisteredCustomizationDialogsRegistry,
	initializeCustomizationDialogsRegistration,
	prepareCustomizationDialogsForRender,
} from 'elementor/app/modules/import-export-customization/assets/js/shared/registry/customization-dialogs';
import { createCustomizationDialogsRegistry } from 'elementor/app/modules/import-export-customization/assets/js/shared/registry/customization-dialogs-base';

describe( 'customizationDialogsRegistry', () => {
	it( 'registers Core settings nodes during render preparation', () => {
		// Arrange
		const customizationDialogsRegistry = createCustomizationDialogsRegistry();

		// Act
		initializeCustomizationDialogsRegistration( customizationDialogsRegistry );
		prepareCustomizationDialogsForRender( customizationDialogsRegistry );

		// Assert
		expect( customizationDialogsRegistry.get( KIT_SECTION_ITEMS.SETTINGS_DESIGN_SYSTEM ) ).toEqual(
			expect.objectContaining( {
				key: KIT_SECTION_ITEMS.SETTINGS_DESIGN_SYSTEM,
				parentKey: KIT_SECTIONS.SETTINGS,
			} ),
		);
		expect( customizationDialogsRegistry.get( KIT_SECTION_ITEMS.SETTINGS_THEME ) ).toEqual(
			expect.objectContaining( { key: KIT_SECTION_ITEMS.SETTINGS_THEME } ),
		);
		expect( customizationDialogsRegistry.get( KIT_SECTION_ITEMS.SETTINGS_GLOBAL_CLASSES ) ).toEqual(
			expect.objectContaining( {
				key: KIT_SECTION_ITEMS.SETTINGS_GLOBAL_CLASSES,
				parentKey: KIT_SECTION_ITEMS.SETTINGS_DESIGN_SYSTEM,
			} ),
		);
		expect( customizationDialogsRegistry.get( KIT_SECTION_ITEMS.SETTINGS_GLOBAL_VARIABLES ) ).toEqual(
			expect.objectContaining( {
				key: KIT_SECTION_ITEMS.SETTINGS_GLOBAL_VARIABLES,
				parentKey: KIT_SECTION_ITEMS.SETTINGS_DESIGN_SYSTEM,
			} ),
		);
		expect( customizationDialogsRegistry.get( KIT_SECTION_ITEMS.SETTINGS_DEFAULT_STYLES ) ).toEqual(
			expect.objectContaining( {
				key: KIT_SECTION_ITEMS.SETTINGS_DEFAULT_STYLES,
				parentKey: KIT_SECTION_ITEMS.SETTINGS_DESIGN_SYSTEM,
			} ),
		);
		expect( customizationDialogsRegistry.__elementorImportExportCustomization ).toEqual(
			expect.objectContaining( {
				hasRegisteredUi: true,
				supportsComponentOverrides: true,
			} ),
		);
	} );

	it( 'preserves Core settings node metadata when render preparation runs against an empty settings subtree', () => {
		// Arrange
		const customizationDialogsRegistry = createCustomizationDialogsRegistry();

		customizationDialogsRegistry.register( {
			key: KIT_SECTIONS.SETTINGS,
			title: 'Settings',
		} );

		// Act
		initializeCustomizationDialogsRegistration( customizationDialogsRegistry );
		prepareCustomizationDialogsForRender( customizationDialogsRegistry );

		// Assert
		expect( customizationDialogsRegistry.get( KIT_SECTION_ITEMS.SETTINGS_THEME ) ).toEqual(
			expect.objectContaining( {
				key: KIT_SECTION_ITEMS.SETTINGS_THEME,
				title: 'Theme',
				settingKey: 'theme',
			} ),
		);
		expect( customizationDialogsRegistry.get( KIT_SECTION_ITEMS.SETTINGS_GLOBAL_CLASSES ) ).toEqual(
			expect.objectContaining( {
				key: KIT_SECTION_ITEMS.SETTINGS_GLOBAL_CLASSES,
				title: 'Classes',
				settingKey: 'classes',
			} ),
		);
		expect( customizationDialogsRegistry.get( KIT_SECTION_ITEMS.SETTINGS_GLOBAL_VARIABLES ) ).toEqual(
			expect.objectContaining( {
				key: KIT_SECTION_ITEMS.SETTINGS_GLOBAL_VARIABLES,
				title: 'Variables',
				settingKey: 'variables',
			} ),
		);
		expect( customizationDialogsRegistry.get( KIT_SECTION_ITEMS.SETTINGS_DEFAULT_STYLES ) ).toEqual(
			expect.objectContaining( {
				key: KIT_SECTION_ITEMS.SETTINGS_DEFAULT_STYLES,
				title: 'Default styles',
				settingKey: 'defaultStyles',
			} ),
		);
	} );

	it( 'uses the legacy manifest.theme path for the theme initial state on old exports', () => {
		// Arrange
		const customizationDialogsRegistry = createRegisteredCustomizationDialogsRegistry();
		const themeRow = customizationDialogsRegistry.get( KIT_SECTION_ITEMS.SETTINGS_THEME );

		// Act
		const initialState = themeRow.getInitialState( {
			contextData: {
				isOldExport: true,
				data: {
					uploadedData: {
						manifest: {
							theme: true,
						},
					},
				},
			},
			includesSettings: true,
			isImport: true,
		} );

		// Assert
		expect( initialState ).toBe( true );
	} );
} );
