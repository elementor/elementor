import { fontFamilyTransformer } from '../font-family-transformer';

function run( value: string | null ) {
	return fontFamilyTransformer( value, { key: 'font-family', signal: undefined } );
}

describe( 'fontFamilyTransformer', () => {
	it( 'wraps font names in quotes', () => {
		expect( run( ' Open Sans ' ) ).toBe( '"Open Sans"' );
		expect( run( 'Arial' ) ).toBe( '"Arial"' );
	} );

	it( 'does not quote css variables', () => {
		expect( run( 'var(--primary-font)' ) ).toBe( 'var(--primary-font)' );
	} );

	it( 'passes through already quoted values', () => {
		expect( run( '"Open Sans"' ) ).toBe( '"Open Sans"' );
	} );

	it( 'returns null for non-string values', () => {
		expect( run( null ) ).toBeNull();
	} );
} );
