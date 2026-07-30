<?php

namespace Elementor\Testing\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry;
use Elementor\Modules\AtomicWidgets\CssConverter\Converters\Object_Side_Merge_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Null_Failure_Reporter;
use Elementor\Modules\AtomicWidgets\PropTypes\Border_Radius_Prop_Type;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Logical_Border_Radius_Converter extends TestCase {

	/**
	 * @dataProvider logical_border_radius_cases
	 */
	public function test_logical_longhand__converts_to_border_radius_prop(
		string $css,
		array $expected_corners
	): void {
		// Arrange.
		$converter = new Css_Converter(
			$this->make_registry(),
			new Null_Failure_Reporter()
		);

		// Act.
		$result = $converter->convert( $css );

		// Assert.
		$this->assertSame( '', $result['customCss'], 'Expected no customCss fallback.' );
		$this->assertArrayHasKey( 'border-radius', $result['props'] );

		$actual_corners = $result['props']['border-radius']['value'];

		foreach ( $expected_corners as $corner_key => $expected_size ) {
			$this->assertArrayHasKey( $corner_key, $actual_corners, "Missing corner: {$corner_key}" );
			$this->assertSame( $expected_size, $actual_corners[ $corner_key ]['value']['size'], "Wrong size for {$corner_key}" );
		}
	}

	public static function logical_border_radius_cases(): array {
		return [
			// Group A — single logical corner (4 cases).
			'single_start_start' => [
				'border-start-start-radius: 10px',
				[ 'start-start' => 10 ],
			],
			'single_start_end' => [
				'border-start-end-radius: 10px',
				[ 'start-end' => 10 ],
			],
			'single_end_end' => [
				'border-end-end-radius: 10px',
				[ 'end-end' => 10 ],
			],
			'single_end_start' => [
				'border-end-start-radius: 10px',
				[ 'end-start' => 10 ],
			],

			// Group B — two logical corners, all C(4,2) pairs (6 cases).
			'two_ss_se' => [
				'border-start-start-radius: 10px; border-start-end-radius: 20px',
				[ 'start-start' => 10, 'start-end' => 20 ],
			],
			'two_ss_ee' => [
				'border-start-start-radius: 10px; border-end-end-radius: 20px',
				[ 'start-start' => 10, 'end-end' => 20 ],
			],
			'two_ss_es' => [
				'border-start-start-radius: 10px; border-end-start-radius: 20px',
				[ 'start-start' => 10, 'end-start' => 20 ],
			],
			'two_se_ee' => [
				'border-start-end-radius: 10px; border-end-end-radius: 20px',
				[ 'start-end' => 10, 'end-end' => 20 ],
			],
			'two_se_es' => [
				'border-start-end-radius: 10px; border-end-start-radius: 20px',
				[ 'start-end' => 10, 'end-start' => 20 ],
			],
			'two_ee_es' => [
				'border-end-end-radius: 10px; border-end-start-radius: 20px',
				[ 'end-end' => 10, 'end-start' => 20 ],
			],

			// Group C — mixed three corners: 1 logical + 2 physical (8 cases).
			// Physical pair: border-top-right-radius (→ start-end, 20px)
			//              + border-bottom-left-radius (→ end-start, 30px).
			'mixed_ss_logical_first' => [
				'border-start-start-radius: 10px; border-top-right-radius: 20px; border-bottom-left-radius: 30px',
				[ 'start-start' => 10, 'start-end' => 20, 'end-start' => 30 ],
			],
			'mixed_se_logical_first' => [
				'border-start-end-radius: 10px; border-top-right-radius: 20px; border-bottom-left-radius: 30px',
				[ 'start-end' => 20, 'end-start' => 30 ],
			],
			'mixed_ee_logical_first' => [
				'border-end-end-radius: 10px; border-top-right-radius: 20px; border-bottom-left-radius: 30px',
				[ 'end-end' => 10, 'start-end' => 20, 'end-start' => 30 ],
			],
			'mixed_es_logical_first' => [
				'border-end-start-radius: 10px; border-top-right-radius: 20px; border-bottom-left-radius: 30px',
				[ 'start-end' => 20, 'end-start' => 30 ],
			],
			'mixed_ss_logical_last' => [
				'border-top-right-radius: 20px; border-bottom-left-radius: 30px; border-start-start-radius: 10px',
				[ 'start-start' => 10, 'start-end' => 20, 'end-start' => 30 ],
			],
			'mixed_se_logical_last' => [
				'border-top-right-radius: 20px; border-bottom-left-radius: 30px; border-start-end-radius: 10px',
				[ 'start-end' => 10, 'end-start' => 30 ],
			],
			'mixed_ee_logical_last' => [
				'border-top-right-radius: 20px; border-bottom-left-radius: 30px; border-end-end-radius: 10px',
				[ 'start-end' => 20, 'end-end' => 10, 'end-start' => 30 ],
			],
			'mixed_es_logical_last' => [
				'border-top-right-radius: 20px; border-bottom-left-radius: 30px; border-end-start-radius: 10px',
				[ 'start-end' => 20, 'end-start' => 10 ],
			],
		];
	}

	private function make_registry(): Converter_Registry {
		$registry = new Converter_Registry();

		$corners = [
			'border-start-start-radius'  => 'start-start',
			'border-start-end-radius'    => 'start-end',
			'border-end-end-radius'      => 'end-end',
			'border-end-start-radius'    => 'end-start',
			'border-top-left-radius'     => 'start-start',
			'border-top-right-radius'    => 'start-end',
			'border-bottom-right-radius' => 'end-end',
			'border-bottom-left-radius'  => 'end-start',
		];

		$all_corner_keys = [ 'start-start', 'start-end', 'end-end', 'end-start' ];

		foreach ( $corners as $property => $side_key ) {
			$registry->register( new Object_Side_Merge_Converter(
				$property,
				'border-radius',
				Border_Radius_Prop_Type::get_key(),
				$side_key,
				$all_corner_keys,
				Border_Radius_Prop_Type::class
			) );
		}

		return $registry;
	}
}
