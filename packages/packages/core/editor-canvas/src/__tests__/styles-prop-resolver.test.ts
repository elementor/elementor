import { mockStylesSchema } from 'test-utils';
import { styleTransformersRegistry } from '@elementor/editor-canvas';
import {
	backdropFilterPropTypeUtil,
	backgroundColorOverlayPropTypeUtil,
	backgroundGradientOverlayPropTypeUtil,
	backgroundImageOverlayPropTypeUtil,
	backgroundImagePositionOffsetPropTypeUtil,
	backgroundImageSizeScalePropTypeUtil,
	backgroundOverlayPropTypeUtil,
	backgroundPropTypeUtil,
	borderRadiusPropTypeUtil,
	borderWidthPropTypeUtil,
	boxShadowPropTypeUtil,
	colorPropTypeUtil,
	colorStopPropTypeUtil,
	cssFilterFunctionPropUtil,
	dimensionsPropTypeUtil,
	filterPropTypeUtil,
	gradientColorStopPropTypeUtil,
	imageAttachmentIdPropType,
	imagePropTypeUtil,
	imageSrcPropTypeUtil,
	layoutDirectionPropTypeUtil,
	numberPropTypeUtil,
	type Props,
	shadowPropTypeUtil,
	sizePropTypeUtil,
	stringPropTypeUtil,
	strokePropTypeUtil,
} from '@elementor/editor-props';
import { getMediaAttachment } from '@elementor/wp-media';

import { initStyleTransformers } from '../init-style-transformers';
import { createPropsResolver } from '../renderers/create-props-resolver';
import { mockAttachmentData } from './mock-attachment-data';

jest.mock( '@elementor/wp-media' );
jest.mock( '../style-commands/init-style-commands' );
jest.mock( '../prevent-link-in-link-commands' );
jest.mock( '@elementor/editor-v1-adapters' );

type Payload = {
	name: string;
	prepare?: () => void;
	props: Props;
	expected: Record< string, unknown >;
};

const filters = filterPropTypeUtil.create( [
	cssFilterFunctionPropUtil.create( {
		func: stringPropTypeUtil.create( 'blur' ),
		args: sizePropTypeUtil.create( { size: 1, unit: 'px' } ),
	} ),
	cssFilterFunctionPropUtil.create( {
		func: stringPropTypeUtil.create( 'brightness' ),
		args: sizePropTypeUtil.create( { size: 90, unit: '%' } ),
	} ),
	cssFilterFunctionPropUtil.create( {
		func: stringPropTypeUtil.create( 'contrast' ),
		args: sizePropTypeUtil.create( { size: 50, unit: '%' } ),
	} ),
	cssFilterFunctionPropUtil.create( {
		func: stringPropTypeUtil.create( 'grayscale' ),
		args: sizePropTypeUtil.create( { size: 70, unit: '%' } ),
	} ),
	cssFilterFunctionPropUtil.create( {
		func: stringPropTypeUtil.create( 'invert' ),
		args: sizePropTypeUtil.create( { size: 60, unit: '%' } ),
	} ),
	cssFilterFunctionPropUtil.create( {
		func: stringPropTypeUtil.create( 'sepia' ),
		args: sizePropTypeUtil.create( { size: 30, unit: '%' } ),
	} ),
	cssFilterFunctionPropUtil.create( {
		func: stringPropTypeUtil.create( 'saturate' ),
		args: sizePropTypeUtil.create( { size: 25, unit: '%' } ),
	} ),
	cssFilterFunctionPropUtil.create( {
		func: stringPropTypeUtil.create( 'hue-rotate' ),
		args: sizePropTypeUtil.create( { size: 10, unit: 'deg' } ),
	} ),
] );

const backDropFilters = backdropFilterPropTypeUtil.create( [
	cssFilterFunctionPropUtil.create( {
		func: stringPropTypeUtil.create( 'blur' ),
		args: sizePropTypeUtil.create( { size: 2, unit: 'rem' } ),
	} ),
	cssFilterFunctionPropUtil.create( {
		func: stringPropTypeUtil.create( 'brightness' ),
		args: sizePropTypeUtil.create( { size: 80, unit: '%' } ),
	} ),
	cssFilterFunctionPropUtil.create( {
		func: stringPropTypeUtil.create( 'contrast' ),
		args: sizePropTypeUtil.create( { size: 50, unit: '%' } ),
	} ),
	cssFilterFunctionPropUtil.create( {
		func: stringPropTypeUtil.create( 'grayscale' ),
		args: sizePropTypeUtil.create( { size: 70, unit: '%' } ),
	} ),
	cssFilterFunctionPropUtil.create( {
		func: stringPropTypeUtil.create( 'invert' ),
		args: sizePropTypeUtil.create( { size: 60, unit: '%' } ),
	} ),
	cssFilterFunctionPropUtil.create( {
		func: stringPropTypeUtil.create( 'sepia' ),
		args: sizePropTypeUtil.create( { size: 30, unit: '%' } ),
	} ),
	cssFilterFunctionPropUtil.create( {
		func: stringPropTypeUtil.create( 'saturate' ),
		args: sizePropTypeUtil.create( { size: 25, unit: '%' } ),
	} ),
	cssFilterFunctionPropUtil.create( {
		func: stringPropTypeUtil.create( 'hue-rotate' ),
		args: sizePropTypeUtil.create( { size: 10, unit: 'deg' } ),
	} ),
] );

describe( 'styles prop resolver', () => {
	it.each< Payload >( [
		{
			name: 'text-stroke',
			props: {
				'text-stroke': strokePropTypeUtil.create( {
					width: sizePropTypeUtil.create( {
						size: 1,
						unit: 'px',
					} ),
					color: colorPropTypeUtil.create( '#000000' ),
				} ),
			},
			expected: {
				'-webkit-text-stroke': '1px #000000',
				stroke: '#000000',
				'stroke-width': '1px',
			},
		},
		{
			name: 'box-shadow',
			props: {
				'box-shadow': boxShadowPropTypeUtil.create( [
					shadowPropTypeUtil.create( {
						hOffset: sizePropTypeUtil.create( { size: 1, unit: 'px' } ),
						vOffset: sizePropTypeUtil.create( { size: 1, unit: 'px' } ),
						blur: sizePropTypeUtil.create( { size: 1, unit: 'px' } ),
						spread: sizePropTypeUtil.create( { size: 1, unit: 'px' } ),
						color: colorPropTypeUtil.create( '#000000' ),
					} ),
					shadowPropTypeUtil.create( {
						hOffset: sizePropTypeUtil.create( { size: 1, unit: 'px' } ),
						vOffset: sizePropTypeUtil.create( { size: 1, unit: 'px' } ),
						blur: sizePropTypeUtil.create( { size: 1, unit: 'px' } ),
						spread: sizePropTypeUtil.create( { size: 1, unit: 'px' } ),
						color: colorPropTypeUtil.create( '#000000' ),
						position: 'inset',
					} ),
				] ),
			},
			expected: {
				'box-shadow': '1px 1px 1px 1px #000000,1px 1px 1px 1px #000000 inset',
			},
		},
		{
			name: 'linked-dimensional',
			props: {
				margin: dimensionsPropTypeUtil.create( {
					'block-start': sizePropTypeUtil.create( {
						size: 10,
						unit: 'px',
					} ),
					'block-end': sizePropTypeUtil.create( {
						size: 20,
						unit: 'px',
					} ),
					'inline-start': sizePropTypeUtil.create( {
						size: 30,
						unit: 'px',
					} ),
					'inline-end': stringPropTypeUtil.create( 'auto' ),
				} ),
			},
			expected: {
				'margin-block-start': '10px',
				'margin-block-end': '20px',
				'margin-inline-start': '30px',
				'margin-inline-end': 'auto',
			},
		},
		{
			name: 'border-width',
			props: {
				'border-width': borderWidthPropTypeUtil.create( {
					'block-start': sizePropTypeUtil.create( { size: 10, unit: 'px' } ),
					'block-end': sizePropTypeUtil.create( { size: 20, unit: 'px' } ),
					'inline-start': sizePropTypeUtil.create( { size: 30, unit: 'px' } ),
					'inline-end': sizePropTypeUtil.create( { size: 40, unit: 'px' } ),
				} ),
			},
			expected: {
				'border-block-start-width': '10px',
				'border-block-end-width': '20px',
				'border-inline-start-width': '30px',
				'border-inline-end-width': '40px',
			},
		},
		{
			name: 'border-radius',
			props: {
				'border-radius': borderRadiusPropTypeUtil.create( {
					'start-start': sizePropTypeUtil.create( { size: 10, unit: 'px' } ),
					'start-end': sizePropTypeUtil.create( { size: 20, unit: 'px' } ),
					'end-start': sizePropTypeUtil.create( { size: 30, unit: 'px' } ),
					'end-end': sizePropTypeUtil.create( { size: 40, unit: 'px' } ),
				} ),
			},
			expected: {
				'border-start-start-radius': '10px',
				'border-start-end-radius': '20px',
				'border-end-start-radius': '30px',
				'border-end-end-radius': '40px',
			},
		},
		{
			name: 'gap',
			props: {
				gap: layoutDirectionPropTypeUtil.create( {
					row: sizePropTypeUtil.create( { size: 10, unit: 'px' } ),
					column: sizePropTypeUtil.create( { size: 20, unit: 'px' } ),
				} ),
			},
			expected: {
				'column-gap': '20px',
				'row-gap': '10px',
			},
		},
		{
			name: 'background (only color)',
			props: {
				background: backgroundPropTypeUtil.create( {
					color: colorPropTypeUtil.create( '#ee00ff' ),
				} ),
			},
			expected: {
				'background-color': '#ee00ff',
			},
		},
		{
			name: 'background (image url and default values)',
			props: {
				background: backgroundPropTypeUtil.create( {
					'background-overlay': backgroundOverlayPropTypeUtil.create( [
						backgroundImageOverlayPropTypeUtil.create( {
							image: imagePropTypeUtil.create( {
								src: imageSrcPropTypeUtil.create( {
									id: null,
									url: 'https://localhost.test/test-image.png',
								} ),
								size: null,
							} ),
						} ),
					] ),
				} ),
			},
			expected: {
				'background-image': 'url(https://localhost.test/test-image.png)',
				'background-repeat': 'repeat',
				'background-attachment': 'scroll',
				'background-size': 'auto auto',
				'background-position': '0% 0%',
			},
		},
		{
			name: 'background (full)',
			prepare: () => {
				jest.mocked( getMediaAttachment ).mockImplementation(
					( args ) => Promise.resolve( mockAttachmentData( args.id ) ) as never
				);
			},
			props: {
				background: backgroundPropTypeUtil.create( {
					color: colorPropTypeUtil.create( '#000' ),
					'background-overlay': backgroundOverlayPropTypeUtil.create( [
						backgroundColorOverlayPropTypeUtil.create( {
							color: colorPropTypeUtil.create( 'blue' ),
						} ),
						backgroundColorOverlayPropTypeUtil.create( {
							color: colorPropTypeUtil.create( 'red', {
								disabled: true, // this should not be rendered due to disabled: true
							} ),
						} ),
						backgroundColorOverlayPropTypeUtil.create( {
							color: colorPropTypeUtil.create( 'yellow' ),
						} ),
						backgroundImageOverlayPropTypeUtil.create( {
							image: imagePropTypeUtil.create( {
								src: imageSrcPropTypeUtil.create( {
									id: imageAttachmentIdPropType.create( 123 ),
									url: null,
								} ),
								size: 'thumbnail',
							} ),
							size: backgroundImageSizeScalePropTypeUtil.create( {
								width: sizePropTypeUtil.create( {
									size: 1400,
									unit: 'px',
								} ),
							} ),
						} ),
						backgroundImageOverlayPropTypeUtil.create( {
							image: imagePropTypeUtil.create( {
								src: imageSrcPropTypeUtil.create( {
									id: imageAttachmentIdPropType.create( 123 ),
									url: null,
								} ),
								size: stringPropTypeUtil.create( 'medium_large' ),
							} ),
							size: stringPropTypeUtil.create( 'auto' ),
							position: backgroundImagePositionOffsetPropTypeUtil.create( {
								x: sizePropTypeUtil.create( {
									size: 200,
									unit: 'px',
								} ),
								y: sizePropTypeUtil.create( {
									size: 30,
									unit: 'px',
								} ),
							} ),
							repeat: stringPropTypeUtil.create( 'repeat-x' ),
							attachment: stringPropTypeUtil.create( 'fixed' ),
						} ),
					] ),
				} ),
			},
			expected: {
				'background-color': '#000',
				'background-attachment': 'scroll,scroll,scroll,fixed',
				'background-image':
					'linear-gradient(blue, blue),linear-gradient(yellow, yellow),url(thumbnail-image-url-123),url(medium_large-image-url-123)',
				'background-position': '0% 0%,0% 0%,0% 0%,200px 30px',
				'background-repeat': 'repeat,repeat,repeat,repeat-x',
				'background-size': 'auto auto,auto auto,1400px auto,auto',
			},
		},
		{
			name: 'filter',
			props: {
				filter: filters,
			},
			expected: {
				filter: 'blur(1px) brightness(90%) contrast(50%) grayscale(70%) invert(60%) sepia(30%) saturate(25%) hue-rotate(10deg)',
			},
		},
		{
			name: 'backdrop-filter',
			props: {
				'backdrop-filter': backDropFilters,
			},
			expected: {
				'backdrop-filter':
					'blur(2rem) brightness(80%) contrast(50%) grayscale(70%) invert(60%) sepia(30%) saturate(25%) hue-rotate(10deg)',
			},
		},
		{
			name: 'background (url only repeat and attachment)',
			prepare: () => {
				jest.mocked( getMediaAttachment ).mockImplementation(
					( args ) => Promise.resolve( mockAttachmentData( args.id ) ) as never
				);
			},
			props: {
				background: backgroundPropTypeUtil.create( {
					'background-overlay': backgroundOverlayPropTypeUtil.create( [
						backgroundImageOverlayPropTypeUtil.create( {
							image: imagePropTypeUtil.create( {
								src: imageSrcPropTypeUtil.create( {
									id: imageAttachmentIdPropType.create( 123 ),
									url: null,
								} ),
								size: 'medium_large',
							} ),
							repeat: 'repeat-x',
						} ),
						backgroundImageOverlayPropTypeUtil.create( {
							image: imagePropTypeUtil.create( {
								src: imageSrcPropTypeUtil.create( {
									id: imageAttachmentIdPropType.create( 123 ),
									url: null,
								} ),
								size: 'thumbnail',
							} ),
							attachment: 'fixed',
						} ),
					] ),
				} ),
			},
			expected: {
				'background-image': 'url(medium_large-image-url-123),url(thumbnail-image-url-123)',
				'background-attachment': 'scroll,fixed',
				'background-repeat': 'repeat-x,repeat',
				'background-position': '0% 0%',
				'background-size': 'auto auto',
			},
		},
		{
			name: 'background (same url and position, attachment with only defaults, different repeat)',
			prepare: () => {
				jest.mocked( getMediaAttachment ).mockImplementation(
					( args ) => Promise.resolve( mockAttachmentData( args.id ) ) as never
				);
			},
			props: {
				background: backgroundPropTypeUtil.create( {
					'background-overlay': backgroundOverlayPropTypeUtil.create( [
						backgroundImageOverlayPropTypeUtil.create( {
							image: imagePropTypeUtil.create( {
								src: imageSrcPropTypeUtil.create( {
									id: imageAttachmentIdPropType.create( 123 ),
									url: null,
								} ),
								size: 'medium_large',
							} ),
							position: 'center left',
							repeat: 'repeat-x',
							attachment: 'scroll',
						} ),
						backgroundImageOverlayPropTypeUtil.create( {
							image: imagePropTypeUtil.create( {
								src: imageSrcPropTypeUtil.create( {
									id: imageAttachmentIdPropType.create( 123 ),
									url: null,
								} ),
								size: 'medium_large',
							} ),
							position: 'center left',
							repeat: 'no-repeat',
						} ),
						backgroundImageOverlayPropTypeUtil.create( {
							image: imagePropTypeUtil.create( {
								src: imageSrcPropTypeUtil.create( {
									id: imageAttachmentIdPropType.create( 123 ),
									url: null,
								} ),
								size: 'medium_large',
							} ),
							position: 'center left',
							repeat: 'repeat',
							attachment: 'scroll',
						} ),
						backgroundImageOverlayPropTypeUtil.create( {
							image: imagePropTypeUtil.create( {
								src: imageSrcPropTypeUtil.create( {
									id: imageAttachmentIdPropType.create( 123 ),
									url: null,
								} ),
								size: 'medium_large',
							} ),
							position: 'center left',
						} ),
					] ),
				} ),
			},
			expected: {
				'background-image':
					'url(medium_large-image-url-123),url(medium_large-image-url-123),url(medium_large-image-url-123),url(medium_large-image-url-123)',
				'background-position': 'center left',
				'background-repeat': 'repeat-x,no-repeat,repeat,repeat',
				'background-attachment': 'scroll',
				'background-size': 'auto auto',
			},
		},
		{
			name: 'background (only gradient)',
			props: {
				background: backgroundPropTypeUtil.create( {
					'background-overlay': backgroundOverlayPropTypeUtil.create( [
						backgroundGradientOverlayPropTypeUtil.create( {
							type: stringPropTypeUtil.create( 'linear' ),
							angle: numberPropTypeUtil.create( 190 ),
							stops: gradientColorStopPropTypeUtil.create( [
								colorStopPropTypeUtil.create( {
									color: colorPropTypeUtil.create( 'red' ),
									offset: numberPropTypeUtil.create( 10 ),
								} ),
								colorStopPropTypeUtil.create( {
									color: colorPropTypeUtil.create( 'yellow' ),
									offset: numberPropTypeUtil.create( 40 ),
								} ),
								colorStopPropTypeUtil.create( {
									color: colorPropTypeUtil.create( 'rgb(255,0,255)' ),
									offset: numberPropTypeUtil.create( 87 ),
								} ),
							] ),
						} ),
						backgroundGradientOverlayPropTypeUtil.create( {
							type: stringPropTypeUtil.create( 'radial' ),
							angle: numberPropTypeUtil.create( 95 ),
							stops: gradientColorStopPropTypeUtil.create( [
								colorStopPropTypeUtil.create( {
									color: colorPropTypeUtil.create( 'rgb(0,190,245,0.7)' ),
									offset: numberPropTypeUtil.create( 60 ),
								} ),
								colorStopPropTypeUtil.create( {
									color: colorPropTypeUtil.create( 'rgb(255,0,255)' ),
									offset: numberPropTypeUtil.create( 93 ),
								} ),
							] ),
							positions: stringPropTypeUtil.create( 'bottom left' ),
						} ),
					] ),
				} ),
			},
			expected: {
				'background-image':
					'linear-gradient(190deg, red 10%,yellow 40%,rgb(255,0,255) 87%),radial-gradient(circle at bottom left, rgb(0,190,245,0.7) 60%,rgb(255,0,255) 93%)',
				'background-position': '0% 0%',
				'background-repeat': 'repeat',
				'background-attachment': 'scroll',
				'background-size': 'auto auto',
			},
		},
		{
			name: 'background with manually set default values',
			props: {
				background: backgroundPropTypeUtil.create( {
					color: colorPropTypeUtil.create( '#000' ),
					'background-overlay': backgroundOverlayPropTypeUtil.create( [
						backgroundImageOverlayPropTypeUtil.create( {
							image: imagePropTypeUtil.create( {
								src: imageSrcPropTypeUtil.create( {
									id: imageAttachmentIdPropType.create( 123 ),
									url: null,
								} ),
							} ),
							repeat: stringPropTypeUtil.create( 'repeat' ),
							size: backgroundImageSizeScalePropTypeUtil.create( {
								width: sizePropTypeUtil.create( {
									size: 1400,
									unit: 'px',
								} ),
							} ),
						} ),
					] ),
				} ),
			},
			expected: {
				'background-color': '#000',
				'background-image': 'url(original-image-url-123)',
				'background-repeat': 'repeat',
				'background-size': '1400px auto',
				'background-position': '0% 0%',
				'background-attachment': 'scroll',
			},
		},
	] )( 'it should resolve props for `$name`', async ( { prepare, props, expected } ) => {
		// Arrange.
		prepare?.();

		initStyleTransformers();

		const resolve = createPropsResolver( {
			transformers: styleTransformersRegistry,
			schema: mockStylesSchema,
		} );

		// Act.
		const result = Object.entries( await resolve( { props } ) ).filter( ( [ , value ] ) => value !== null );

		// Assert.
		expect( Object.fromEntries( result ) ).toStrictEqual( expected );
	} );
} );
