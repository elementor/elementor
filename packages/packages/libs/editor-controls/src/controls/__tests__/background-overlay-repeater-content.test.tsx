import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import {
	type ArrayPropType,
	backgroundColorOverlayPropTypeUtil,
	type BackgroundImageOverlayPropValue,
	type BackgroundOverlayItemPropValue,
	colorPropTypeUtil,
} from '@elementor/editor-props';
import { initEnv } from '@elementor/env';
import { fireEvent, screen } from '@testing-library/react';

import { useRepeaterContext } from '../../components/control-repeater/context/repeater-context';
import {
	getInitialBackgroundOverlay,
	initialBackgroundColorOverlay,
	ItemContent,
} from '../background-control/background-overlay/background-overlay-repeater-control';
import { createMockGradientOverlay, gradientPropType } from './background-gradient-color-control.test';

jest.mock( '../../components/control-repeater/context/repeater-context' );
jest.mocked( useRepeaterContext ).mockReturnValue( { rowRef: document.body } as never );

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
		renderControl( <ItemContent />, props );

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
		renderControl( <ItemContent />, props );

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
		renderControl( <ItemContent />, props );

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
		const { rerender } = renderControl( <ItemContent />, props );

		// Arrange.
		const colorTab = screen.getByText( 'Color' );
		fireEvent.click( colorTab );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( initialBackgroundColorOverlay );

		// Arrange.
		setValue.mockClear();

		// Act.
		rerender( <ItemContent />, {
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
		const { rerender } = renderControl( <ItemContent />, props );

		const colorTab = screen.getByText( 'Color', { selector: 'button' } );

		fireEvent.click( colorTab );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( initialBackgroundColorOverlay );

		setValue.mockClear();

		// Act.
		rerender( <ItemContent />, {
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
