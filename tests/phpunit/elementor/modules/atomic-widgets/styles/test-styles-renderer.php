<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Styles;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Primitive_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Combine_Array_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles\Background_Color_Overlay_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles\Background_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles\Corner_Sizes_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles\Edge_Sizes_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles\Linked_Dimensions_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles\Size_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles\Stroke_Transformer;
use Elementor\Modules\AtomicWidgets\PropTypes\Background_Color_Overlay_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Background_Overlay_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Background_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Border_Radius_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Border_Width_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Linked_Dimensions_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Stroke_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
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

	public function set_up() {
		parent::set_up();

		remove_all_actions( 'elementor/atomic-widgets/styles/transformers/register' );

		Props_Resolver::reset();
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

		$stylesRenderer = new Styles_Renderer( [
			'breakpoints' => []
		] );

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

		$stylesRenderer = new Styles_Renderer( [
			'breakpoints' => []
		] );

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

		$stylesRenderer = new Styles_Renderer( [
			'breakpoints' => []
		] );

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

		$stylesRenderer = new Styles_Renderer( [
			'breakpoints' => []
		] );

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
					]
				],
			],
		];

		$stylesRenderer = new Styles_Renderer( [
			'breakpoints' => [
				'mobile' => [
					'direction' => 'max',
					'value' => 768,
					'is_enabled' => true,
				],
			]
		] );

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
					]
				],
			],
		];

		$stylesRenderer = new Styles_Renderer( [
			'breakpoints' => [
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
			]
		] );

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
							'state' => 'focus'
						],
					]
				],
			],
		];

		$stylesRenderer = new Styles_Renderer( [
			'breakpoints' => [
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
			]
		] );

		// Act.
		$css = $stylesRenderer->render( $styles );

		// Assert.
		$this->assertMatchesSnapshot( $css );
	}

	public function test_render__style_with_non_existing_transformers() {
		// Arrange.
		$styles = [
			[
				'id' => 'test-style',
				'type' => 'class',
				'variants' => [
					[
						'props' => [
							'text-decoration' => [
								'$$type' => 'text-decoration', // non-existing transformer
								'value' => 'underline'
							],
						],
						'meta' => [],
					],
				],
			],
		];

		$stylesRenderer = new Styles_Renderer( [
			'breakpoints' => []
		] );

		// Act.
		$css = $stylesRenderer->render( $styles );

		// Assert.
		$this->assertMatchesSnapshot( $css );
	}

	public function test_render__style_with_transformers_receiving_faulty_values() {
		// Arrange.
		add_action('elementor/atomic-widgets/styles/transformers/register', function($registry) {
			$registry->register( Size_Prop_Type::get_key(), new Size_Transformer() );
		});

		$styles = [
			[
				'id' => 'test-style',
				'type' => 'class',
				'variants' => [
					[
						'props' => [
							'font-size' => [
								'$$type' => 'size',
								'value' => 14 // expected array{size: int, unit: string}
							],
						],
						'meta' => [],
					],
				],
			],
		];

		$stylesRenderer = new Styles_Renderer( [
			'breakpoints' => []
		] );

		// Act.
		$css = $stylesRenderer->render( $styles );

		// Assert.
		$this->assertMatchesSnapshot( $css );
	}

	public function test_render__style_with_nested_background_transformers() {
		// Arrange.
		add_action('elementor/atomic-widgets/styles/transformers/register', function( $transformers ) {
			$this->attach_background_transformers( $transformers );
		} );

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
												'value' => 'blue',
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

		$stylesRenderer = new Styles_Renderer( [
			'breakpoints' => []
		] );

		// Act.
		$css = $stylesRenderer->render( $styles );

		// Assert.
		$this->assertNotEmpty( $css, 'CSS should not be empty' );
		$this->assertMatchesSnapshot( $css );
	}

	public function test_render__style_with_background_color_transformers() {
		// Arrange.
		add_action('elementor/atomic-widgets/styles/transformers/register', function( $transformers ) {
			$this->attach_background_transformers( $transformers );
		} );

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

		$stylesRenderer = new Styles_Renderer( [
			'breakpoints' => [],
		] );

		// Act.
		$css = $stylesRenderer->render( $styles );

		// Assert.
		$this->assertNotEmpty( $css, 'CSS should not be empty' );
		$this->assertMatchesSnapshot( $css );
	}

	public function test_render__style_with_background_overlay_transformers() {
		// Arrange.
		add_action('elementor/atomic-widgets/styles/transformers/register', function( $transformers ) {
			$this->attach_background_transformers( $transformers );
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
												'value' => 'blue',
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

		$stylesRenderer = new Styles_Renderer( [
			'breakpoints' => [],
		] );

		// Act.
		$css = $stylesRenderer->render( $styles );

		// Assert.
		$this->assertNotEmpty( $css, 'CSS should not be empty' );
		$this->assertMatchesSnapshot( $css );
	}

	private function attach_background_transformers( $transformers ) {
		$transformers->register( Color_Prop_Type::get_key(), new Primitive_Transformer() );
		$transformers->register( String_Prop_Type::get_key(), new Primitive_Transformer() );

		$transformers->register( Background_Prop_Type::get_key(), new Background_Transformer() );
		$transformers->register( Background_Overlay_Prop_Type::get_key(), new Combine_Array_Transformer( ', ' ) );

		$transformers->register( Background_Color_Overlay_Prop_Type::get_key(), new Background_Color_Overlay_Transformer() );
	}

	public function test_render__style_with_nested_transformers() {
		// Arrange.
		add_action('elementor/atomic-widgets/styles/transformers/register', function($registry) {
			$registry->register( Size_Prop_Type::get_key(), new Size_Transformer() );
			$registry->register( Linked_Dimensions_Prop_Type::get_key(), new Linked_Dimensions_Transformer() );
			$registry->register( Border_Radius_Prop_Type::get_key(), new Corner_Sizes_Transformer( fn( $corner ) => 'border-' . $corner . '-radius' ) );
			$registry->register( Border_Width_Prop_Type::get_key(), new Edge_Sizes_Transformer( fn( $edge ) => 'border-' . $edge . '-width' ) );
			$registry->register( Stroke_Prop_Type::get_key(), new Stroke_Transformer() );
			$registry->register( Color_Prop_Type::get_key(), new Primitive_Transformer() );
		});

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
									'unit' => 'px'
								]
							],
							'padding' => [
								'$$type' => 'linked-dimensions',
								'value' => [
									'top' => [
										'$$type' => 'size',
										'value' => [
											'size' => 1,
											'unit' => 'px'
										]
									],
									'bottom' => null,
									'left' => [
										'$$type' => 'size',
										'value' => [
											'size' => 1,
											'unit' => 'px'
										]
									],
								]
							],
							'border-radius' => [
								'$$type' => 'border-radius',
								'value' => [
									'top-left' => [
										'$$type' => 'size',
										'value' => [
											'size' => 1,
											'unit' => 'px'
										]
									],
									'top-right' => [
										'$$type' => 'size',
										'value' => [
											'size' => 1,
											'unit' => 'px'
										]
									],
									'bottom-right' => null,
									'bottom-left' => [
										'$$type' => 'size',
										'value' => [
											'size' => 1,
											'unit' => 'px'
										]
									],
								]
							],
							'border-width' => [
								'$$type' => 'border-width',
								'value' => [
									'top' => [
										'$$type' => 'size',
										'value' => [
											'size' => 1,
											'unit' => 'px'
										]
									],
									'bottom' => null,
									'left' => [
										'$$type' => 'size',
										'value' => [
											'size' => 1,
											'unit' => 'px'
										]
									],
								]
							],
							'-webkit-text-stroke' => [
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
						],
						'meta' => [],
					],
				],
			],
		];

		$stylesRenderer = new Styles_Renderer( [
			'breakpoints' => []
		] );

		// Act.
		$css = $stylesRenderer->render( $styles );

		// Assert.
		$this->assertMatchesSnapshot( $css );
	}

	public function test_render__style_with_thrown_exceptions_in_transformer() {
		// Arrange.
		add_action('elementor/atomic-widgets/styles/transformers/register', function($registry) {
			$registry->register( 'faulty', $this->make_mock_faulty_transformer() );
		});

		$styles = [
			[
				'id' => 'test-style',
				'type' => 'class',
				'variants' => [
					[
						'props' => [
							'z-index' => [
								'$$type' => 'faulty',
								'value' => true // no matter what the value here is really...
							],
						],
						'meta' => [],
					],
				],
			],
		];

		$stylesRenderer = new Styles_Renderer( [
			'breakpoints' => []
		] );

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

		$stylesRenderer = new Styles_Renderer( [
			'breakpoints' => []
		] );

		// Act.
		$css = $stylesRenderer->render( $styles );

		// Assert.
		$this->assertMatchesSnapshot( $css );
	}

	private function make_mock_faulty_transformer() {
		return new class() extends Transformer_Base {
			public function transform( $value, $key ): string {
				throw new \Exception( 'Faulty transformer' );
			}
		};
	}
}
