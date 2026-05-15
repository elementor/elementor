import { hasProInstalled, isProActive, isProAtLeast } from '../is-pro';

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

	describe( 'isProAtLeast', () => {
		it( 'should return true when version equals targetVersion', () => {
			// Arrange
			window.elementorPro = { config: { version: '3.9' } };

			// Act & Assert
			expect( isProAtLeast( '3.9' ) ).toBe( true );
		} );

		it( 'should return true when major is greater than targetVersion major', () => {
			// Arrange
			window.elementorPro = { config: { version: '4.2' } };

			// Act & Assert
			expect( isProAtLeast( '3.9' ) ).toBe( true );
		} );

		it( 'should return true when major matches and minor is greater', () => {
			// Arrange
			window.elementorPro = { config: { version: '3.21' } };

			// Act & Assert
			expect( isProAtLeast( '3.9' ) ).toBe( true );
		} );

		it( 'should return false when major is less than targetVersion major', () => {
			// Arrange
			window.elementorPro = { config: { version: '2.9' } };

			// Act & Assert
			expect( isProAtLeast( '3.0' ) ).toBe( false );
		} );

		it( 'should return false when major matches and minor is less', () => {
			// Arrange
			window.elementorPro = { config: { version: '3.9.0' } };

			// Act & Assert
			expect( isProAtLeast( '3.21' ) ).toBe( false );
		} );

		it( 'should return false when elementorPro is not defined', () => {
			// Arrange
			window.elementorPro = undefined;

			// Act & Assert
			expect( isProAtLeast( '3.9' ) ).toBe( false );
		} );

		it( 'should return false when version is not defined', () => {
			// Arrange
			window.elementorPro = { config: {} };

			// Act & Assert
			expect( isProAtLeast( '3.9' ) ).toBe( false );
		} );
	} );
} );
