import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

jest.mock( 'elementor/app/modules/import-export-customization/assets/js/shared/hooks/use-context-detection', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

jest.mock( 'elementor-app/event-track/apps-event-tracking', () => ( {
	AppsEventTracking: {
		sendPageViewsWebsiteTemplates: jest.fn(),
	},
} ) );

import useContextDetection from 'elementor/app/modules/import-export-customization/assets/js/shared/hooks/use-context-detection';
import { KitTemplatesCustomizationDialog } from 'elementor/app/modules/import-export-customization/assets/js/shared/components/kit-templates-customization-dialog';
import { KIT_SECTIONS } from 'elementor/app/modules/import-export-customization/assets/js/shared/constants';

function SiteTemplatesSection() {
	return <div>Site templates section</div>;
}

function createRegistry( items ) {
	return {
		get: jest.fn( ( key ) => items.find( ( item ) => item.key === key ) ),
		getAll: jest.fn( () => items ),
	};
}

describe( 'KitTemplatesCustomizationDialog', () => {
	const handleClose = jest.fn();
	const handleSaveChanges = jest.fn();

	beforeEach( () => {
		jest.clearAllMocks();

		global.__ = jest.fn( ( text ) => text );
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
	} );

	it( 'keeps saved templates customization that has no registered section when saving again', () => {
		// Arrange
		const savedTemplates = {
			siteTemplates: { enabled: false },
			unregisteredSection: { enabled: true },
		};

		useContextDetection.mockReturnValue( {
			isImport: true,
			contextData: {
				data: {
					includes: [ KIT_SECTIONS.TEMPLATES ],
					customization: { templates: savedTemplates },
				},
				isOldElementorVersion: false,
			},
		} );

		window.elementorModules = {
			importExport: {
				customizationDialogsRegistry: createRegistry( [
					{
						key: KIT_SECTIONS.TEMPLATES,
						title: 'Templates',
					},
					{
						key: 'site-templates',
						parentKey: KIT_SECTIONS.TEMPLATES,
						title: 'Site templates',
						order: 10,
						settingKey: 'siteTemplates',
						component: SiteTemplatesSection,
						isAvailable: () => true,
					},
				] ),
			},
		};

		render(
			<KitTemplatesCustomizationDialog
				open={ true }
				handleClose={ handleClose }
				handleSaveChanges={ handleSaveChanges }
			/>,
		);

		// Act
		fireEvent.click( screen.getByText( 'Save changes' ) );

		// Assert
		expect( handleSaveChanges ).toHaveBeenCalledWith(
			KIT_SECTIONS.TEMPLATES,
			savedTemplates,
			true,
			expect.any( Object ),
		);
	} );
} );
