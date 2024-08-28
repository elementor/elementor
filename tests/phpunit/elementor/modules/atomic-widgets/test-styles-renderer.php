<?php

namespace Elementor\Testing\Modules\AtomicWidgets;

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
					'type' => 'max-width',
					'width' => 768,
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
					'type' => 'max-width',
					'width' => 768,
				],
				'tablet' => [
					'type' => 'max-width',
					'width' => 1024,
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
				'size' => function( $value ) {
					// would throw exception as $value is an integer
					$size = (int)$value['size'];
					$unit = $value['unit'];
					return $size . $unit;
				},
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
							'color' => [
								'$$type' => 'color',
								'value' => 'CF0000'
							],
                            'font-size' => [
								'$$type' => 'size',
								'value' => [
									'size' => 14,
									'unit' => 'px'
								]
							],
							'box-shadow' => [
								'$$type' => 'box-shadow',
								'value' => [
									'x' => [
										'$$type' => 'size',
										'value' => [
											'size' => 1,
											'unit' => 'px'
										]
									],
									'y' => [
										'$$type' => 'size',
										'value' => [
											'size' => 1,
											'unit' => 'px'
										]
									],
									'blur' => [
										'$$type' => 'size',
										'value' => [
											'size' => 5,
											'unit' => 'px'
										]
									],
									'color' => [
										'$$type' => 'color',
										'value' => '000000'
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
			'transformers' => [
				'size' => function( $value ) {
					$size = (int)$value['size'];
					$unit = $value['unit'];
					return $size . $unit;
				},
				'color' => function( $value ) {
					return '#' . $value;
				},
				'box-shadow' => function( $value, $transform ) {
					$x = $transform( $value['x'] );
					$y = $transform( $value['y'] );
					$blur = $transform( $value['blur'] );
					$color = $transform( $value['color'] );

					return $x.' '.$y.' '.$blur.' '.$transform( $color );
				}
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
}
