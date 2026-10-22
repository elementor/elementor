import { BaseRegistry } from 'elementor/app/modules/import-export-customization/assets/js/shared/registry/base';

describe( 'BaseRegistry', () => {
	it( 'merges flat override fields while preserving parent metadata', () => {
		// Arrange
		const registry = new BaseRegistry();
		const initialComponent = () => null;
		const nextComponent = () => null;

		registry.register( {
			key: 'settings/theme',
			parentKey: 'settings',
			title: 'Theme',
			component: initialComponent,
		} );

		// Act
		registry.register( {
			key: 'settings/theme',
			title: 'Theme',
			component: nextComponent,
			order: 20,
		} );

		// Assert
		const registered = registry.get( 'settings/theme' );
		expect( registered.component ).toBe( nextComponent );
		expect( registered.parentKey ).toBe( 'settings' );
		expect( registered.order ).toBe( 20 );
	} );
} );
