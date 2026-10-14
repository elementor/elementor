import { isRtl } from '../direction';

describe( 'direction', () => {
	afterEach( () => {
		document.documentElement.removeAttribute( 'dir' );
	} );

	it( 'returns true when document dir is rtl', () => {
		// Arrange.
		document.documentElement.dir = 'rtl';

		// Act & Assert.
		expect( isRtl() ).toBe( true );
	} );

	it( 'returns false when document dir is ltr', () => {
		// Arrange.
		document.documentElement.dir = 'ltr';

		// Act & Assert.
		expect( isRtl() ).toBe( false );
	} );
} );
