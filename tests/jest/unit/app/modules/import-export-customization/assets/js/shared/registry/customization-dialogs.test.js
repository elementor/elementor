import {
	KIT_SECTIONS,
	KIT_SECTION_ITEMS,
} from 'elementor/app/modules/import-export-customization/assets/js/shared/constants';
import { customizationDialogsRegistry } from 'elementor/app/modules/import-export-customization/assets/js/shared/registry/customization-dialogs';

describe( 'customizationDialogsRegistry', () => {
	it( 'uses the legacy manifest.theme path for the theme initial state on old exports', () => {
		// Arrange
		const settingsRegistry = customizationDialogsRegistry.get( KIT_SECTIONS.SETTINGS );
		const themeRow = settingsRegistry.children.find( ( child ) => KIT_SECTION_ITEMS.SETTINGS_THEME === child.key );

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
