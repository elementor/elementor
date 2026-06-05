import { audit } from '../images-alt-text';
import { makeContext, makeWidget } from './fixtures';

const imageSizeWithAlt = ( id: number, alt: string ) => ( {
	width: 1,
	height: 1,
	filesize_bytes: 1000,
	mime: 'image/jpeg',
	src: '',
	alt,
} );

describe( audit.id, () => {
	it( 'is skipped when the page has no images', async () => {
		expect( await audit.evaluate( makeContext() ) ).toEqual( {
			status: 'skipped',
			reason: 'No images',
		} );
	} );

	it( 'passes when every image has alt text from page context', async () => {
		const tree = [ makeWidget( 'i1', 'image', { image: { id: 1 } } ) ];
		const pageContext = { image_sizes: { 1: imageSizeWithAlt( 1, 'Cat' ) } };
		expect( await audit.evaluate( makeContext( { tree, pageContext } ) ) ).toEqual( { status: 'pass' } );
	} );

	it( 'fails when an image is missing alt text', async () => {
		const tree = [ makeWidget( 'i1', 'image', { image: { id: 1 } } ) ];
		const pageContext = { image_sizes: { 1: imageSizeWithAlt( 1, '' ) } };
		const result = await audit.evaluate( makeContext( { tree, pageContext } ) );

		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations[ 0 ].elementId ).toBe( 'i1' );
		}
	} );

	it( 'passes for image-box when attachment has alt', async () => {
		const tree = [ makeWidget( 'box', 'image-box', { image: { id: 2 } } ) ];
		const pageContext = { image_sizes: { 2: imageSizeWithAlt( 2, 'Box image' ) } };
		expect( await audit.evaluate( makeContext( { tree, pageContext } ) ) ).toEqual( { status: 'pass' } );
	} );

	it( 'fails for image-carousel when any slide lacks alt', async () => {
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
				10: imageSizeWithAlt( 10, 'Slide one' ),
				11: imageSizeWithAlt( 11, '' ),
			},
		};
		const result = await audit.evaluate( makeContext( { tree, pageContext } ) );

		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations ).toHaveLength( 1 );
			expect( result.violations[ 0 ].elementId ).toBe( 'carousel' );
		}
	} );

	it( 'uses snapshot alt for URL-only images', async () => {
		const tree = [ makeWidget( 'ext', 'image', { image: { url: 'http://example.test/x.jpg', alt: 'External' } } ) ];
		expect( await audit.evaluate( makeContext( { tree } ) ) ).toEqual( { status: 'pass' } );
	} );
} );
