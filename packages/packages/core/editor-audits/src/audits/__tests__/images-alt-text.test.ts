import { audit } from '../images-alt-text';
import { makeContext, makeWidget } from './fixtures';

describe( audit.id, () => {
	it( 'passes when every image has alt text', async () => {
		const tree = [ makeWidget( 'i1', 'image', { image: { id: 1, alt: 'Cat' } } ) ];
		expect( await audit.evaluate( makeContext( { tree } ) ) ).toEqual( { status: 'pass' } );
	} );

	it( 'fails when an image is missing alt text', async () => {
		const tree = [ makeWidget( 'i1', 'image', { image: { id: 1 } } ) ];
		const result = await audit.evaluate( makeContext( { tree } ) );

		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations[ 0 ].elementId ).toBe( 'i1' );
		}
	} );
} );
