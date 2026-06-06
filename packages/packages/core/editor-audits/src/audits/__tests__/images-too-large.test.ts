import { audit } from '../images-too-large';
import { makeContext, makeWidget } from './fixtures';

const ONE_MB = 1024 * 1024;
const SMALL_KB = 100 * 1024;

const imageSize = ( filesizeBytes: number ) => ( {
	width: 1,
	height: 1,
	filesize_bytes: filesizeBytes,
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

		if ( result.status === 'fail' ) {
			expect( result.metadata?.oversizedImageCount ).toBe( 1 );
			expect( result.violations[ 0 ].externalUrl ).toBe(
				'https://example.com/wp-admin/plugin-install.php?tab=plugin-information&plugin=image-optimization'
			);
		}
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
			expect( result.metadata?.oversizedImageCount ).toBe( 1 );
		}
	} );

	it( 'counts oversized images across multiple widgets', async () => {
		const tree = [
			makeWidget( 'i1', 'image', { image: { id: 1 } } ),
			makeWidget( 'i2', 'image', { image: { id: 2 } } ),
			makeWidget( 'carousel', 'image-carousel', {
				carousel: [
					{ id: 10, url: 'http://example.test/a.jpg' },
					{ id: 11, url: 'http://example.test/b.jpg' },
				],
			} ),
		];
		const pageContext = {
			image_sizes: {
				1: imageSize( ONE_MB ),
				2: imageSize( ONE_MB ),
				10: imageSize( ONE_MB ),
				11: imageSize( ONE_MB ),
			},
		};
		const result = await audit.evaluate( makeContext( { tree, pageContext } ) );

		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations ).toHaveLength( 3 );
			expect( result.metadata?.oversizedImageCount ).toBe( 4 );
		}
	} );
} );
