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

    public function test_styles_renderer__basic_style() {
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
        $transformers = [];
        $breakpoints = [];

        $styleRender = new Styles_Renderer( $transformers, $breakpoints);

        // Act.
        $css = $styleRender->render( $styles );

        // Assert.
		$this->assertMatchesSnapshot( $css );
    }

	public function test_styles_renderer__type_invalid_style() {
		// Arrange.
		$styles = [
			[
				'id' => 'test-style',
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
		];
		$transformers = [];
		$breakpoints = [];

		$styleRender = new Styles_Renderer( $transformers, $breakpoints);

		// Act.
		$css = $styleRender->render( $styles );

		// Assert.
		$this->assertEmpty( $css );
	}

	public function test_styles_renderer__empty_style() {
		// Arrange.
		$styles = [
			[
				'id' => 'test-style',
				'type' => 'class',
				'variants' => [],
			],
		];
		$transformers = [];
		$breakpoints = [];

		$styleRender = new Styles_Renderer( $transformers, $breakpoints);

		// Act.
		$css = $styleRender->render( $styles );

		// Assert.
		$this->assertEmpty( $css );

		// Act .
		$css = $styleRender->render( [] );

		// Assert.
		$this->assertEmpty( $css );
	}

    public function test_styles_renderer__styles_with_variants() {
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
        $transformers = [];
        $breakpoints = [];

        $styleRender = new Styles_Renderer( $transformers, $breakpoints );

        // Act.
        $css = $styleRender->render( $styles );

        // Assert.
		$this->assertMatchesSnapshot( $css );
    }

    public function test_styles_renderer__style_with_media_queries() {
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
        $transformers = [];
        $breakpoints = [
            'mobile' => [
                'type' => 'max-width',
                'width' => 768,
            ],
        ];

        $styleRender = new Styles_Renderer( $transformers, $breakpoints );

        // Act.
        $css = $styleRender->render( $styles );

        // Assert.
		$this->assertMatchesSnapshot( $css );
    }

    public function test_styles_renderer__style_with_transformers() {
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
							'text-decoration' => [
								'$$type' => 'text-decoration', // non-existing transformer
								'value' => 'underline'
							],
							'box-shadow' => [
								'$$type' => 'array',
								'value' => [
									'x' => 0,
									'y' => 0,
									'blur' => 5,
									'color' => [
										'$$type' => 'color', // nested transformable value - evaluated within the array transformer function
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
        $transformers = [
            'size' => function( $value ) {
				$size = (int)$value['size'];
				$unit = $value['unit'];
				return $size . $unit;
            },
			'color' => function( $value ) {
				return '#' . $value;
			},
			'array' => function( $value, $transform ) {
				$x = $value['x'];
				$y = $value['y'];
				$blur = $value['blur'];
				$color = $transform( $value['color'] );

				return $x.' '.$y.' '.$blur.' '.$transform( $color );
			}
        ];
        $breakpoints = [];

        $styleRender = new Styles_Renderer( $transformers, $breakpoints );

        // Act.
        $css = $styleRender->render( $styles );

        // Assert.
		$this->assertMatchesSnapshot( $css );
    }

	public function test_styles_renderer__multiple_style_definitions_and_variants() {
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
							'breakpoint' => 'mobile',
						],
					],
					[
						'props' => [
							'font-weight' => 'bold',
							'color' => 'yellow',
							'font-size' => [
								'$$type' => 'size',
								'value' => [
									'size' => 14,
									'unit' => 'px'
								]
							],
						],
						'meta' => [
							'breakpoint' => 'tablet',
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
							'font-size' => [
								'$$type' => 'size',
								'value' => [
									'size' => 12,
									'unit' => 'px'
								]
							],
						],
						'meta' => [
							'breakpoint' => 'mobile',
						],
					],
				],
			],
		];
		$transformers = [
			'size' => function( $value ) {
				$size = (int)$value['size'];
				$unit = $value['unit'];
				return $size . $unit;
			}
		];
		$breakpoints = [
			'mobile' => [
				'type' => 'max-width',
				'width' => 768,
			],
			'tablet' => [
				'type' => 'max-width',
				'width' => 1024,
			],
		];

		$styleRender = new Styles_Renderer( $transformers, $breakpoints );

		// Act.
		$css = $styleRender->render( $styles );

		// Assert.
		$this->assertMatchesSnapshot( $css );
	}
}
