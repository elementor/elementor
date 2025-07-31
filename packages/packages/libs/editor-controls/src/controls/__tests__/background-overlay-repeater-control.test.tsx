import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import {
	type ArrayPropType,
	backgroundColorOverlayPropTypeUtil,
	type BackgroundImageOverlayPropValue,
	type BackgroundOverlayItemPropValue,
	type BackgroundOverlayPropValue,
	colorPropTypeUtil,
} from '@elementor/editor-props';
import { initEnv } from '@elementor/env';
import { type Attachment, useWpMediaAttachment } from '@elementor/wp-media';
import { fireEvent, screen } from '@testing-library/react';

import {
	BackgroundOverlayRepeaterControl,
	getInitialBackgroundOverlay,
	initialBackgroundColorOverlay,
	ItemContent,
} from '../background-control/background-overlay/background-overlay-repeater-control';
import { createMockGradientOverlay, gradientPropType } from './background-gradient-color-control.test';

jest.mock( '../image-media-control' );
jest.mock( '@elementor/wp-media' );

const stubBackgroundColorOverlay = ( color: string ): BackgroundOverlayItemPropValue => {
	return backgroundColorOverlayPropTypeUtil.create( {
		color: colorPropTypeUtil.create( color ),
	} );
};

const propType = createMockPropType( {
	kind: 'array',
	item_prop_type: createMockPropType( {
		kind: 'union',
		prop_types: {
			'background-color-overlay': createMockPropType( {
				kind: 'object',
				shape: {
					color: createMockPropType( { kind: 'plain' } ),
				},
			} ),
			'background-image-overlay': createMockPropType( {
				kind: 'object',
				shape: {
					image: createMockPropType( {
						kind: 'object',
						shape: {
							src: createMockPropType( {
								kind: 'object',
								shape: {
									id: createMockPropType( { kind: 'plain' } ),
									url: createMockPropType( { kind: 'plain' } ),
								},
							} ),
							size: createMockPropType( { kind: 'plain' } ),
						},
					} ),
					size: createMockPropType( {
						kind: 'union',
						prop_types: {
							'background-image-size-scale': createMockPropType( {
								kind: 'object',
								shape: {
									width: createMockPropType( {
										kind: 'object',
										shape: {
											unit: createMockPropType( { kind: 'plain' } ),
											size: createMockPropType( { kind: 'plain' } ),
										},
									} ),
									height: createMockPropType( {
										kind: 'object',
										shape: {
											unit: createMockPropType( { kind: 'plain' } ),
											size: createMockPropType( { kind: 'plain' } ),
										},
									} ),
								},
							} ),
							string: createMockPropType( { kind: 'plain' } ),
						},
					} ),
					position: createMockPropType( {
						kind: 'union',
						prop_types: {
							'background-image-position-offset': createMockPropType( {
								kind: 'object',
								shape: {
									x: createMockPropType( {
										kind: 'object',
										shape: {
											unit: createMockPropType( { kind: 'plain' } ),
											size: createMockPropType( { kind: 'plain' } ),
										},
									} ),
									y: createMockPropType( {
										kind: 'object',
										shape: {
											unit: createMockPropType( { kind: 'plain' } ),
											size: createMockPropType( { kind: 'plain' } ),
										},
									} ),
								},
							} ),
							string: createMockPropType( { kind: 'plain' } ),
						},
					} ),
					resolution: createMockPropType( { kind: 'plain' } ),
					repeat: createMockPropType( { kind: 'plain' } ),
					attachment: createMockPropType( { kind: 'plain' } ),
				},
			} ),
			'background-gradient-overlay': gradientPropType,
		},
	} ),
} ) as ArrayPropType;

const createMockImageOverlay = (
	value?: BackgroundImageOverlayPropValue[ 'value' ]
): BackgroundImageOverlayPropValue => ( {
	$$type: 'background-image-overlay',
	value: {
		image: {
			$$type: 'image',
			value: {
				src: {
					$$type: 'image-src',
					value: {
						id: {
							$$type: 'image-attachment-id',
							value: 807,
						},
						url: null,
					},
				},
				size: {
					$$type: 'string',
					value: 'full',
				},
			},
		},
		size: {
			$$type: 'background-image-size-scale',
			value: {
				width: { $$type: 'size', value: { unit: 'px', size: 100 } },
				height: { $$type: 'size', value: { unit: 'px', size: 10 } },
			},
		},
		position: {
			$$type: 'background-image-position-offset',
			value: {
				x: { $$type: 'size', value: { unit: 'px', size: 600 } },
				y: { $$type: 'size', value: { unit: 'px', size: 80 } },
			},
		},
		resolution: {
			$$type: 'string',
			value: 'full',
		},
		repeat: {
			$$type: 'string',
			value: 'repeat-x',
		},
		attachment: {
			$$type: 'string',
			value: 'fixed',
		},
		...( value ?? {} ),
	},
} );

const createMockData = (
	value: BackgroundOverlayPropValue[ 'value' ] = [
		stubBackgroundColorOverlay( 'rgba(255, 0, 0, 0.2)' ),
		stubBackgroundColorOverlay( '#F54359' ),
	]
): BackgroundOverlayPropValue => ( {
	$$type: 'background-overlay',
	value,
} );

describe( 'BackgroundControl', () => {
	beforeEach( () => {
		initEnv( {
			'@elementor/editor-controls': {
				background_placeholder_image: 'https://test-site/wp-content/uploads/bg-test.jpg',
			},
		} );

		jest.mocked( useWpMediaAttachment ).mockReturnValue( {
			data: {
				url: 'https://test-site/wp-content/uploads/bg-test.jpg',
				id: 807,
				title: 'bg-test',
			} as Attachment,
		} as never );
	} );

	it( 'should render Background overlay repeater', () => {
		// Arrange.
		const props = { value: createMockData(), setValue: jest.fn(), bind: 'background-overlay', propType };

		// Act.
		renderControl( <BackgroundOverlayRepeaterControl />, props );

		// Assert.
		expect( screen.getByText( 'Overlay' ) ).toBeInTheDocument();
		expect( screen.getByText( 'rgba(255, 0, 0, 0.2)' ) ).toBeInTheDocument();
		expect( screen.getByText( '#F54359' ) ).toBeInTheDocument();
	} );

	it( 'should display popup content with nested values', async () => {
		// Arrange.
		const props = { value: createMockData(), setValue: jest.fn(), bind: 'background-overlay', propType };

		// Act.
		renderControl( <BackgroundOverlayRepeaterControl />, props );

		const [ colorRepeaterItem ] = screen.getAllByRole( 'button', { name: 'Open item' } );
		fireEvent.click( colorRepeaterItem );

		// Assert.
		expect( screen.getByText( 'Color' ) ).toHaveAttribute( 'aria-selected', 'true' );
		expect( screen.getByText( 'rgba(255, 0, 0, 0.2)' ) ).toBeVisible();
	} );

	it( 'should display popup content with image tab', async () => {
		// Arrange.
		const backgroundImageMockValue = createMockImageOverlay();
		const props = {
			value: createMockData( [ backgroundImageMockValue ] ),
			setValue: jest.fn(),
			bind: 'background-overlay',
			propType,
		};

		// Act.
		renderControl( <BackgroundOverlayRepeaterControl />, props );

		const [ imageRepeaterItem ] = screen.getAllByRole( 'button', { name: 'Open item' } );
		fireEvent.click( imageRepeaterItem );

		// Assert.
		expect( screen.queryAllByText( 'Image' ).at( 0 ) ).toHaveAttribute( 'aria-selected', 'true' );
		expect( screen.getByLabelText( 'Repeat-x' ) ).toHaveAttribute( 'aria-pressed', 'true' );
		expect( screen.getByLabelText( 'Fixed' ) ).toHaveAttribute( 'aria-pressed', 'true' );
		expect( screen.getByDisplayValue( 'full' ) ).toBeInTheDocument();
	} );

	it( 'should display attachment title on item label image component (excluding attachment subtype)', async () => {
		// Arrange.
		const backgroundImageMockValue = createMockImageOverlay();

		const props = {
			value: createMockData( [ backgroundImageMockValue ] ),
			setValue: jest.fn(),
			bind: 'background-overlay',
			propType,
		};
		const imageTitle = 'Elementor Logo';

		jest.mocked( useWpMediaAttachment ).mockReturnValue( {
			data: {
				title: imageTitle,
				url: 'https://test-site/wp-content/uploads/bg-test.jpg',
			},
		} as never );

		// Act.
		renderControl( <BackgroundOverlayRepeaterControl />, props );

		// Assert.
		expect( screen.getByText( imageTitle ) ).toBeInTheDocument();
	} );

	it( 'should display attachment title and file type on item label image component (label + subtype)', async () => {
		// Arrange.
		const backgroundImageMockValue = createMockImageOverlay();

		const props = {
			value: createMockData( [ backgroundImageMockValue ] ),
			setValue: jest.fn(),
			bind: 'background-overlay',
			propType,
		};

		jest.mocked( useWpMediaAttachment ).mockReturnValue( {
			data: {
				title: 'dummy_image',
				subtype: 'jpg',
				filename: 'dummy_image.jpg',
				url: 'https://test-site/wp-content/uploads/bg-test.jpg',
			},
		} as never );

		// Act.
		renderControl( <BackgroundOverlayRepeaterControl />, props );

		// Assert.
		expect( screen.getByText( 'dummy_image.jpg' ) ).toBeInTheDocument();
	} );

	it( 'should not display image label (excluding attachment title)', async () => {
		// Arrange.
		const backgroundImageMockValue = createMockImageOverlay();

		const props = {
			value: createMockData( [ backgroundImageMockValue ] ),
			setValue: jest.fn(),
			bind: 'background-overlay',
			propType,
		};

		jest.mocked( useWpMediaAttachment ).mockReturnValue( {
			data: {
				subtype: 'jpg',
				url: 'https://test-site/wp-content/uploads/bg-test.jpg',
			},
		} as never );

		// Act.
		renderControl( <BackgroundOverlayRepeaterControl />, props );

		// Assert.
		expect( screen.queryByText( 'jpg' ) ).not.toBeInTheDocument();
	} );

	it( 'should display SVG correct title and file type on item label component (label + subtype)', async () => {
		// Arrange.
		const backgroundImageMockValue = createMockImageOverlay();

		const props = {
			value: createMockData( [ backgroundImageMockValue ] ),
			setValue: jest.fn(),
			bind: 'background-overlay',
			propType,
		};

		jest.mocked( useWpMediaAttachment ).mockReturnValue( {
			data: {
				title: 'svg_image',
				subtype: 'svg+xml',
				filename: 'svg_image.svg',
				url: 'https://test-site/wp-content/uploads/test.svg',
			},
		} as never );

		// Act.
		renderControl( <BackgroundOverlayRepeaterControl />, props );

		// Assert.
		expect( screen.getByText( 'svg_image.svg' ) ).toBeInTheDocument();
	} );
} );

describe( 'ItemContent', () => {
	beforeEach( () => {
		initEnv( {
			'@elementor/editor-controls': {
				background_placeholder_image: 'https://test-site/wp-content/uploads/bg-test.jpg',
			},
		} );
	} );

	it( 'should set the default color when switching from image to color tab', async () => {
		// Arrange.
		const setValue = jest.fn();
		const backgroundImageMockValue = createMockImageOverlay();

		const props = {
			setValue,
			propType: propType.item_prop_type,
			value: backgroundImageMockValue,
			bind: 'background-overlay',
		};

		// Act.
		renderControl( <ItemContent { ...props } />, props );

		const colorTab = screen.getByText( 'Color' );
		fireEvent.click( colorTab );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( initialBackgroundColorOverlay );
	} );

	it( 'should set default image when switching from color to image tab', async () => {
		// Arrange.
		const setValue = jest.fn();
		const props = {
			setValue,
			propType: propType.item_prop_type,
			bind: 'background-overlay',
			value: stubBackgroundColorOverlay( 'rgba(255, 0, 0, 0.2)' ),
		};

		// Act.
		renderControl( <ItemContent { ...props } />, props );

		const imageTab = screen.getByText( 'Image' );
		fireEvent.click( imageTab );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( getInitialBackgroundOverlay() );
	} );

	it( 'should set default gradient when switching from color to gradient tab', async () => {
		// Arrange.
		const setValue = jest.fn();
		const props = {
			setValue,
			propType: propType.item_prop_type,
			bind: 'background-overlay',
			value: stubBackgroundColorOverlay( 'rgba(0, 0, 0)' ),
		};

		// Act.
		renderControl( <ItemContent { ...props } />, props );

		const gradientTab = screen.getByText( 'Gradient' );
		fireEvent.click( gradientTab );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'background-gradient-overlay',
			value: {
				type: { $$type: 'string', value: 'linear' },
				angle: { $$type: 'number', value: 180 },
				stops: {
					$$type: 'gradient-color-stop',
					value: [
						{
							$$type: 'color-stop',
							value: {
								color: { $$type: 'color', value: 'rgb(0,0,0)' },
								offset: { $$type: 'number', value: 0 },
							},
						},
						{
							$$type: 'color-stop',
							value: {
								color: { $$type: 'color', value: 'rgb(255,255,255)' },
								offset: { $$type: 'number', value: 100 },
							},
						},
					],
				},
			},
		} );

		expect( screen.queryAllByText( 'Gradient' ).at( 0 ) ).toHaveAttribute( 'aria-selected', 'true' );
		expect( screen.getByText( 'Angle' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Stop' ) ).toBeInTheDocument();
	} );

	it( 'should save the color and image value history when switching between tabs', () => {
		// Arrange.
		const setValue = jest.fn();
		const imageValue = createMockImageOverlay();

		const props = {
			setValue,
			bind: 'background-overlay',
			value: imageValue,
			propType: propType.item_prop_type,
		};

		// Act.
		const { rerender } = renderControl( <ItemContent { ...props } />, props );

		// Arrange.
		const colorTab = screen.getByText( 'Color' );
		fireEvent.click( colorTab );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( initialBackgroundColorOverlay );

		// Arrange.
		setValue.mockClear();

		// Act.
		rerender( <ItemContent { ...props } />, {
			value: stubBackgroundColorOverlay( '#F54359' ),
		} );

		const imageTab = screen.getByText( 'Image' );
		fireEvent.click( imageTab );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( imageValue );
	} );

	it( 'should save the gradient value history when switching between tabs', () => {
		// Arrange.
		const setValue = jest.fn();
		const gradientValue = createMockGradientOverlay();

		const props = {
			setValue,
			bind: 'background-overlay',
			value: gradientValue,
			propType: propType.item_prop_type,
		};

		// Act.
		const { rerender } = renderControl( <ItemContent { ...props } />, props );

		const colorTab = screen.getByText( 'Color', { selector: 'button' } );

		fireEvent.click( colorTab );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( initialBackgroundColorOverlay );

		setValue.mockClear();

		// Act.
		rerender( <ItemContent { ...props } />, {
			value: stubBackgroundColorOverlay( '#F54359' ),
		} );

		const imageTab = screen.getByText( 'Image' );
		fireEvent.click( imageTab );

		const gradientTab = screen.getByText( 'Gradient' );
		fireEvent.click( gradientTab );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( gradientValue );
	} );
} );
