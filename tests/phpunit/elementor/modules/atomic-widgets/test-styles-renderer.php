<?php

namespace Elementor\Testing\Modules\AtomicWidgets;

use Elementor\Modules\AtomicWidgets\Base\Style_Transformer_Base;
use Elementor\Modules\AtomicWidgets\Styles\Transformers\Array_Transformer;
use Elementor\Modules\AtomicWidgets\Styles\Transformers\Size_Transformer;
use Spatie\Snapshots\MatchesSnapshots;
use Elementor\Modules\AtomicWidgets\Styles\Styles_Renderer;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

class Test_Styles_Renderer extends Elementor_Test_Base {
	use MatchesSnapshots;

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
                            'fontSize' => '16px',
                        ],
                        'meta' => [],
                    ],
                ],
            ],
        ];

        $stylesRenderer = new Styles_Renderer( [
			'transformers' => [],
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
			'transformers' => [],
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
			'transformers' => [],
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
			'transformers' => [],
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
			'transformers' => [],
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
			'transformers' => [],
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
			'transformers' => [],
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
			'transformers' => [],
			'breakpoints' => []
		] );

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
								'value' => 14 // expected array{size: int, unit: string}
							],
						],
						'meta' => [],
					],
				],
			],
		];

		$stylesRenderer = new Styles_Renderer( [
			'transformers' => [
				'size' => new Size_Transformer(),
			],
			'breakpoints' => []
		] );

		// Act.
		$css = $stylesRenderer->render( $styles );

		// Assert.
		$this->assertMatchesSnapshot( $css );
	}

	public function test_render__style_with_thrown_exceptions_in_transformer() {
		// Arrange.
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
			'transformers' => [
				'faulty' => $this->make_mock_faulty_transformer(),
			],
			'breakpoints' => []
		] );

		// Act.
		$css = $stylesRenderer->render( $styles );

		// Assert.
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
									'unit' => 'px'
								]
							],
							'box-shadow' => [
								'$$type' => 'array',
								'value' => [
									'array' => [
										[
											'$$type' => 'size',
											'value' => [
												'size' => 1,
												'unit' => 'px'
											]
										],
										[
											'$$type' => 'size',
											'value' => [
												'size' => 1,
												'unit' => 'px'
											]
										],
										[
											'$$type' => 'size',
											'value' => [
												'size' => 5,
												'unit' => 'px'
											]
										],
										'#000000'
									]
								]
							]
                        ],
                        'meta' => [],
                    ],
                ],
            ],
        ];

        $stylesRenderer = new Styles_Renderer( [
			'transformers' => [
				'size' => new Size_Transformer(),
				'array' => new Array_Transformer()
			],
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
			'transformers' => [],
			'breakpoints' => []
		] );

		// Act.
		$css = $stylesRenderer->render( $styles );

		// Assert.
		$this->assertMatchesSnapshot( $css );
	}

	private function make_mock_faulty_transformer() {
		return new class() extends Style_Transformer_Base {
			public static function type(): string {
				return 'faulty';
			}

			public function transform( $value, callable $transform ): string {
				throw new \Exception( 'Faulty transformer' );
			}
		};
	}
}
