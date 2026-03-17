import { freeMock, setupMock } from 'elementor/tests/jest/unit/modules/web-cli/assets/js/core/mock/api';

describe( 'load-animation-assets--document/elements/settings', () => {
	let LoadAnimationAssets;

	beforeEach( async () => {
		await setupMock();

		( { LoadAnimationAssets } = await import( 'elementor-document/hooks/ui/settings/load-animation-assets' ) );

		$e.components.register( new class extends $e.modules.ComponentBase {
			getNamespace() {
				return 'document';
			}

			defaultHooks() {
				return this.importHooks( { LoadAnimationAssets } );
			}
		} );
	} );

	afterEach( async () => {
		await freeMock();
	} );

	describe( 'getConditions()', () => {
		it( 'Should return true when a setting matches an animation control type', () => {
			// Arrange.
			const container = createContainer( { animation: { type: 'animation' } } );

			// Act.
			const result = new LoadAnimationAssets().getConditions( {
				container,
				settings: { animation: 'fadeIn' },
			} );

			// Assert.
			expect( result ).toBe( true );
		} );

		it( 'Should return true for hover_animation control type', () => {
			// Arrange.
			const container = createContainer( { hover_animation: { type: 'hover_animation' } } );

			// Act.
			const result = new LoadAnimationAssets().getConditions( {
				container,
				settings: { hover_animation: 'pulse' },
			} );

			// Assert.
			expect( result ).toBe( true );
		} );

		it( 'Should return true for exit_animation control type', () => {
			// Arrange.
			const container = createContainer( { exit_animation: { type: 'exit_animation' } } );

			// Act.
			const result = new LoadAnimationAssets().getConditions( {
				container,
				settings: { exit_animation: 'fadeOut' },
			} );

			// Assert.
			expect( result ).toBe( true );
		} );

		it( 'Should return false when the control type is not an animation type', () => {
			// Arrange.
			const container = createContainer( { color: { type: 'color' } } );

			// Act.
			const result = new LoadAnimationAssets().getConditions( {
				container,
				settings: { color: '#fff' },
			} );

			// Assert.
			expect( result ).toBe( false );
		} );

		it( 'Should return false when settings is empty', () => {
			// Arrange.
			const container = createContainer( { animation: { type: 'animation' } } );

			// Act.
			const result = new LoadAnimationAssets().getConditions( {
				container,
				settings: {},
			} );

			// Assert.
			expect( result ).toBe( false );
		} );
	} );

	describe( 'apply()', () => {
		it( 'Should enqueue the correct stylesheet URL for an animation control', () => {
			// Arrange.
			const enqueue = jest.fn();
			setupPreviewWindow( { isScriptDebug: false, enqueue } );

			const container = createContainer( { animation: { type: 'animation' } } );

			// Act.
			new LoadAnimationAssets().apply( {
				container,
				settings: { animation: 'fadeIn' },
			} );

			// Assert.
			expect( enqueue ).toHaveBeenCalledWith(
				'https://example.com/assets/lib/animations/styles/fadeIn.min.css',
				{ id: 'e-animation-fadeIn-css' },
			);
		} );

		it( 'Should enqueue an unminified URL when isScriptDebug is true', () => {
			// Arrange.
			const enqueue = jest.fn();
			setupPreviewWindow( { isScriptDebug: true, enqueue } );

			const container = createContainer( { animation: { type: 'animation' } } );

			// Act.
			new LoadAnimationAssets().apply( {
				container,
				settings: { animation: 'fadeIn' },
			} );

			// Assert.
			expect( enqueue ).toHaveBeenCalledWith(
				'https://example.com/assets/lib/animations/styles/fadeIn.css',
				{ id: 'e-animation-fadeIn-css' },
			);
		} );

		it( 'Should use the e-animation- prefix for hover_animation controls', () => {
			// Arrange.
			const enqueue = jest.fn();
			setupPreviewWindow( { isScriptDebug: false, enqueue } );

			const container = createContainer( { hover_animation: { type: 'hover_animation' } } );

			// Act.
			new LoadAnimationAssets().apply( {
				container,
				settings: { hover_animation: 'pulse' },
			} );

			// Assert.
			expect( enqueue ).toHaveBeenCalledWith(
				'https://example.com/assets/lib/animations/styles/e-animation-pulse.min.css',
				{ id: 'e-animation-pulse-css' },
			);
		} );

		it( 'Should not enqueue when value is empty', () => {
			// Arrange.
			const enqueue = jest.fn();
			setupPreviewWindow( { isScriptDebug: false, enqueue } );

			const container = createContainer( { animation: { type: 'animation' } } );

			// Act.
			new LoadAnimationAssets().apply( {
				container,
				settings: { animation: '' },
			} );

			// Assert.
			expect( enqueue ).not.toHaveBeenCalled();
		} );
	} );
} );

function createContainer( controls ) {
	return { controls };
}

function setupPreviewWindow( { isScriptDebug, enqueue } ) {
	global.elementor = {
		$preview: [ {
			contentWindow: {
				elementorFrontend: {
					config: {
						urls: { assets: 'https://example.com/assets/' },
						environmentMode: { isScriptDebug },
					},
				},
			},
		} ],
		helpers: { enqueuePreviewStylesheet: enqueue },
	};
}
