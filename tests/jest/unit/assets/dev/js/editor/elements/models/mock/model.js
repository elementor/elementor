class Model {
	attributes = {};

	set( key, value ) {
		this.attributes[ key ] = value;
	}

	get( key ) {
		return this.attributes[ key ];
	}

	extend() {
		return MockBackbone.Model;
	}
}

/**
 * @return {Promise<Model>}
 */
export async function setupMock() {
	const MockBackbone = { Model };

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

	return new MockBackbone.Model;
}

export function freeMock() {
	delete global.Backbone;
	delete global.elementorModules;
	delete global._;

	jest.restoreAllMocks();
}
