import { setupMock, freeMock } from './mock/model';

describe( 'Widget', () => {
	let childModel,
		widget;

	beforeEach( async () => {
		childModel = await setupMock();

		widget = new ( await import( 'elementor-elements/models/section' ) ).default;
	} );

	afterEach( freeMock );

	test( 'isValidChild() -- Sanity', () => {
		// Act.
		const isValidChild = widget.isValidChild( childModel );

		// Assert.
		expect( isValidChild ).toBe( false );
	} );
} );
