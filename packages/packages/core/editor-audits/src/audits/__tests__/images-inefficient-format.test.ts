import { getElementStyles } from '@elementor/editor-elements';

import { audit } from '../images-inefficient-format';
import { makeContainer, makeContext, makeWidget } from './fixtures';

jest.mock( '@elementor/editor-elements', () => ( {
	getElementStyles: jest.fn(),
} ) );

const getElementStylesMock = jest.mocked( getElementStyles );

const imageSize = ( mime: string ) => ( {
	width: 1,
	height: 1,
	filesize_bytes: 1,
	mime,
	src: '',
	alt: '',
} );

const atomicImageProp = ( id: number, size = 'full' ) => ( {
	$$type: 'image',
	value: {
		src: {
			$$type: 'image-src',
			value: { id: { $$type: 'image-attachment-id', value: id }, url: null },
		},
		size: { $$type: 'string', value: size },
	},
} );

describe( audit.id, () => {
	beforeEach( () => {
		getElementStylesMock.mockReturnValue( null );
	} );

	it( 'is skipped when the page has no images', async () => {
		expect( await audit.evaluate( makeContext() ) ).toEqual( {
			status: 'skipped',
			reason: 'No images',
		} );
	} );

	it.each( [ 'image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff' ] )(
		'fails when an image is served as %s',
		async ( mime ) => {
			const tree = [ makeWidget( 'i1', 'image', { image: { id: 1 } } ) ];
			const pageContext = { image_sizes: { '1:full': imageSize( mime ) } };
			const result = await audit.evaluate( makeContext( { tree, pageContext } ) );

			expect( result.status ).toBe( 'fail' );

			if ( result.status === 'fail' ) {
				expect( result.metadata?.inefficientImageFormatCount ).toBe( 1 );
				expect( result.violations[ 0 ].elementId ).toBe( 'i1' );
				expect( result.violations[ 0 ].externalUrl ).toBe(
					'https://example.com/wp-admin/plugin-install.php?tab=plugin-information&plugin=image-optimization'
				);
			}
		}
	);

	it.each( [ 'image/webp', 'image/avif' ] )( 'passes when an image is already served as %s', async ( mime ) => {
		const tree = [ makeWidget( 'i1', 'image', { image: { id: 1 } } ) ];
		const pageContext = { image_sizes: { '1:full': imageSize( mime ) } };

		expect( await audit.evaluate( makeContext( { tree, pageContext } ) ) ).toEqual( { status: 'pass' } );
	} );

	it( 'passes and excludes svg images from the raster-format check', async () => {
		const tree = [ makeWidget( 'i1', 'image', { image: { id: 1 } } ) ];
		const pageContext = { image_sizes: { '1:full': imageSize( 'image/svg+xml' ) } };

		expect( await audit.evaluate( makeContext( { tree, pageContext } ) ) ).toEqual( { status: 'pass' } );
	} );

	it( 'fails for image-carousel when any slide is a legacy raster format', async () => {
		const tree = [
			makeWidget( 'carousel', 'image-carousel', {
				carousel: [
					{ id: 10, url: 'http://example.test/a.webp' },
					{ id: 11, url: 'http://example.test/b.jpg' },
				],
			} ),
		];
		const pageContext = {
			image_sizes: {
				'10:full': imageSize( 'image/webp' ),
				'11:full': imageSize( 'image/jpeg' ),
			},
		};
		const result = await audit.evaluate( makeContext( { tree, pageContext } ) );

		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations ).toHaveLength( 1 );
			expect( result.violations[ 0 ].elementId ).toBe( 'carousel' );
			expect( result.metadata?.inefficientImageFormatCount ).toBe( 1 );
		}
	} );

	it( 'counts inefficient-format images across multiple widgets', async () => {
		const tree = [
			makeWidget( 'i1', 'image', { image: { id: 1 } } ),
			makeWidget( 'i2', 'image', { image: { id: 2 } } ),
			makeWidget( 'carousel', 'image-carousel', {
				carousel: [
					{ id: 10, url: 'http://example.test/a.jpg' },
					{ id: 11, url: 'http://example.test/b.png' },
				],
			} ),
		];
		const pageContext = {
			image_sizes: {
				'1:full': imageSize( 'image/jpeg' ),
				'2:full': imageSize( 'image/png' ),
				'10:full': imageSize( 'image/jpeg' ),
				'11:full': imageSize( 'image/png' ),
			},
		};
		const result = await audit.evaluate( makeContext( { tree, pageContext } ) );

		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations ).toHaveLength( 3 );
			expect( result.metadata?.inefficientImageFormatCount ).toBe( 4 );
		}
	} );

	it( 'fails when a container background_image is a legacy raster format', async () => {
		const tree = [ makeContainer( 'container', { background_image: { id: 1 } } ) ];
		const pageContext = { image_sizes: { '1:full': imageSize( 'image/png' ) } };
		const result = await audit.evaluate( makeContext( { tree, pageContext } ) );

		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations ).toHaveLength( 1 );
			expect( result.violations[ 0 ].elementId ).toBe( 'container' );
			expect( result.metadata?.inefficientImageFormatCount ).toBe( 1 );
		}
	} );

	it( 'fails when a container background_overlay_image is a legacy raster format', async () => {
		const tree = [ makeContainer( 'container', { background_overlay_image: { id: 2 } } ) ];
		const pageContext = { image_sizes: { '2:full': imageSize( 'image/gif' ) } };
		const result = await audit.evaluate( makeContext( { tree, pageContext } ) );

		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations ).toHaveLength( 1 );
			expect( result.violations[ 0 ].elementId ).toBe( 'container' );
		}
	} );

	it( 'fails when a widget _background_image is a legacy raster format', async () => {
		const tree = [ makeWidget( 'heading', 'heading', { title: 'Hello', _background_image: { id: 3 } } ) ];
		const pageContext = { image_sizes: { '3:full': imageSize( 'image/bmp' ) } };
		const result = await audit.evaluate( makeContext( { tree, pageContext } ) );

		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations ).toHaveLength( 1 );
			expect( result.violations[ 0 ].elementId ).toBe( 'heading' );
		}
	} );

	it( 'collapses background_image and background_overlay_image on the same container into one violation', async () => {
		const tree = [
			makeContainer( 'container', {
				background_image: { id: 4 },
				background_overlay_image: { id: 5 },
			} ),
		];
		const pageContext = {
			image_sizes: {
				'4:full': imageSize( 'image/jpeg' ),
				'5:full': imageSize( 'image/tiff' ),
			},
		};
		const result = await audit.evaluate( makeContext( { tree, pageContext } ) );

		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations ).toHaveLength( 1 );
			expect( result.metadata?.inefficientImageFormatCount ).toBe( 2 );
		}
	} );

	it( 'passes when a background image is already in a modern format', async () => {
		const tree = [ makeContainer( 'container', { background_image: { id: 6 } } ) ];
		const pageContext = { image_sizes: { '6:full': imageSize( 'image/webp' ) } };

		expect( await audit.evaluate( makeContext( { tree, pageContext } ) ) ).toEqual( { status: 'pass' } );
	} );

	it( 'resolves the correct size when the same attachment is used at two different sizes', async () => {
		const tree = [
			makeWidget( 'small', 'image', { image: { id: 7 }, image_size: 'thumbnail' } ),
			makeWidget( 'large', 'image', { image: { id: 7 }, image_size: 'full' } ),
		];
		const pageContext = {
			image_sizes: {
				'7:thumbnail': imageSize( 'image/webp' ),
				'7:full': imageSize( 'image/jpeg' ),
			},
		};
		const result = await audit.evaluate( makeContext( { tree, pageContext } ) );

		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations ).toHaveLength( 1 );
			expect( result.violations[ 0 ].elementId ).toBe( 'large' );
		}
	} );

	it( 'fails when an atomic widget image prop is a legacy raster format', async () => {
		const tree = [ makeWidget( 'e-image', 'e-image', { image: atomicImageProp( 8, 'medium' ) } ) ];
		const pageContext = { image_sizes: { '8:medium': imageSize( 'image/jpeg' ) } };
		const result = await audit.evaluate( makeContext( { tree, pageContext } ) );

		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations ).toHaveLength( 1 );
			expect( result.violations[ 0 ].elementId ).toBe( 'e-image' );
		}
	} );

	it( 'fails when an atomic widget poster prop is a legacy raster format', async () => {
		const tree = [ makeWidget( 'video', 'e-self-hosted-video', { poster: atomicImageProp( 9 ) } ) ];
		const pageContext = { image_sizes: { '9:full': imageSize( 'image/png' ) } };
		const result = await audit.evaluate( makeContext( { tree, pageContext } ) );

		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations ).toHaveLength( 1 );
			expect( result.violations[ 0 ].elementId ).toBe( 'video' );
		}
	} );

	it( 'fails when an atomic style background-image-overlay layer is a legacy raster format', async () => {
		const tree = [ makeWidget( 'e-div-block', 'e-div-block', {} ) ];

		getElementStylesMock.mockImplementation( ( elementId ) =>
			elementId === 'e-div-block'
				? {
						local: {
							id: 'local',
							label: 'local',
							type: 'class',
							variants: [
								{
									meta: { breakpoint: null, state: null },
									custom_css: null,
									props: {
										background: {
											$$type: 'background',
											value: {
												color: null,
												clip: null,
												'background-overlay': {
													$$type: 'background-overlay',
													value: [
														{
															$$type: 'background-image-overlay',
															value: { image: atomicImageProp( 12 ) },
														},
													],
												},
											},
										},
									},
								},
							],
						},
				  }
				: null
		);

		const pageContext = { image_sizes: { '12:full': imageSize( 'image/jpeg' ) } };
		const result = await audit.evaluate( makeContext( { tree, pageContext } ) );

		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations ).toHaveLength( 1 );
			expect( result.violations[ 0 ].elementId ).toBe( 'e-div-block' );
		}
	} );
} );
