import { freeMock, setupMock } from './mock/manager';

describe( 'ElementsManager', () => {
	let elementsManager;

	beforeAll( async () => elementsManager = await setupMock() );

	afterAll( freeMock );

	test( 'getElementTypeClass() -- Sanity', () => {
		// Act.
		const section = elementsManager.getElementTypeClass( 'section' );

		// Assert.
		expect( section.getType() ).toBe( 'section' );
	} );

	test( 'registerElementType() -- Sanity', async () => {
		// Arrange.
		const WidgetBase = ( await import( 'elementor-elements/types/widget' ) ).default,
			WidgetTest = class extends WidgetBase {
				getType() {
					return 'widget-test';
				}
			};

		// Act.
		elementsManager.registerElementType( new WidgetTest() );

		const widgetTest = elementsManager.getElementTypeClass( 'widget-test' );

		// Assert.
		expect( widgetTest.getType() ).toBe( 'widget-test' );
	} );
} );

