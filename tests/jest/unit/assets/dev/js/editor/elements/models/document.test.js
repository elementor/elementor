import { setupMock, freeMock } from './mock/model';

describe( 'Document', () => {
	let childModel,
		document;

	beforeEach( async () => {
		childModel = await setupMock();

		document = new ( await import( 'elementor-elements/models/document' ) ).default;
	} );

	afterEach( freeMock );

	test( 'isValidChild() -- Sanity', () => {
		// Arrange.
		childModel.set( 'elType', 'container' );

		// Act.
		const isValidChild = document.isValidChild( childModel );

		// Assert.
		expect( isValidChild ).toBe( true );
	} );

	test( 'isValidChild() -- Ensure not valid child', () => {
		// Arrange.
		childModel.set( 'elType', 'widget' );

		// Act.
		const isValidChild = document.isValidChild( childModel );

		// Assert.
		expect( isValidChild ).toBe( false );
	} );
} );
