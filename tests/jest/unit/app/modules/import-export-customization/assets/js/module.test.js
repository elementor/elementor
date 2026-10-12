const mockAddRoute = jest.fn();
const mockRegisterGlobalCustomizationDialogs = jest.fn();

jest.mock( '@elementor/router', () => ( {
	addRoute: mockAddRoute,
} ) );

jest.mock( 'elementor/app/modules/import-export-customization/assets/js/export', () => function Export() {} );
jest.mock( 'elementor/app/modules/import-export-customization/assets/js/import', () => function Import() {} );
jest.mock(
	'elementor/app/modules/import-export-customization/assets/js/shared/registry/customization-dialogs',
	() => ( {
		registerGlobalCustomizationDialogs: mockRegisterGlobalCustomizationDialogs,
	} ),
);

import ImportExportCustomization from 'elementor/app/modules/import-export-customization/assets/js/module';

describe( 'ImportExportCustomization', () => {
	beforeEach( () => {
		mockAddRoute.mockClear();
		mockRegisterGlobalCustomizationDialogs.mockClear();
	} );

	it( 'registers customization dialogs before adding routes', () => {
		// Act
		new ImportExportCustomization();

		// Assert
		expect( mockRegisterGlobalCustomizationDialogs ).toHaveBeenCalledTimes( 1 );
		expect( mockAddRoute ).toHaveBeenCalledTimes( 2 );
		expect( mockRegisterGlobalCustomizationDialogs.mock.invocationCallOrder[ 0 ] ).toBeLessThan( mockAddRoute.mock.invocationCallOrder[ 0 ] );
	} );
} );
