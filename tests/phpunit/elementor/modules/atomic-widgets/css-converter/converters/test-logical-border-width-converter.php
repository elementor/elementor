<?php

namespace Elementor\Testing\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry;
use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry_Factory;
use Elementor\Modules\AtomicWidgets\CssConverter\Converters\Object_Side_Merge_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Null_Failure_Reporter;
use Elementor\Modules\AtomicWidgets\PropTypes\Border_Width_Prop_Type;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Logical_Border_Width_Converter extends TestCase {

	/**
	 * @dataProvider logical_border_width_cases
	 */
	public function test_logical_longhand__converts_to_border_width_prop(
		string $css,
		array $expected_sides
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
		$this->assertArrayHasKey( 'border-width', $result['props'] );

		$actual_sides = $result['props']['border-width']['value'];

		$this->assertSame( array_keys( $expected_sides ), array_keys( $actual_sides ) );

		foreach ( $expected_sides as $side_key => $expected_size ) {
			$this->assertSame( $expected_size, $actual_sides[ $side_key ]['value']['size'], "Wrong size for {$side_key}" );
		}
	}

	public static function logical_border_width_cases(): array {
		return [
			'single_block_start' => [
				'border-block-start-width: 1px',
				[ 'block-start' => 1 ],
			],
			'single_inline_end' => [
				'border-inline-end-width: 2px',
				[ 'inline-end' => 2 ],
			],
			'single_block_end' => [
				'border-block-end-width: 3px',
				[ 'block-end' => 3 ],
			],
			'single_inline_start' => [
				'border-inline-start-width: 4px',
				[ 'inline-start' => 4 ],
			],
			'all_logical_sides' => [
				'border-block-start-width: 1px; border-inline-end-width: 2px; border-block-end-width: 3px; border-inline-start-width: 4px',
				[ 'block-start' => 1, 'inline-end' => 2, 'block-end' => 3, 'inline-start' => 4 ],
			],
			'logical_overrides_physical_on_same_side' => [
				'border-top-width: 1px; border-block-start-width: 5px',
				[ 'block-start' => 5 ],
			],
		];
	}

	private function make_registry(): Converter_Registry {
		$registry = new Converter_Registry();

		$border_width_specs = array_filter(
			Converter_Registry_Factory::border_side_specs(),
			fn( $spec ) => 'border-width' === $spec[0]
		);

		foreach ( $border_width_specs as $property => [ , $side_key ] ) {
			$registry->register( new Object_Side_Merge_Converter(
				$property,
				'border-width',
				Border_Width_Prop_Type::get_key(),
				$side_key,
				Converter_Registry_Factory::BORDER_WIDTH_SIDE_KEYS,
				Border_Width_Prop_Type::class
			) );
		}

		return $registry;
	}
}
