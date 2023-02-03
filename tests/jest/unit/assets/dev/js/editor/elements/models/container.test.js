import { setupMock, freeMock } from './mock/model';

describe( 'Container', () => {
	let childModel,
		container;

	beforeEach( async () => {
		childModel = await setupMock();

		container = new ( await import( 'elementor-elements/models/container' ) ).default;
	} );

	afterEach( freeMock );

	test( 'isValidChild() -- Sanity', () => {
		// Arrange.
		childModel.set( 'elType', 'container' );

		// Act.
		const isValidChild = container.isValidChild( childModel );

		// Assert.
		expect( isValidChild ).toBe( true );
	} );

	test( 'isValidChild() -- Ensure not valid child', () => {
		// Arrange.
		childModel.set( 'elType', 'section' );

		// Act.
		const isValidChild = container.isValidChild( childModel );

		// Assert.
		expect( isValidChild ).toBe( false );
	} );
} );
