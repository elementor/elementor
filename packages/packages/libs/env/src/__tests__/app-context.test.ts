import { AppContext } from '../app-context/app-context';

describe( '@elementor/app-content', () => {
	it( 'should provide then require', async () => {
		const testKey = Symbol();
		const stub = 'ho';
		AppContext.provide( testKey, stub );
		expect( await AppContext.require( testKey ) ).toStrictEqual( stub );
	} );
	it( 'should require then provide', ( done ) => {
		const testKey = Symbol();
		const stub = 'hi';
		AppContext.require( testKey ).then( ( value ) => {
			expect( value ).toStrictEqual( stub );
			done();
		} );
		AppContext.provide( testKey, stub );
	} );
} );
