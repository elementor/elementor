import { freeMock, setupMock } from './mock/manager';

describe( 'ElementsManager', () => {
	let elementsManager;

	beforeAll( async () => elementsManager = await setupMock() );

	afterAll( freeMock );

	test( 'getElementType() -- Sanity', () => {
		// Act.
		const section = elementsManager.getElementType( 'section' );

		// Assert.
		expect( section.getType() ).toBe( 'section' );
	} );

	test( 'getElementType() -- Ensure widget', async () => {
		// Arrange.
		const WidgetBase = ( await import( 'elementor-elements/types/base/widget-base' ) ).default,
			WidgetTest = class extends WidgetBase {
				getType() {
					return 'widget';
				}

				getWidgetType() {
					return 'widget-test';
				}
			};

		elementsManager.registerElementType( new WidgetTest() );

		// Act.
		const widgetTest = elementsManager.getElementType( 'widget', 'widget-test' );

		// Assert.
		expect( widgetTest.getType() ).toBe( 'widget' );
		expect( widgetTest.getWidgetType() ).toBe( 'widget-test' );
	} );
} );

