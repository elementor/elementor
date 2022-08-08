import { setupMock, freeMock } from './mock/model';

describe( 'Column', () => {
	let childModel,
		column;

	beforeEach( async () => {
		childModel = await setupMock();

		column = new ( await import( 'elementor-elements/models/column' ) ).default;
	} );

	afterEach( freeMock );

	test( 'isValidChild() -- Sanity', () => {
		// Arrange.
		childModel.set( 'elType', 'widget' );

		// Act.
		const isValidChild = column.isValidChild( childModel );

		// Assert.
		expect( isValidChild ).toBe( true );
	} );

	test( 'isValidChild() -- Ensure inner section', () => {
		// Arrange.
		childModel.set( 'elType', 'section' );
		childModel.set( 'isInner', true );

		// Act.
		const isValidChild = column.isValidChild( childModel );

		// Assert.
		expect( isValidChild ).toBe( true );
	} );

	test( 'isValidChild() -- Ensure not valid child', () => {
		// Arrange.
		childModel.set( 'elType', 'section' );
		childModel.set( 'isInner', false );

		// Act.
		const isValidChild = column.isValidChild( childModel );

		// Assert.
		expect( isValidChild ).toBe( false );
	} );
} );
