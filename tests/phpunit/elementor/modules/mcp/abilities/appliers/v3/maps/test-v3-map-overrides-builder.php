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

		$this->assertSame(
			[
				'color' => [
					'setting' => 'title_color',
					'resolver' => 'color',
				],
			],
			$result
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

	public function test_from_style_targets__non_simple_kind_is_skipped() {
		$style_targets = [
			'heading' => [
				'css_properties' => [
					'font-size' => [
						'default' => [
							'kind' => 'typography',
							'resolver' => 'dimension',
							'responsive' => true,
							'destinations' => [],
						],
					],
				],
			],
		];

		$result = V3_Map_Overrides_Builder::from_style_targets( $style_targets );

		$this->assertSame( [], $result );
	}
}
