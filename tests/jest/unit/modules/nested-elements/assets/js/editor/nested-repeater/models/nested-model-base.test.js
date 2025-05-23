import { freeMock, setupMock } from 'elementor/tests/jest/unit/assets/dev/js/editor/elements/models/mock/model';

jest.mock( 'elementor/modules/nested-elements/assets/js/editor/utils', () => ( {
	...jest.requireActual( 'elementor/modules/nested-elements/assets/js/editor/utils' ),
	isWidgetSupportNesting: ( name ) => 'nested-tabs' === name,
} ) );

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
		childModel.set( 'isLocked', true );

		nestedModelBase.set( 'elType', 'widget' );
		nestedModelBase.set( 'widgetType', 'nested-tabs' );

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
