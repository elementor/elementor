import store from 'elementor/modules/kit-elements-defaults/assets/js/editor/store';

jest.mock( 'elementor/modules/kit-elements-defaults/assets/js/editor/store', () => ( {
	__esModule: true,
	default: {
		get: jest.fn(),
	},
} ) );

describe( '$e.run("preview/drop") - Hook: FillDefaultsOnDrop', () => {
	let CommandHook;

	beforeEach( async () => {
		global.$e = {
			modules: {
				hookData: {
					Dependency: class {},
				},
			},
		};

		// Need to import dynamically since the hook extends a global variable which isn't available in regular import.
		CommandHook = ( await import( 'elementor/modules/kit-elements-defaults/assets/js/editor/hooks' ) ).FillDefaultsOnDrop;
	} );

	afterEach( () => {
		delete global.$e;
		jest.resetAllMocks();
	} );

	it( 'should fill defaults for widget', () => {
		// Arrange
		const hook = new CommandHook();

		const args = {
			test: 'test',
			model: {
				elType: 'widget',
				widgetType: 'button',
				settings: {
					test_setting: 'test',
					__globals__: {
						test_global_setting: 'test',
					},
				},
			},
		};

		store.get.mockReturnValue( {
			text_shadow_text_shadow: { horizontal: 0, vertical: 0, blur: 0, color: 'rgba(0,0,0,0.3)' },
			border_border: 'solid',
			border_color: '#FF0000',
			text: 'Click me',
			__globals__: {
				button_text_color: 'globals/colors?id=9182bce',
				background_color: 'globals/colors?id=secondary',
			},
		} );

		// Act
		hook.apply( args );

		// Assert
		expect( args ).toEqual( {
			test: 'test',
			model: {
				elType: 'widget',
				widgetType: 'button',
				settings: {
					test_setting: 'test',
					text_shadow_text_shadow: { horizontal: 0, vertical: 0, blur: 0, color: 'rgba(0,0,0,0.3)' },
					border_border: 'solid',
					border_color: '#FF0000',
					text: 'Click me',
					__globals__: {
						test_global_setting: 'test',
						button_text_color: 'globals/colors?id=9182bce',
						background_color: 'globals/colors?id=secondary',
					},
				},
			},
		} );
	} );
} );
