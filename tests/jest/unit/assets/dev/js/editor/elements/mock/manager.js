/**
 * @typedef {import('elementor/assets/dev/js/editor/elements/manager')} ElementsManager
 */

/**
 * @return {Promise<ElementsManager>}
 */
export async function setupMock() {
	const MockBackbone = {
		Model: class {
			extend() {
				return MockBackbone.Model;
			}
		},
	};

	global.Backbone = {
		Model: MockBackbone.Model,
	};

	global.elementorModules = {
		editor: {
			elements: {
				models: {
					get BaseSettings() {
						return {
							extend: jest.fn( () => {
								return {
									get: MockBackbone.Model,
								};
							} ),
						};
					},
				},
			},
		},

		ViewModule: {
			extend: () => class {},
		},

		Module: {
			extend: () => class {},
		},
	};

	jest.mock( 'elementor-elements/models/base-element-model', () => {
		return class {
			static extend() {
				return MockBackbone.Model;
			}
		};
	} );

	global._ = {
		noop: () => {},
	};

	global.Marionette = {
		ItemView: class {
			static extend() {
				return class {};
			}
		},
		CompositeView: {
			extend: () => class {},
		},
		CollectionView: class {},
		TemplateCache: {
			get: () => '',
		},
		Behavior: class {},
	};

	global.elementorCommon = {
		config: {
			experimentalFeatures: {
				container: false,
			},
		},
	};

	if ( ! global.window ) {
		global.window = {};
	}

	global.jQuery = {};

	jest.mock( 'elementor-views/base-container', () => {
		return {
			extend: () => class {},
		};
	} );

	jest.mock( 'elementor-elements/views/base', () => {
		return class {
			static extend() {
				return class {};
			}
		};
	} );

	jest.mock( 'elementor-elements/views/container/empty-component', () => {} );

	return new ( await import( 'elementor-elements/manager' ) ).default;
}

export function freeMock() {
	delete global.Backbone;
	delete global.elementorModules;
	delete global._;
	delete global.Marionette;
	delete global.elementorCommon;
	delete global.navigator;
	delete global.window;
	delete global.jQuery;

	jest.restoreAllMocks();
}
