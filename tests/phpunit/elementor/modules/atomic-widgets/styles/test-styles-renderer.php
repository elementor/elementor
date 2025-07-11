<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Styles;

use Elementor\Modules\AtomicWidgets\PropsResolver\Render_Props_Resolver;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Testing\Modules\AtomicWidgets\Props_Factory;
use Spatie\Snapshots\MatchesSnapshots;
use Elementor\Modules\AtomicWidgets\Styles\Styles_Renderer;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @group Test_Styles_Renderer
 */
class Test_Styles_Renderer extends Elementor_Test_Base {
	use MatchesSnapshots;

	public function tear_down() {
		parent::tear_down();

		Render_Props_Resolver::reset();
	}

	public function test_render__basic_style() {
		// Arrange.
		$styles = [
			[
				'id' => 'test-style',
				'type' => 'class',
				'variants' => [
					[
						'props' => [
							'color' => 'red',
							'font-size' => '16px',
						],
						'meta' => [],
					],
				],
			],
		];

		$stylesRenderer = Styles_Renderer::make( [], '' );

		// Act.
		$css = $stylesRenderer->render( $styles );

		// Assert.
		$this->assertMatchesSnapshot( $css );
	}

	public function test_render__invalid_style_type() {
		// Arrange.
		$styles = [
			[
				'id' => 'test-style-1',
				'type' => 'id', // currently only supports 'class'
				'variants' => [
					[
						'props' => [
							'color' => 'red',
							'fontSize' => '16px',
						],
						'meta' => [],
					],
				],
			],
			[
				'id' => 'test-style-2',
				'type' => 'class', // valid
				'variants' => [
					[
						'props' => [
							'color' => 'red',
							'fontSize' => '16px',
						],
						'meta' => [],
					],
				],
			],
		];

		$stylesRenderer = Styles_Renderer::make( [], '' );

		// Act.
		$css = $stylesRenderer->render( $styles );

		// Assert.
		$this->assertMatchesSnapshot( $css );
	}

	public function test_render__empty_style() {
		// Arrange.
		$styles = [
			[
				'id' => 'test-style',
				'type' => 'class',
				'variants' => [],
			],
		];

		$stylesRenderer = Styles_Renderer::make( [], '' );

		// Act.
		$css = $stylesRenderer->render( $styles );

		// Assert.
		$this->assertEmpty( $css );

		// Act.
		$css = $stylesRenderer->render( [] );

		// Assert.
		$this->assertEmpty( $css );
	}

	public function test_render__style_variant_with_state() {
		// Arrange.
		$styles = [
			[
				'id' => 'test-style',
				'type' => 'class',
				'variants' => [
					[
						'props' => [
							'color' => 'blue',
						],
						'meta' => [
							'state' => 'hover',
						],
					],
				],
			],
		];

		$stylesRenderer = Styles_Renderer::make( [], '' );

		// Act.
		$css = $stylesRenderer->render( $styles );

		// Assert.
		$this->assertMatchesSnapshot( $css );
	}

	public function test_render__style_variant_with_breakpoint() {
		// Arrange.
		$styles = [
			[
				'id' => 'test-style',
				'type' => 'class',
				'variants' => [
					[
						'props' => [
							'color' => 'green',
						],
						'meta' => [
							'breakpoint' => 'mobile',
						],
					],
					[
						'props' => [
							'color' => 'blue',
						],
						'meta' => [
							'breakpoint' => 'tablet', // non-existing breakpoint
						],
					],
				],
			],
		];

		$stylesRenderer = Styles_Renderer::make( [
			'mobile' => [
				'direction' => 'max',
				'value' => 768,
				'is_enabled' => true,
			],
		], '' );

		// Act.
		$css = $stylesRenderer->render( $styles );

		// Assert.
		$this->assertMatchesSnapshot( $css );
	}

	public function test_render__style_variants_with_disabled_breakpoints() {
		// Arrange.
		$styles = [
			[
				'id' => 'test-style',
				'type' => 'class',
				'variants' => [
					[
						'props' => [
							'color' => 'green',
						],
						'meta' => [
							'breakpoint' => 'mobile',
						],
					],
					[
						'props' => [
							'color' => 'blue',
						],
						'meta' => [
							'breakpoint' => 'tablet',
						],
					],
				],
			],
		];

		$stylesRenderer = Styles_Renderer::make( [
			'mobile' => [
				'direction' => 'max',
				'value' => 768,
				'is_enabled' => true,
			],
			'tablet' => [
				'direction' => 'max',
				'value' => 1024,
				'is_enabled' => false,
			],
		], '' );

		// Act.
		$css = $stylesRenderer->render( $styles );

		// Assert.
		$this->assertMatchesSnapshot( $css );
	}

	public function test_render__style_variants_with_breakpoint_and_state() {
		// Arrange.
		$styles = [
			[
				'id' => 'test-style',
				'type' => 'class',
				'variants' => [
					[
						'props' => [
							'color' => 'green',
						],
						'meta' => [
							'breakpoint' => 'mobile',
							'state' => 'hover',
						],
					],
					[
						'props' => [
							'color' => 'blue',
						],
						'meta' => [
							'breakpoint' => 'tablet',
							'state' => 'focus',
						],
					],
				],
			],
		];

		$stylesRenderer = Styles_Renderer::make( [
			'mobile' => [
				'direction' => 'max',
				'value' => 768,
				'is_enabled' => true,
			],
			'tablet' => [
				'direction' => 'max',
				'value' => 1024,
				'is_enabled' => true,
			],
		], '' );

		// Act.
		$css = $stylesRenderer->render( $styles );

		// Assert.
		$this->assertMatchesSnapshot( $css );
	}

	public function test_render__style_prop_with_mismatching_prop_type() {
		// Arrange.
		$styles = [
			[
				'id' => 'test-style',
				'type' => 'class',
				'variants' => [
					[
						'props' => [
							'text-decoration' => [
								'$$type' => 'mismatching-prop-type',
								'value' => 'underline',
							],
						],
						'meta' => [],
					],
				],
			],
		];

		$stylesRenderer = Styles_Renderer::make( [], '' );

		// Act.
		$css = $stylesRenderer->render( $styles );

		// Assert.
		$this->assertMatchesSnapshot( $css );
	}

	public function test_render__style_with_transformers_receiving_faulty_values() {
		// Arrange.
		$styles = [
			[
				'id' => 'test-style',
				'type' => 'class',
				'variants' => [
					[
						'props' => [
							'font-size' => [
								'$$type' => 'size',
								'value' => 14, // expected array{size: int, unit: string}
							],
						],
						'meta' => [],
					],
				],
			],
		];

		$stylesRenderer = Styles_Renderer::make( [], '' );

		// Act.
		$css = $stylesRenderer->render( $styles );

		// Assert.
		$this->assertMatchesSnapshot( $css );
	}

	public function test_render__style_with_nested_background_transformers() {
		// Arrange.
		add_filter( 'wp_get_attachment_image_src', function( ...$args ) {
			$resolution = $args[2];
			$images = $this->mock_images();

			return $images[ $resolution ];
		}, 10, 3 );

		$styles = [
			[
				'id' => 'test-style',
				'type' => 'class',
				'variants' => [
					[
						'props' => [
							'background' => [
								'$$type' => 'background',
								'value' => [
									'background-overlay' => [
										'$$type' => 'background-overlay',
										'value' => [
											[
												'$$type' => 'background-color-overlay',
												'value' => [
													'color' => 'blue',
												],
												'disabled' => true,
											], // this should not be rendered due to `disabled` => true
											[
												'$$type' => 'background-color-overlay',
												'value' => [
													'color' => 'blue',
												],
											],
											[
												'$$type' => 'background-image-overlay',
												'value' => [
													'image' => [
														'$$type' => 'image',
														'value' => [
															'src' => [
																'$$type' => 'image-src',
																'value' => [
																	'id' => [
																		'$$type' => 'image-attachment-id',
																		'value' => 3,
																	],
																	'url' => null,
																],
															],
															'size' => [
																'$$type' => 'string',
																'value' => 'medium',
															],
														],
													],
													'position' => 'top center',
													'repeat' => 'repeat-y',
													'attachment' => 'fixed',
												],
											],
										],
									],
									'color' => [
										'$$type' => 'color',
										'value' => 'red',
									],
								],
							],
						],
						'meta' => [],
					],
				],
			],
		];

		$stylesRenderer = Styles_Renderer::make( [], '' );

		// Act.
		$css = $stylesRenderer->render( $styles );

		// Assert.
		$this->assertNotEmpty( $css, 'CSS should not be empty' );
		$this->assertMatchesSnapshot( $css );
	}

	public function test_render__style_with_background_gradient_transformers() {
		// Arrange.
		$styles = [
			[
				'id' => 'test-style',
				'type' => 'class',
				'variants' => [
					[
						'props' => [
							'background' => [
								'$$type' => 'background',
								'value' => [
									'background-overlay' => [
										'$$type' => 'background-overlay',
										'value' => [
											[
												'$$type' => 'background-gradient-overlay',
												'value' => [
													'type' => [
														'$$type' => 'string',
														'value' => 'linear',
													],
													'angle' => [
														'$$type' => 'number',
														'value' => 45,
													],
													'stops' => [
														'$$type' => 'gradient-color-stop',
														'value' => [
															[
																'$$type' => 'color-stop',
																'value' => [
																	'color' => [
																		'$$type' => 'color',
																		'value' => 'red',
																	],
																	'offset' => [
																		'$$type' => 'number',
																		'value' => 0,
																	],
																],
															],
															[
																'$$type' => 'color-stop',
																'value' => [
																	'color' => [
																		'$$type' => 'color',
																		'value' => 'rgb(255, 0, 255, 0.3)',
																	],
																	'offset' => [
																		'$$type' => 'number',
																		'value' => 100,
																	],
																],
															],
														],
													],
												],
											],
											[
												'$$type' => 'background-gradient-overlay',
												'value' => [
													'type' => [
														'$$type' => 'string',
														'value' => 'radial',
													],
													'positions' => [
														'$$type' => 'string',
														'value' => 'bottom center',
													],
													'stops' => [
														'$$type' => 'gradient-color-stop',
														'value' => [
															[
																'$$type' => 'color-stop',
																'value' => [
																	'color' => [
																		'$$type' => 'color',
																		'value' => 'rgb(90, 143,11)',
																	],
																	'offset' => [
																		'$$type' => 'number',
																		'value' => 67,
																	],
																],
															],
															[
																'$$type' => 'color-stop',
																'value' => [
																	'color' => [
																		'$$type' => 'color',
																		'value' => 'rgb(0, 0, 0)',
																	],
																	'offset' => [
																		'$$type' => 'number',
																		'value' => 21,
																	],
																],
															],
														],
													],
												],
											],
										],
									],
								],
							],
						],
						'meta' => [],
					],
				],
			],
		];

		$stylesRenderer = Styles_Renderer::make( [], '' );

		// Act.
		$css = $stylesRenderer->render( $styles );

		// Assert.
		$this->assertNotEmpty( $css, 'CSS should not be empty' );
		$this->assertMatchesSnapshot( $css );
	}

	public function test_render__style_with_nested_background_image_transformers() {
		// Arrange.
		$styles = [
			[
				'id' => 'test-style',
				'type' => 'class',
				'variants' => [
					[
						'props' => [
							'background' => [
								'$$type' => 'background',
								'value' => [
									'background-overlay' => [
										'$$type' => 'background-overlay',
										'value' => [
											[
												'$$type' => 'background-color-overlay',
												'value' => [
													'color' => 'blue',
												],
											],
											[
												'$$type' => 'background-image-overlay',
												'value' => [
													'image' => [
														'$$type' => 'image',
														'value' => [
															'src' => [
																'$$type' => 'image-src',
																'value' => [
																	'id' => null,
																	'url' => 'https://example.com/image.jpg',
																],
															],
														],
													],
													'size' => 'cover',
													'position' => 'bottom right',
													'attachment' => 'fixed',
												],
											],
											[
												'$$type' => 'background-image-overlay',
												'value' => [
													'image' => [
														'$$type' => 'image',
														'value' => [
															'src' => [
																'$$type' => 'image-src',
																'value' => [
																	'id' => null,
																	'url' => 'https://example.com/image.jpg',
																],
															],
														],
													],
													'position' => [
														'$$type' => 'background-image-position-offset',
														'value' => [
															'x' => [
																'$$type' => 'size',
																'value' => [
																	'unit' => 'px',
																	'size' => 40,
																],
															],
															'y' => [
																'$$type' => 'size',
																'value' => [
																	'unit' => 'px',
																	'size' => 70,
																],
															],
														],
													],
												],
											],
										],
									],

									'color' => [
										'$$type' => 'color',
										'value' => 'red',
									],
								],
							],
						],

						'meta' => [],
					],
				],
			],
		];

		$stylesRenderer = Styles_Renderer::make( [], '' );

		// Act.
		$css = $stylesRenderer->render( $styles );

		// Assert.
		$this->assertNotEmpty( $css, 'CSS should not be empty' );
		$this->assertMatchesSnapshot( $css );
	}
	public function test_render__style_with_background_color_transformers() {
		// Arrange.
		$styles = [
			[
				'id' => 'test-background-color',
				'type' => 'class',
				'variants' => [
					[
						'props' => [
							'background' => [
								'$$type' => 'background',
								'value' => [
									'color' => [
										'$$type' => 'color',
										'value' => 'red',
									],
								],
							],
						],

						'meta' => [],
					],
				],
			],
		];

		$stylesRenderer = Styles_Renderer::make( [], '' );

		// Act.
		$css = $stylesRenderer->render( $styles );

		// Assert.
		$this->assertNotEmpty( $css, 'CSS should not be empty' );
		$this->assertMatchesSnapshot( $css );
	}

	public function test_render__style_with_background_overlay_transformers() {
		// Arrange.
		add_filter( 'wp_get_attachment_image_src', function( ...$args ) {
			$resolution = $args[2];
			$images = $this->mock_images();

			return $images[ $resolution ];
		}, 10, 3 );

		$styles = [
			[
				'id' => 'test-background-overlay',
				'type' => 'class',
				'variants' => [
					[
						'props' => [
							'background' => [
								'$$type' => 'background',
								'value' => [
									'background-overlay' => [
										'$$type' => 'background-overlay',
										'value' => [
											[
												'$$type' => 'background-color-overlay',
												'value' => [
													'color' => 'blue',
												],
											],
											[
												'$$type' => 'background-image-overlay',
												'value' => [
													'image' => [
														'$$type' => 'image',
														'value' => [
															'src' => [
																'$$type' => 'image-src',
																'value' => [
																	'id' => [
																		'$$type' => 'image-attachment-id',
																		'value' => 3,
																	],
																	'url' => null,
																],
															],
															'size' => [
																'$$type' => 'string',
																'value' => 'large',
															],
														],
													],
													'size' => [
														'$$type' => 'background-image-size-scale',
														'value'  => [
															// Missing 'height'
															'width'  => [
																'$$type' => 'size',
																'value'  => [
																	'size' => 140,
																	'unit' => 'px',
																],
															],
														],
													],
													'repeat' => 'repeat-x',
												],
											],
										],
									],
								],
							],
						],

						'meta' => [],
					],
				],
			],
		];

		$stylesRenderer = Styles_Renderer::make( [], '' );

		// Act.
		$css = $stylesRenderer->render( $styles );

		// Assert.
		$this->assertNotEmpty( $css, 'CSS should not be empty' );
		$this->assertMatchesSnapshot( $css );
	}

	public function test_render__style_with_background_image_transformers_without_image() {
		// Arrange.
		add_filter( 'wp_get_attachment_image_src', function() {
			return [
				'https://example.com/image.jpg',
				100,
				200,
			];
		} );

		$styles = [
			[
				'id' => 'test-background-overlay',
				'type' => 'class',
				'variants' => [
					[
						'props' => [
							'background' => [
								'$$type' => 'background',
								'value' => [
									'background-overlay' => [
										'$$type' => 'background-overlay',
										'value' => [
											[
												'$$type' => 'background-color-overlay',
												'value' => [
													'color' => 'blue',
												],
											],
										],
									],
								],
							],
						],

						'meta' => [],
					],
				],
			],
		];

		$stylesRenderer = Styles_Renderer::make( [], '' );

		// Act.
		$css = $stylesRenderer->render( $styles );

		// Assert.
		$this->assertNotEmpty( $css, 'CSS should not be empty' );
		$this->assertMatchesSnapshot( $css );
	}

	public function test_render__style_with_background_with_fields_of_similar_valus() {
		// Arrange.
		add_filter( 'wp_get_attachment_image_src', function( ...$args ) {
			$resolution = $args[2];
			$images = $this->mock_images();

			return $images[ $resolution ];
		}, 10, 3 );

		$styles = [
			[
				'id' => 'test-background-overlay',
				'type' => 'class',
				'variants' => [
					[
						'props' => [
							'background' => [
								'$$type' => 'background',
								'value' => [
									'background-overlay' => [
										'$$type' => 'background-overlay',
										'value' => [
											[
												'$$type' => 'background-image-overlay',
												'value' => [
													'image' => [
														'$$type' => 'image',
														'value' => [
															'src' => [
																'$$type' => 'image-src',
																'value' => [
																	'id' => [
																		'$$type' => 'image-attachment-id',
																		'value' => 3,
																	],
																	'url' => null,
																],
															],
															'size' => [
																'$$type' => 'string',
																'value' => 'large',
															],
														],
													],
													'size' => [
														'$$type' => 'background-image-size-scale',
														'value'  => [
															// Missing 'height'
															'width'  => [
																'$$type' => 'size',
																'value'  => [
																	'size' => 140,
																	'unit' => 'px',
																],
															],
														],
													],
													'position' => 'center left',
												],
											],
											[
												'$$type' => 'background-image-overlay',
												'value' => [
													'image' => [
														'$$type' => 'image',
														'value' => [
															'src' => [
																'$$type' => 'image-src',
																'value' => [
																	'id' => [
																		'$$type' => 'image-attachment-id',
																		'value' => 3,
																	],
																	'url' => null,
																],
															],
															'size' => [
																'$$type' => 'string',
																'value' => 'large',
															],
														],
													],
													'size' => [
														'$$type' => 'background-image-size-scale',
														'value'  => [
															// Missing 'height'
															'width'  => [
																'$$type' => 'size',
																'value'  => [
																	'size' => 140,
																	'unit' => 'px',
																],
															],
														],
													],
													'position' => 'center left',
													'attachment' => 'scroll',
												],
											],
											[
												'$$type' => 'background-image-overlay',
												'value' => [
													'image' => [
														'$$type' => 'image',
														'value' => [
															'src' => [
																'$$type' => 'image-src',
																'value' => [
																	'id' => [
																		'$$type' => 'image-attachment-id',
																		'value' => 3,
																	],
																	'url' => null,
																],
															],
															'size' => [
																'$$type' => 'string',
																'value' => 'large',
															],
														],
													],
													'size' => [
														'$$type' => 'background-image-size-scale',
														'value'  => [
															// Missing 'height'
															'width'  => [
																'$$type' => 'size',
																'value'  => [
																	'size' => 150,
																	'unit' => 'px',
																],
															],
														],
													],
													'position' => 'center left',
												],
											],
										],
									],
								],
							],
						],

						'meta' => [],
					],
				],
			],
		];

		$stylesRenderer = Styles_Renderer::make( [], '' );

		// Act.
		$css = $stylesRenderer->render( $styles );

		// Assert.
		$this->assertNotEmpty( $css, 'CSS should not be empty' );
		$this->assertMatchesSnapshot( $css );
	}

	public function test_render__style_with_position_transformers() {
		// Arrange.
		$styles = [
			[
				'id' => 'test-style',
				'type' => 'class',
				'variants' => [
					[
						'props' => [
							'position' => [
								'$$type' => 'string',
								'value' => 'sticky',
							],
						],
						'meta' => [],
					],
				],
			],
		];

		$stylesRenderer = Styles_Renderer::make( [], '' );

		// Act.
		$css = $stylesRenderer->render( $styles );

		// Assert.
		$this->assertNotEmpty( $css, 'CSS should not be empty' );
		$this->assertMatchesSnapshot( $css );
	}

	public function test_render__style_with_nested_transformers() {
		// Arrange.
		$styles = [
			[
				'id' => 'test-style',
				'type' => 'class',
				'variants' => [
					[
						'props' => [
							'font-size' => [
								'$$type' => 'size',
								'value' => [
									'size' => 14,
									'unit' => 'px',
								],
							],
							'margin' => [
								'$$type' => 'dimensions',
								'value' => [
									'block-start' => [
										'$$type' => 'size',
										'value' => [
											'size' => 1,
											'unit' => 'px',
										],
									],
									'block-end' => null,
									'inline-start' => [
										'$$type' => 'size',
										'value' => [
											'size' => 1,
											'unit' => 'px',
										],
									],
									'inline-end' => [
										'$$type' => 'string',
										'value' => 'auto',
									],
								],
							],
							'border-radius' => [
								'$$type' => 'border-radius',
								'value' => [
									'start-start' => [
										'$$type' => 'size',
										'value' => [
											'size' => 1,
											'unit' => 'px',
										],
									],
									'start-end' => [
										'$$type' => 'size',
										'value' => [
											'size' => 1,
											'unit' => 'px',
										],
									],
									'end-start' => [
										'$$type' => 'size',
										'value' => [
											'size' => 1,
											'unit' => 'px',
										],
									],
									'end-end' => null,
								],
							],
							'border-width' => [
								'$$type' => 'border-width',
								'value' => [
									'block-start' => [
										'$$type' => 'size',
										'value' => [
											'size' => 1,
											'unit' => 'px',
										],
									],
									'block-end' => null,
									'inline-start' => [
										'$$type' => 'size',
										'value' => [
											'size' => 1,
											'unit' => 'px',
										],
									],
								],
							],
							'stroke' => [
								'$$type' => 'stroke',
								'value' => [
									'color' => [
										'$$type' => 'color',
										'value' => '#ff0000',
									],
									'width' => [
										'$$type' => 'size',
										'value' => [
											'unit' => 'px',
											'size' => 10,
										],
									],
								],
							],
							'gap' => [
								'$$type' => 'layout-direction',
								'value' => [
									'row' => [
										'$$type' => 'size',
										'value' => [
											'size' => 10,
											'unit' => 'px',
										],
									],
									'column' => [
										'$$type' => 'size',
										'value' => [
											'size' => 20,
											'unit' => 'px',
										],
									],
								],
							],
						],
						'meta' => [],
					],
				],
			],
		];

		$stylesRenderer = Styles_Renderer::make( [], '' );

		// Act.
		$css = $stylesRenderer->render( $styles );

		// Assert.
		$this->assertMatchesSnapshot( $css );
	}

	public function test_render__style_with_thrown_exceptions_in_transformer() {
		// Arrange.
		add_action('elementor/atomic-widgets/styles/transformers/register', function( $registry ) {
			$faulty_transformer = new class() extends Transformer_Base {
				public function transform( $value, $key ): string {
					throw new \Exception( 'Faulty transformer' );
				}
			};

			$registry->register( Number_Prop_Type::get_key(), $faulty_transformer );
		});

		$styles = [
			[
				'id' => 'test-style',
				'type' => 'class',
				'variants' => [
					[
						'props' => [
							'z-index' => Number_Prop_Type::generate( 1 ),
						],
						'meta' => [],
					],
				],
			],
		];

		$stylesRenderer = Styles_Renderer::make( [], '' );

		// Act.
		$css = $stylesRenderer->render( $styles );

		// Assert.
		$this->assertMatchesSnapshot( $css );
	}

	public function test_render__multiple_style_definitions_and_variants() {
		// Arrange.
		$styles = [
			[
				'id' => 'test-style-1',
				'type' => 'class',
				'variants' => [
					[
						'props' => [
							'color' => 'red',
						],
						'meta' => [],
					],
					[
						'props' => [
							'color' => 'purple',
						],
						'meta' => [
							'state' => 'hover',
						],
					],
				],
			],
			[
				'id' => 'test-style-2',
				'type' => 'class',
				'variants' => [
					[
						'props' => [
							'color' => 'blue',
						],
						'meta' => [],
					],
					[
						'props' => [
							'color' => 'green',
						],
						'meta' => [
							'state' => 'hover',
						],
					],
				],
			],
		];

		$stylesRenderer = Styles_Renderer::make( [], '' );

		// Act.
		$css = $stylesRenderer->render( $styles );

		// Assert.
		$this->assertMatchesSnapshot( $css );
	}

	public function test_render__style_with_custom_prefix() {
		// Arrange.
		$styles = [
			[
				'id' => 'test-style',
				'type' => 'class',
				'variants' => [
					[
						'meta' => [],
						'props' => [
							'color' => 'red',
						],
					],
				],
			],
		];

		$stylesRenderer = Styles_Renderer::make( [], '.elementor-prefix' );

		// Act.
		$css = $stylesRenderer->render( $styles );

		// Assert.
		$this->assertMatchesSnapshot( $css );
	}

	public function test_render_atomic_widget_styles__append_css_of_styles_with_flex_values() {
		// Arrange.
		$styles = [
			[
				'id' => 'test-style',
				'type' => 'class',
				'variants' => [
					[
						'props' => [
							'flex' => Props_Factory::flex(
								Props_Factory::size( 1 ),
								Props_Factory::size( 1 ),
								Props_Factory::size( 0, 'px' )
							),
						],
						'meta' => [],
					],
				],
			],
		];

		$stylesRenderer = Styles_Renderer::make( [], '' );

		// Act.
		$css = $stylesRenderer->render( $styles );

		// Assert.
		$this->assertMatchesSnapshot( $css );
	}

	public function test_render_atomic_widget_styles__append_css_of_styles_with_flex_partial_values() {
		// Arrange.
		$styles = [
			[
				'id' => 'test-style-grow-only',
				'type' => 'class',
				'variants' => [
					[
						'props' => [
							'flex' => Props_Factory::flex( 2 ),
						],
						'meta' => [],
					],
				],
			],
			[
				'id' => 'test-style-grow-shrink',
				'type' => 'class',
				'variants' => [
					[
						'props' => [
							'flex' => Props_Factory::flex( 1, 2 ),
						],
						'meta' => [],
					],
				],
			],
			[
				'id' => 'test-style-basis-only',
				'type' => 'class',
				'variants' => [
					[
						'props' => [
							'flex' => Props_Factory::flex( null, null, Props_Factory::size( 100, 'px' ) ),
						],
						'meta' => [],
					],
				],
			],
		];

		$stylesRenderer = Styles_Renderer::make( [], '' );

		// Act.
		$css = $stylesRenderer->render( $styles );

		// Assert.
		$this->assertMatchesSnapshot( $css );
	}

	private function mock_images() {
		return [
			'thumbnail' => [
				'https://example.com/image-150x150.jpg',
				150,
				150,
			],
			'medium' => [
				'https://example.com/image-300x300.jpg',
				300,
				300,
			],
			'large' => [
				'https://example.com/image-1024x682.jpg',
				1024,
				682,
			],
			'full' => [
				'https://example.com/image.jpg',
				100,
				200,
			],
		];
	}
}
