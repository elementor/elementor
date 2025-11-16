import { generateUniqueId } from '../generate-unique-id';

describe( 'generateUniqueId', () => {
	const ID_LENGTH = 21;

	it( 'should generate a unique ID with prefix', () => {
		// Arrange.
		const prefix = 'test';

		// Act.
		const id = generateUniqueId( prefix );

		// Assert.
		expect( typeof id ).toBe( 'string' );
		expect( id.length ).toBe( `${ prefix }-`.length + ID_LENGTH );

		const regex = new RegExp( `^${ prefix }-\\d+-[a-z0-9]{7}$` );
		expect( id ).toMatch( regex );
	} );

	it( 'should generate a unique ID without prefix', () => {
		// Arrange & Act.
		const id = generateUniqueId();

		// Assert.
		expect( typeof id ).toBe( 'string' );
		expect( id.length ).toBe( ID_LENGTH );

		const regex = new RegExp( `^\\d+-[a-z0-9]{7}$` );
		expect( id ).toMatch( regex );
	} );

	it( 'should generate different IDs on subsequent calls', () => {
		// Arrange.
		const prefix = 'test';

		// Act.
		const id1 = generateUniqueId( prefix );
		const id2 = generateUniqueId( prefix );

		// Assert.
		expect( id1 ).not.toBe( id2 );
	} );
} );
