import { setupMock, freeMock } from './mock/model';

describe( 'Section', () => {
	let childModel,
		section;

	beforeEach( async () => {
		childModel = await setupMock();

		section = new ( await import( 'elementor-elements/models/section' ) ).default;
	} );

	afterEach( freeMock );

	test( 'isValidChild() -- Sanity', () => {
		// Arrange.
		childModel.set( 'elType', 'column' );

		// Act.
		const isValidChild = section.isValidChild( childModel );

		// Assert.
		expect( isValidChild ).toBe( true );
	} );

	test( 'isValidChild() -- Ensure not valid child', () => {
		// Arrange.
		childModel.set( 'elType', 'widget' );

		// Act.
		const isValidChild = section.isValidChild( childModel );

		// Assert.
		expect( isValidChild ).toBe( false );
	} );
} );
