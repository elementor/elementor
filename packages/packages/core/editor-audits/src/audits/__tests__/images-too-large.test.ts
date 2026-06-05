import { audit } from '../images-too-large';
import { makeContext, makeWidget } from './fixtures';

const ONE_MB = 1024 * 1024;
const SMALL_KB = 100 * 1024;

const imageSize = ( filesize_bytes: number ) => ( {
	width: 1,
	height: 1,
	filesize_bytes,
	mime: 'image/jpeg',
	src: '',
	alt: '',
} );

describe( audit.id, () => {
	it( 'is skipped when the page has no images', async () => {
		expect( await audit.evaluate( makeContext() ) ).toEqual( {
			status: 'skipped',
			reason: 'No images',
		} );
	} );

	it( 'passes when all images are under the threshold', async () => {
		const tree = [ makeWidget( 'i1', 'image', { image: { id: 1 } } ) ];
		const pageContext = { image_sizes: { 1: imageSize( SMALL_KB ) } };

		expect( await audit.evaluate( makeContext( { tree, pageContext } ) ) ).toEqual( { status: 'pass' } );
	} );

	it( 'fails when an image exceeds the threshold', async () => {
		const tree = [ makeWidget( 'i1', 'image', { image: { id: 1 } } ) ];
		const pageContext = { image_sizes: { 1: imageSize( ONE_MB ) } };
		const result = await audit.evaluate( makeContext( { tree, pageContext } ) );

		expect( result.status ).toBe( 'fail' );
	} );

	it( 'fails for image-carousel when any slide exceeds the threshold', async () => {
		const tree = [
			makeWidget( 'carousel', 'image-carousel', {
				carousel: [
					{ id: 10, url: 'http://example.test/a.jpg' },
					{ id: 11, url: 'http://example.test/b.jpg' },
				],
			} ),
		];
		const pageContext = {
			image_sizes: {
				10: imageSize( SMALL_KB ),
				11: imageSize( ONE_MB ),
			},
		};
		const result = await audit.evaluate( makeContext( { tree, pageContext } ) );

		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations ).toHaveLength( 1 );
			expect( result.violations[ 0 ].elementId ).toBe( 'carousel' );
		}
	} );
} );
