import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

jest.mock( 'elementor/app/modules/import-export-customization/assets/js/shared/hooks/use-context-detection', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

jest.mock( 'elementor/app/modules/import-export-customization/assets/js/shared/hooks/use-classes-variables-limits', () => ( {
	useClassesVariablesLimits: jest.fn( () => ( {
		existingClassesCount: 0,
		existingVariablesCount: 0,
		classesLimit: 100,
		variablesLimit: 100,
		calculateLimitInfo: () => ( {
			isExceeded: false,
			overLimitCount: 0,
		} ),
	} ) ),
} ) );

jest.mock( 'elementor-app/event-track/apps-event-tracking', () => ( {
	AppsEventTracking: {
		sendPageViewsWebsiteTemplates: jest.fn(),
	},
} ) );

import useContextDetection from 'elementor/app/modules/import-export-customization/assets/js/shared/hooks/use-context-detection';
import { KitSettingsCustomizationDialog } from 'elementor/app/modules/import-export-customization/assets/js/shared/components/kit-settings-customization-dialog';
import {
	KIT_SECTIONS,
	KIT_SECTION_ITEMS,
} from 'elementor/app/modules/import-export-customization/assets/js/shared/constants';

function ThemeRow() {
	return <div>Theme row</div>;
}

function GeneralSettingsRow() {
	return <div>General settings row</div>;
}

function createRegistry( items ) {
	return {
		get: jest.fn( ( key ) => items.find( ( item ) => item.key === key ) ),
		getAll: jest.fn( () => items ),
	};
}

describe( 'KitSettingsCustomizationDialog', () => {
	const handleClose = jest.fn();
	const handleSaveChanges = jest.fn();
	const data = {
		includes: [ KIT_SECTIONS.SETTINGS ],
		customization: {
			settings: {},
		},
	};

	beforeEach( () => {
		jest.clearAllMocks();

		global.__ = jest.fn( ( text ) => text );
		global.elementorCommon = {
			config: {
				experimentalFeatures: {
					e_atomic_elements: false,
				},
			},
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
				data,
				isOldElementorVersion: false,
			},
		} );
	} );

	it( 'uses the latest registry rows when opened after the registry changes', () => {
		// Arrange
		const rows = [
			{
				key: KIT_SECTIONS.SETTINGS,
				title: 'Settings',
			},
			{
				key: KIT_SECTION_ITEMS.SETTINGS_GENERAL_SETTINGS,
				parentKey: KIT_SECTIONS.SETTINGS,
				title: 'Settings',
				order: 80,
				settingKey: 'generalSettings',
				component: GeneralSettingsRow,
				isAvailable: () => true,
			},
		];

		window.elementorModules = {
			importExport: {
				customizationDialogsRegistry: createRegistry( rows ),
			},
		};

		const { rerender } = render(
			<KitSettingsCustomizationDialog
				open={ false }
				handleClose={ handleClose }
				handleSaveChanges={ handleSaveChanges }
			/>,
		);

		rows.unshift( {
			key: KIT_SECTION_ITEMS.SETTINGS_THEME,
			parentKey: KIT_SECTIONS.SETTINGS,
			title: 'Theme',
			order: 10,
			settingKey: 'theme',
			component: ThemeRow,
			isAvailable: () => true,
		} );

		// Act
		rerender(
			<KitSettingsCustomizationDialog
				open={ true }
				handleClose={ handleClose }
				handleSaveChanges={ handleSaveChanges }
			/>,
		);

		// Assert
		expect( screen.getByText( 'Theme row' ) ).toBeTruthy();
		expect( screen.getByText( 'General settings row' ) ).toBeTruthy();
	} );

	it( 'falls back to the core theme row when the live registry is missing it', () => {
		// Arrange
		window.elementorModules = {
			importExport: {
				customizationDialogsRegistry: createRegistry( [
					{
						key: KIT_SECTIONS.SETTINGS,
						title: 'Settings',
					},
					{
						key: KIT_SECTION_ITEMS.SETTINGS_GENERAL_SETTINGS,
						parentKey: KIT_SECTIONS.SETTINGS,
						title: 'Settings',
						order: 80,
						settingKey: 'generalSettings',
						component: GeneralSettingsRow,
						isAvailable: () => true,
					},
				] ),
			},
		};

		// Act
		render(
			<KitSettingsCustomizationDialog
				open={ true }
				handleClose={ handleClose }
				handleSaveChanges={ handleSaveChanges }
			/>,
		);

		// Assert
		expect( screen.getByText( 'Theme' ) ).toBeTruthy();
		expect( screen.getByText( 'General settings row' ) ).toBeTruthy();
	} );

	it( 'keeps saved settings that have no registered row when saving again', () => {
		// Arrange
		const savedSettings = {
			generalSettings: false,
			classes: false,
			classesOverrideAll: true,
			variablesOverrideAll: true,
		};

		useContextDetection.mockReturnValue( {
			isImport: true,
			contextData: {
				data: {
					...data,
					customization: { settings: savedSettings },
				},
				isOldElementorVersion: false,
			},
		} );

		window.elementorModules = {
			importExport: {
				customizationDialogsRegistry: createRegistry( [
					{
						key: KIT_SECTIONS.SETTINGS,
						title: 'Settings',
					},
					{
						key: KIT_SECTION_ITEMS.SETTINGS_GENERAL_SETTINGS,
						parentKey: KIT_SECTIONS.SETTINGS,
						title: 'Settings',
						order: 80,
						settingKey: 'generalSettings',
						component: GeneralSettingsRow,
						isAvailable: () => true,
					},
				] ),
			},
		};

		render(
			<KitSettingsCustomizationDialog
				open={ true }
				handleClose={ handleClose }
				handleSaveChanges={ handleSaveChanges }
			/>,
		);

		// Act
		fireEvent.click( screen.getByText( 'Save changes' ) );

		// Assert
		expect( handleSaveChanges ).toHaveBeenCalledWith(
			KIT_SECTIONS.SETTINGS,
			expect.objectContaining( savedSettings ),
			true,
			expect.any( Object ),
		);
	} );
} );
