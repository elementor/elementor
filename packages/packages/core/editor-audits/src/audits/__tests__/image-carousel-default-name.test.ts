import { audit } from '../image-carousel-default-name';
import { makeContext, makeWidget } from './fixtures';

describe( audit.id, () => {
	it( 'passes when the carousel has a meaningful accessible name', async () => {
		const tree = [ makeWidget( 'c1', 'image-carousel', { accessible_name: 'Our team photos' } ) ];
		expect( await audit.evaluate( makeContext( { tree } ) ) ).toEqual( { status: 'pass' } );
	} );

	it( 'fails when the carousel uses the default name', async () => {
		const tree = [ makeWidget( 'c1', 'image-carousel', { accessible_name: 'Image Carousel' } ) ];
		const result = await audit.evaluate( makeContext( { tree } ) );

		expect( result.status ).toBe( 'fail' );
	} );

	it( 'fails when no accessible name is set at all', async () => {
		const tree = [ makeWidget( 'c1', 'image-carousel', {} ) ];
		const result = await audit.evaluate( makeContext( { tree } ) );

		expect( result.status ).toBe( 'fail' );
	} );
} );
