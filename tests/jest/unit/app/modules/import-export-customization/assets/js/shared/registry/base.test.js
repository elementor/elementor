import { BaseRegistry } from 'elementor/app/modules/import-export-customization/assets/js/shared/registry/base';

describe( 'BaseRegistry', () => {
	it( 'merges top-level override fields while preserving existing children', () => {
		// Arrange
		const registry = new BaseRegistry();
		const initialComponent = () => null;
		const initialSection = () => null;
		const nextComponent = () => null;
		const nextSection = () => null;

		registry.register( {
			key: 'settings',
			title: 'Settings',
			component: initialComponent,
			section: initialSection,
			children: [
				{ key: 'settings/theme', title: 'Theme', order: 20 },
			],
		} );

		// Act
		registry.register( {
			key: 'settings',
			title: 'Settings',
			component: nextComponent,
			section: nextSection,
		} );

		// Assert
		const registered = registry.get( 'settings' );
		expect( registered.component ).toBe( nextComponent );
		expect( registered.section ).toBe( nextSection );
		expect( registered.children ).toHaveLength( 1 );
		expect( registered.children[ 0 ].key ).toBe( 'settings/theme' );
	} );
} );
