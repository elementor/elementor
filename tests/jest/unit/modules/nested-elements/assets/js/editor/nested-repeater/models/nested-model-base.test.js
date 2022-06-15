import { freeMock, setupMock } from 'elementor/tests/jest/unit/assets/dev/js/editor/elements/models/mock/model';

describe( 'NestedModelBase', () => {
	let childModel,
		nestedModelBase;

	beforeEach( async () => {
		childModel = await setupMock();

		global.elementor = {
			modules: {
				elements: {
					models: {
						Element: class extends global.Backbone.Model {},
					},
				},
			},
		};

		global.$e = {
			components: {
				get: () => {
					return {
						isWidgetSupportNesting: ( name ) => 'tabs-v2' === name,
					};
				},
			},
		};

		nestedModelBase = new ( await import( 'elementor/modules/nested-elements/assets/js/editor/nested-repeater/models/nested-model-base' ) ).default;
	} );

	afterEach( () => {
		delete global.elementor;
		delete global.$e;

		freeMock();
	} );

	test( 'isValidChild() -- Sanity', () => {
		// Arrange.
		childModel.set( 'elType', 'container' );

		nestedModelBase.set( 'elType', 'widget' );
		nestedModelBase.set( 'widgetType', 'tabs-v2' );

		// Act.
		const isValidChild = nestedModelBase.isValidChild( childModel );

		// Assert.
		expect( isValidChild ).toBe( true );
	} );

	test( 'isValidChild() -- Ensure not valid child', () => {
		// Arrange.
		childModel.set( 'elType', 'container' );

		nestedModelBase.set( 'elType', 'widget' );
		nestedModelBase.set( 'widgetType', 'accordion' );

		// Act.
		const isValidChild = nestedModelBase.isValidChild( childModel );

		// Assert.
		expect( isValidChild ).toBe( false );
	} );
} );
