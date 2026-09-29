<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Control_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Resolved_Patch_Validator;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Resolved_Patch_Validator extends TestCase {

	public function test_validate__accepts_valid_simple_string_destination() {
		$descriptor = Style_Control_Target::control( 'title_color', 'color' );

		$result = V3_Resolved_Patch_Validator::validate( $descriptor, [ 'title_color' => '#ff0000' ] );

		$this->assertTrue( $result['valid'] );
		$this->assertSame( [], $result['invalid_destinations'] );
	}

	public function test_validate__rejects_when_destination_key_missing() {
		$descriptor = Style_Control_Target::control( 'title_color', 'color' );

		$result = V3_Resolved_Patch_Validator::validate( $descriptor, [] );

		$this->assertFalse( $result['valid'] );
		$this->assertSame( [ 'title_color' ], $result['invalid_destinations'] );
		$this->assertSame( 'missing_destination', $result['reason'] );
	}

	public function test_validate__rejects_when_destination_value_is_null() {
		$descriptor = Style_Control_Target::control( 'title_color', 'color' );

		$result = V3_Resolved_Patch_Validator::validate( $descriptor, [ 'title_color' => null ] );

		$this->assertFalse( $result['valid'] );
		$this->assertSame( 'invalid_shape', $result['reason'] );
	}

	public function test_validate__rejects_non_string_value_for_string_shape() {
		$descriptor = Style_Control_Target::control( 'title_color', 'color' );

		$result = V3_Resolved_Patch_Validator::validate( $descriptor, [ 'title_color' => [ 'not a string' ] ] );

		$this->assertFalse( $result['valid'] );
		$this->assertSame( 'invalid_shape', $result['reason'] );
	}

	public function test_validate__accepts_empty_string_as_clear_intent() {
		$descriptor = Style_Control_Target::control( 'title_color', 'color' );

		$result = V3_Resolved_Patch_Validator::validate( $descriptor, [ 'title_color' => '' ] );

		$this->assertTrue( $result['valid'] );
	}

	public function test_validate__multi_destination_all_present_is_valid() {
		$descriptor = [
			'kind' => 'simple',
			'destinations' => [
				[ 'setting' => 'font_family', 'shape' => 'string', 'resolver' => 'text' ],
				[ 'setting' => 'font_size', 'shape' => 'dimension', 'resolver' => 'dimension' ],
			],
		];

		$result = V3_Resolved_Patch_Validator::validate( $descriptor, [
			'font_family' => 'Arial',
			'font_size' => [ 'size' => 16, 'unit' => 'px' ],
		] );

		$this->assertTrue( $result['valid'] );
	}

	public function test_validate__multi_destination_one_missing_is_atomic_reject() {
		$descriptor = [
			'kind' => 'simple',
			'destinations' => [
				[ 'setting' => 'font_family', 'shape' => 'string', 'resolver' => 'text' ],
				[ 'setting' => 'font_size', 'shape' => 'dimension', 'resolver' => 'dimension' ],
			],
		];

		$result = V3_Resolved_Patch_Validator::validate( $descriptor, [
			'font_family' => 'Arial',
		] );

		$this->assertFalse( $result['valid'] );
		$this->assertContains( 'font_size', $result['invalid_destinations'] );
	}

	public function test_validate__dimension_shape_rejects_non_array() {
		$descriptor = [
			'kind' => 'simple',
			'destinations' => [
				[ 'setting' => 'padding', 'shape' => 'dimension', 'resolver' => 'dimension' ],
			],
		];

		$result = V3_Resolved_Patch_Validator::validate( $descriptor, [ 'padding' => '16px' ] );

		$this->assertFalse( $result['valid'] );
		$this->assertSame( 'invalid_shape', $result['reason'] );
	}

	public function test_validate__dimension_shape_accepts_size_unit_array() {
		$descriptor = [
			'kind' => 'simple',
			'destinations' => [
				[ 'setting' => 'padding', 'shape' => 'dimension', 'resolver' => 'dimension' ],
			],
		];

		$result = V3_Resolved_Patch_Validator::validate( $descriptor, [ 'padding' => [ 'size' => 16, 'unit' => 'px' ] ] );

		$this->assertTrue( $result['valid'] );
	}

	public function test_validate__sides_shape_requires_full_object() {
		$descriptor = [
			'kind' => 'simple',
			'destinations' => [
				[ 'setting' => 'border_radius', 'shape' => 'sides', 'resolver' => 'sides' ],
			],
		];

		$missing_fields = V3_Resolved_Patch_Validator::validate( $descriptor, [ 'border_radius' => [ 'top' => '4', 'unit' => 'px' ] ] );
		$this->assertFalse( $missing_fields['valid'] );

		$full = V3_Resolved_Patch_Validator::validate( $descriptor, [
			'border_radius' => [
				'top' => '4', 'right' => '4', 'bottom' => '4', 'left' => '4', 'unit' => 'px', 'isLinked' => true,
			],
		] );
		$this->assertTrue( $full['valid'] );
	}

	public function test_validate__unknown_shape_is_rejected() {
		$descriptor = [
			'kind' => 'simple',
			'destinations' => [
				[ 'setting' => 'x', 'shape' => 'mystery', 'resolver' => 'text' ],
			],
		];

		$result = V3_Resolved_Patch_Validator::validate( $descriptor, [ 'x' => 'value' ] );

		$this->assertFalse( $result['valid'] );
		$this->assertSame( 'unknown_shape', $result['reason'] );
	}

	public function test_validate__empty_descriptor_destinations_is_rejected() {
		$descriptor = [ 'kind' => 'simple', 'destinations' => [] ];

		$result = V3_Resolved_Patch_Validator::validate( $descriptor, [] );

		$this->assertFalse( $result['valid'] );
		$this->assertSame( 'empty_destinations', $result['reason'] );
	}
}
