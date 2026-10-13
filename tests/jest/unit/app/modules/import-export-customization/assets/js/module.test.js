jest.mock( '@elementor/router', () => ( {
	addRoute: jest.fn(),
} ), { virtual: true } );

jest.mock( 'elementor/app/modules/import-export-customization/assets/js/export', () => function Export() {} );
jest.mock( 'elementor/app/modules/import-export-customization/assets/js/import', () => function Import() {} );
jest.mock(
	'elementor/app/modules/import-export-customization/assets/js/shared/registry/customization-dialogs',
	() => ( {
		initializeCustomizationDialogsRegistration: jest.fn(),
	} ),
);

import ImportExportCustomization from 'elementor/app/modules/import-export-customization/assets/js/module';
import router from '@elementor/router';
import {
	initializeCustomizationDialogsRegistration,
} from 'elementor/app/modules/import-export-customization/assets/js/shared/registry/customization-dialogs';

describe( 'ImportExportCustomization', () => {
	beforeEach( () => {
		router.addRoute.mockClear();
		initializeCustomizationDialogsRegistration.mockClear();
	} );

	it( 'initializes the customization dialog registry before adding routes', () => {
		// Act
		new ImportExportCustomization();

		// Assert
		expect( initializeCustomizationDialogsRegistration ).toHaveBeenCalledTimes( 1 );
		expect( router.addRoute ).toHaveBeenCalledTimes( 2 );
		expect( initializeCustomizationDialogsRegistration.mock.invocationCallOrder[ 0 ] ).toBeLessThan( router.addRoute.mock.invocationCallOrder[ 0 ] );
	} );
} );
