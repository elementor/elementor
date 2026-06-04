import { audit } from '../too-many-widgets';
import { makeContext, makeWidget } from './fixtures';

const makeWidgets = ( count: number ) => Array.from( { length: count }, ( _, i ) => makeWidget( `w${ i }`, 'text' ) );

describe( audit.id, () => {
	it( 'passes with an empty tree', async () => {
		expect( await audit.evaluate( makeContext() ) ).toEqual( { status: 'pass' } );
	} );

	it( 'passes at exactly 100 widgets', async () => {
		const tree = makeWidgets( 100 );

		expect( await audit.evaluate( makeContext( { tree } ) ) ).toEqual( { status: 'pass' } );
	} );

	it( 'fails with 101 widgets', async () => {
		const tree = makeWidgets( 101 );
		const result = await audit.evaluate( makeContext( { tree } ) );

		expect( result.status ).toBe( 'fail' );
	} );
} );
