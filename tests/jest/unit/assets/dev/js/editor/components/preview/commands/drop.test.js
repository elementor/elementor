import { freeMock, setupMock } from 'elementor/tests/jest/unit/modules/web-cli/assets/js/core/mock/api';

let MockContainerClass;

describe( `$e.run( 'preview/drop' )`, () => {
	beforeAll( async () => {
		await setupMock();

		MockContainerClass = ( ( await import( 'elementor/assets/dev/js/editor/container/container' ) ).default );

		global.elementorModules = {
			editor: {
				Container: MockContainerClass,
			},
		};

		const MockBackbone = {
			Model: class {
				extend() {
					return MockBackbone.Model;
				}

				get() {
					return {};
				}
			},
		};

		global.Backbone = {
			Model: MockBackbone.Model,
		};

		global.elementor = {
			documents: {
				getCurrent: () => new class Document {},
			},
		};
	} );

	afterAll( async () => {
		await freeMock();

		delete global.elementorCommon;
		delete global.elementorModules;
		delete global.Backbone;
		delete global.elementor;
	} );

	test( 'apply() -- Sanity', async () => {
		// Arrange -- Import 'preview' component.
		const Component = ( await import( 'elementor/assets/dev/js/editor/components/preview/component' ) ).default,
			container = new MockContainerClass( {
				id: 'document',
				type: 'document',
				settings: new Backbone.Model( {} ),
				model: new Backbone.Model( {} ),
				parent: false,
				view: {
					createElementFromModel: jest.fn( () => {
						return {
							fakeModel: 'true',
						};
					} ),
					on: jest.fn(),
				},
			} );

		$e.components.register( new Component() );

		const model = {
				elType: 'widget',
				widgetType: 'text-editor',
			},
			args = {
				container,
				model,
			},
			result = $e.run( 'preview/drop', args );

		// Assert.
		expect( result ).toEqual( {
			fakeModel: 'true',
		} );
		expect( container.view.createElementFromModel ).toHaveBeenCalledWith( {
			elType: 'widget',
			widgetType: 'text-editor',
		}, {} );
	} );
} );

