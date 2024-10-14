<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Styles;

use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles\Linked_Dimensions_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles\Size_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers_Registry;
use Elementor\Modules\AtomicWidgets\PropTypes\Linked_Dimensions_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Spatie\Snapshots\MatchesSnapshots;
use Elementor\Modules\AtomicWidgets\Styles\Styles_Renderer;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Styles_Renderer extends Elementor_Test_Base {
	use MatchesSnapshots;

	public function set_up() {
		parent::set_up();

		remove_all_actions( 'elementor/atomic-widgets/styles/transformers/register' );
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

	public function test_render__style_with_nested_transformers() {
		// Arrange.
		add_action('elementor/atomic-widgets/styles/transformers/register', function($registry) {
			$registry->register( Size_Prop_Type::get_key(), new Size_Transformer() );
			$registry->register( Linked_Dimensions_Prop_Type::get_key(), new Linked_Dimensions_Transformer() );
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
									'right' => [
										'$$type' => 'size',
										'value' => [
											'size' => 1,
											'unit' => 'px'
										]
									],
									'bottom' => [
										'$$type' => 'size',
										'value' => [
											'size' => 5,
											'unit' => 'px'
										]
									],
									'left' => [
										'$$type' => 'size',
										'value' => [
											'size' => 1,
											'unit' => 'px'
										]
									],
								]
							]
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
							'font-size' => [
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
			public function transform( $value ): string {
				throw new \Exception( 'Faulty transformer' );
			}
		};
	}
}
