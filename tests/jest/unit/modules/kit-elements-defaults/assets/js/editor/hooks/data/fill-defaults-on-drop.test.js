import { getElementDefaults } from 'elementor/modules/kit-elements-defaults/assets/js/editor/api';

jest.mock( 'elementor/modules/kit-elements-defaults/assets/js/editor/api', () => ( {
	__esModule: true,
	getElementDefaults: jest.fn(),
} ) );

describe( `$e.run('preview/drop') - Hook: FillDefaultsOnDrop`, () => {
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
					should_not_be_changed: 'test',
					__globals__: {
						test_global_setting: 'test',
						should_not_be_changed: 'test',
					},
				},
			},
		};

		getElementDefaults.mockReturnValue( {
			text_shadow_text_shadow: { horizontal: 0, vertical: 0, blur: 0, color: 'rgba(0,0,0,0.3)' },
			border_border: 'solid',
			border_color: '#FF0000',
			text: 'Click me',
			should_not_be_changed: 'invalid_value',
			__globals__: {
				button_text_color: 'globals/colors?id=9182bce',
				background_color: 'globals/colors?id=secondary',
				should_not_be_changed: 'invalid_value',
			},
			__dynamic__: {
				link: "[elementor-tag id=\"4f74e2e\" name=\"post-url'\" settings=\"%7B%7D\"]",
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
					should_not_be_changed: 'test',
					__globals__: {
						test_global_setting: 'test',
						button_text_color: 'globals/colors?id=9182bce',
						background_color: 'globals/colors?id=secondary',
						should_not_be_changed: 'test',
					},
					__dynamic__: {
						link: "[elementor-tag id=\"4f74e2e\" name=\"post-url'\" settings=\"%7B%7D\"]",
					},
				},
			},
		} );
	} );

	it.each( [
		{ elType: 'section', expectedType: 'section' },
		{ elType: 'widget', widgetType: 'button', expectedType: 'button' },
		{ elType: 'widget', widgetType: 'heading', expectedType: 'heading' },
		{ elType: 'section', widgetType: 'inner-section', expectedType: 'inner-section' },
		{ elType: 'section', isInner: true, expectedType: 'inner-section' },
	] )(
		'should support multiple types: elType: $elType, widgetType: $widgetType',
		( { elType, widgetType, isInner = false, expectedType } ) => {
			// Arrange
			const hook = new CommandHook();

			// Act
			hook.apply( {
				model: {
					elType,
					widgetType,
					isInner,
					settings: {},
				},
			} );

			// Assert
			expect( getElementDefaults ).toHaveBeenNthCalledWith( 1, expectedType );
		},
	);

	it( 'should do nothing if there are no defaults', () => {
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

		getElementDefaults.mockReturnValue( {} );

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
					__globals__: {
						test_global_setting: 'test',
					},
				},
			},
		} );
	} );
} );
