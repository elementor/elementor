<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Control_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Map_Overrides_Builder;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Map_Overrides_Builder extends TestCase {

	public function test_from_style_targets__empty_input_returns_empty_overrides() {
		$this->assertSame( [], V3_Map_Overrides_Builder::from_style_targets( [] ) );
	}

	public function test_from_style_targets__single_simple_default_control() {
		$style_targets = [
			'heading' => [
				'css_properties' => [
					'color' => [
						'default' => Style_Control_Target::control( 'title_color', 'color' ),
					],
				],
			],
		];

		$result = V3_Map_Overrides_Builder::from_style_targets( $style_targets );

		$this->assertSame( 'title_color', $result['color']['setting'] );
		$this->assertSame( 'color', $result['color']['resolver'] );
		$this->assertArrayHasKey( '_map_descriptor', $result['color'] );
	}

	public function test_from_style_targets__attaches_target_alias() {
		$style_targets = [
			'heading' => [
				'css_properties' => [
					'color' => [
						'default' => Style_Control_Target::control( 'title_color', 'color' ),
					],
				],
			],
		];

		$result = V3_Map_Overrides_Builder::from_style_targets( $style_targets );

		$this->assertSame( 'heading', $result['color']['_map_target'] );
	}

	public function test_from_style_targets__attaches_source_descriptor_for_validator() {
		$style_targets = [
			'heading' => [
				'css_properties' => [
					'color' => [
						'default' => Style_Control_Target::control( 'title_color', 'color' ),
					],
				],
			],
		];

		$result = V3_Map_Overrides_Builder::from_style_targets( $style_targets );

		$this->assertSame(
			Style_Control_Target::control( 'title_color', 'color' ),
			$result['color']['_map_descriptor']
		);
	}

	public function test_from_style_targets__pseudo_state_uses_at_suffix() {
		$style_targets = [
			'heading' => [
				'css_properties' => [
					'color' => [
						'default' => Style_Control_Target::control( 'title_color', 'color' ),
						'hover' => Style_Control_Target::control( 'title_hover_color', 'color' ),
					],
				],
			],
		];

		$result = V3_Map_Overrides_Builder::from_style_targets( $style_targets );

		$this->assertArrayHasKey( 'color', $result );
		$this->assertArrayHasKey( 'color@hover', $result );
		$this->assertSame( 'title_hover_color', $result['color@hover']['setting'] );
	}

	public function test_from_style_targets__responsive_flag_is_preserved() {
		$style_targets = [
			'container' => [
				'css_properties' => [
					'padding' => [
						'default' => Style_Control_Target::control( 'padding', 'dimension', true ),
					],
				],
			],
		];

		$result = V3_Map_Overrides_Builder::from_style_targets( $style_targets );

		$this->assertTrue( $result['padding']['responsive'] );
	}

	public function test_from_style_targets__merges_multiple_targets_and_properties() {
		$style_targets = [
			'heading' => [
				'css_properties' => [
					'color' => [
						'default' => Style_Control_Target::control( 'title_color', 'color' ),
					],
				],
			],
			'container' => [
				'css_properties' => [
					'background-color' => [
						'default' => Style_Control_Target::control( 'background_color', 'color' ),
					],
				],
			],
		];

		$result = V3_Map_Overrides_Builder::from_style_targets( $style_targets );

		$this->assertSame( 'title_color', $result['color']['setting'] );
		$this->assertSame( 'background_color', $result['background-color']['setting'] );
	}

	public function test_from_style_targets__unsupported_kind_is_skipped() {
		$style_targets = [
			'heading' => [
				'css_properties' => [
					'border' => [
						'default' => [
							'kind' => 'border',
							'resolver' => 'border',
							'responsive' => false,
							'destinations' => [
								[ 'setting' => 'border_border', 'shape' => 'string', 'resolver' => 'border' ],
							],
						],
					],
				],
			],
		];

		$result = V3_Map_Overrides_Builder::from_style_targets( $style_targets );

		$this->assertSame( [], $result );
	}

	public function test_from_style_targets__typography_field_carries_group_toggle() {
		$style_targets = [
			'heading' => [
				'css_properties' => [
					'font-size' => [
						'default' => Style_Control_Target::typography( 'typography', 'font_size', 'slider', true ),
					],
				],
			],
		];

		$result = V3_Map_Overrides_Builder::from_style_targets( $style_targets );

		$this->assertSame( 'typography_font_size', $result['font-size']['setting'] );
		$this->assertSame( 'slider', $result['font-size']['resolver'] );
		$this->assertTrue( $result['font-size']['responsive'] );
		$this->assertSame( [ 'typography_typography' => 'custom' ], $result['font-size']['companion_settings'] );
	}
}
