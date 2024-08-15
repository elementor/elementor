<?php

namespace Elementor\Testing\Modules\AtomicWidgets;

use Elementor\Modules\AtomicWidgets\Style\Style_Render;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

class Test_Style_Rendering extends Elementor_Test_Base {
    public function test_basic_style() {
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

        $styleRender = new Style_Render( $styles, $transformers, $breakpoints);

        // Act.
        $css = $styleRender->render();

        // Assert.
        $this->assertStringContainsString('.test-style{color:red;font-size:16px}', $css);
    }

    public function test_style_with_variants() {
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

        $styleRender = new Style_Render($styles, $transformers, $breakpoints);

        // Act.
        $css = $styleRender->render();

        // Assert.
        $this->assertStringContainsString('.test-style:hover{color:blue}', $css);
    }

    public function test_style_with_media_queries() {
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

        $styleRender = new Style_Render( $styles, $transformers, $breakpoints);

        // Act.
        $css = $styleRender->render();

        // Assert.
        $this->assertStringContainsString('@media(max-width:768px){.test-style{color:green}}', $css);
    }

    public function test_style_with_transformers() {
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
								'$$type' => 'text-decoration',
								'value' => 'underline'
							]
                        ],
                        'meta' => [],
                    ],
                ],
            ],
        ];
        $transformers = [
            'size' => function($value) {
				$size = (int)$value['size'];
				$unit = $value['unit'];
				return $size . $unit;
            },
        ];
        $breakpoints = [];

        $styleRender = new Style_Render( $styles, $transformers, $breakpoints);

        // Act.
        $css = $styleRender->render();

        // Assert.
        $this->assertStringContainsString('.test-style{font-size:14px;text-decoration:unset}', $css);
    }

	public function test_multiple_style_definitions_and_variants() {
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
			'size' => function($value) {
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

		$styleRender = new Style_Render( $styles, $transformers, $breakpoints);

		// Act.
		$css = $styleRender->render();

		// Assert.
		$this->assertStringContainsString('.test-style-1{color:red}', $css);
		$this->assertStringContainsString('@media(max-width:768px){.test-style-1{color:purple}}', $css);
		$this->assertStringContainsString('@media(max-width:1024px){.test-style-1{font-weight:bold;color:yellow;font-size:14px}}', $css);
		$this->assertStringContainsString('.test-style-2{color:blue}', $css);
		$this->assertStringContainsString('@media(max-width:768px){.test-style-2{color:green;font-size:12px}}', $css);
	}
}
