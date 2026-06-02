import { fontFamilyTransformer } from '../font-family-transformer';

function run( val: string | null ) {
	return fontFamilyTransformer( val, { key: 'font-family', signal: undefined } );
}

describe( 'fontFamilyTransformer', () => {
	it( 'wraps a multi-word font name in quotes', () => {
		expect( run( 'Open Sans' ) ).toBe( '"Open Sans"' );
	} );

	it( 'wraps a single-word font name in quotes', () => {
		expect( run( 'Arial' ) ).toBe( '"Arial"' );
	} );

	it( 'returns null for null input', () => {
		expect( run( null ) ).toBeNull();
	} );
} );
