import { hasProInstalled, isProActive } from '../is-pro-user';

describe( 'is-pro-user utilities', () => {
	let originalElementor: Window[ 'elementor' ];
	let originalElementorPro: Window[ 'elementorPro' ];

	beforeEach( () => {
		originalElementor = window.elementor;
		originalElementorPro = window.elementorPro;
	} );

	afterEach( () => {
		window.elementor = originalElementor;
		window.elementorPro = originalElementorPro;
	} );

	describe( 'hasProInstalled', () => {
		it( 'should return false when elementor.helpers.hasPro is not defined', () => {
			// Arrange
			window.elementor = {};

			// Act & Assert
			expect( hasProInstalled() ).toBe( false );
		} );

		it( 'should return false when hasPro returns false', () => {
			// Arrange
			window.elementor = { helpers: { hasPro: () => false } };

			// Act & Assert
			expect( hasProInstalled() ).toBe( false );
		} );

		it( 'should return true when hasPro returns true', () => {
			// Arrange
			window.elementor = { helpers: { hasPro: () => true } };

			// Act & Assert
			expect( hasProInstalled() ).toBe( true );
		} );
	} );

	describe( 'isProActive', () => {
		it( 'should return false when Pro is not installed', () => {
			// Arrange
			window.elementor = { helpers: { hasPro: () => false } };
			window.elementorPro = { config: { isActive: true } };

			// Act & Assert
			expect( isProActive() ).toBe( false );
		} );

		it( 'should return false when Pro is installed but license is expired', () => {
			// Arrange
			window.elementor = { helpers: { hasPro: () => true } };
			window.elementorPro = { config: { isActive: false } };

			// Act & Assert
			expect( isProActive() ).toBe( false );
		} );

		it( 'should return true when Pro is installed and license is active', () => {
			// Arrange
			window.elementor = { helpers: { hasPro: () => true } };
			window.elementorPro = { config: { isActive: true } };

			// Act & Assert
			expect( isProActive() ).toBe( true );
		} );

		it( 'should return false when elementorPro config is not defined', () => {
			// Arrange
			window.elementor = { helpers: { hasPro: () => true } };
			window.elementorPro = undefined;

			// Act & Assert
			expect( isProActive() ).toBe( false );
		} );
	} );
} );
