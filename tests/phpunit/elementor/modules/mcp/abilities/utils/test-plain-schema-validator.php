<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Utils;

use Elementor\Modules\Mcp\Abilities\Utils\Plain_Schema_Validator;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Plain_Schema_Validator extends TestCase {

	const BOOLEAN_SCHEMA = [ 'type' => 'boolean' ];

	const ICON_SCHEMA = [
		'type' => 'object',
		'properties' => [
			'value' => [
				'type' => 'string',
				'pattern' => '^[A-Za-z0-9 _-]*$',
			],
		],
		'additionalProperties' => false,
	];

	public function test_validate__converts_a_boolean_string_to_the_boolean_it_names() {
		// Act.
		$result = Plain_Schema_Validator::strict()->validate( 'false', self::BOOLEAN_SCHEMA, 'show_labels' );

		// Assert.
		$this->assertNull( $result['error'] );
		$this->assertFalse( $result['value'] );
	}

	public function test_validate__rejects_a_value_that_does_not_name_a_boolean() {
		// Act.
		$result = Plain_Schema_Validator::strict()->validate( 'no', self::BOOLEAN_SCHEMA, 'show_labels' );

		// Assert.
		$this->assertSame( 'show_labels is not of type boolean', $result['error'] );
	}

	public function test_validate__reports_the_range_keyword_that_failed() {
		// Arrange.
		$schema = [
			'type' => 'number',
			'minimum' => 1,
			'maximum' => 24,
		];

		// Act.
		$result = Plain_Schema_Validator::strict()->validate( 100, $schema, 'columns' );

		// Assert.
		$this->assertSame( 'columns must be between 1 (inclusive) and 24 (inclusive)', $result['error'] );
	}

	public function test_validate__names_the_nested_path_that_broke_the_pattern() {
		// Act.
		$result = Plain_Schema_Validator::strict()->validate( [ 'value' => '"><b>' ], self::ICON_SCHEMA, 'icon' );

		// Assert.
		$this->assertStringContainsString( 'icon[value] does not match pattern', $result['error'] );
	}

	public function test_validate__strict_rejects_keys_the_schema_does_not_list() {
		// Act.
		$result = Plain_Schema_Validator::strict()->validate( [ 'value' => 'fas fa-star', 'color' => 'red' ], self::ICON_SCHEMA, 'icon' );

		// Assert.
		$this->assertSame( 'color is not a valid property of Object', $result['error'] );
	}

	public function test_validate__lenient_keeps_unlisted_keys_for_the_caller_to_drop() {
		// Act.
		$result = Plain_Schema_Validator::lenient()->validate( [ 'value' => 'fas fa-star', 'color' => 'red' ], self::ICON_SCHEMA, 'icon' );

		// Assert.
		$this->assertNull( $result['error'] );
		$this->assertSame( [ 'value' => 'fas fa-star', 'color' => 'red' ], $result['value'] );
	}

	public function test_validate__lenient_accepts_a_number_for_a_string() {
		// Act.
		$result = Plain_Schema_Validator::lenient()->validate( 2, [ 'type' => 'string' ], 'title' );

		// Assert.
		$this->assertNull( $result['error'] );
		$this->assertEquals( 2, $result['value'] );
	}

	public function test_validate__lenient_reads_a_nested_null_as_not_set() {
		// Arrange.
		$schema = [
			'type' => 'object',
			'properties' => [
				'id' => [ 'type' => 'number' ],
				'size' => [
					'type' => 'string',
					'enum' => [ 'full', 'thumbnail' ],
				],
			],
		];

		// Act.
		$lenient = Plain_Schema_Validator::lenient()->validate( [ 'id' => null, 'size' => null ], $schema, 'image' );
		$strict = Plain_Schema_Validator::strict()->validate( [ 'id' => null ], $schema, 'image' );

		// Assert.
		$this->assertNull( $lenient['error'] );
		$this->assertSame( 'image[id] is not of type number', $strict['error'] );
	}

	public function test_validate__strict_rejects_a_number_for_a_string() {
		// Act.
		$result = Plain_Schema_Validator::strict()->validate( 2, [ 'type' => 'string' ], 'title' );

		// Assert.
		$this->assertSame( 'title is not of type string', $result['error'] );
	}

	public function test_validate__lenient_passes_prop_value_envelopes_through_untouched() {
		// Arrange.
		$envelope = [
			'$$type' => 'string',
			'value' => 'Hello',
		];

		// Act.
		$result = Plain_Schema_Validator::lenient()->validate( $envelope, [ 'type' => 'string' ], 'title' );

		// Assert.
		$this->assertNull( $result['error'] );
		$this->assertSame( $envelope, $result['value'] );
	}

	public function test_validate__reports_the_matching_branch_reason_inside_any_of() {
		// Arrange.
		$schema = [
			'anyOf' => [
				[
					'type' => 'string',
					'pattern' => '^\d{4}-\d{2}-\d{2}$',
				],
				[
					'type' => 'object',
					'properties' => [ 'name' => [ 'type' => 'string' ] ],
				],
			],
		];

		// Act.
		$result = Plain_Schema_Validator::strict()->validate( 'next friday', $schema, 'due_date' );

		// Assert.
		$this->assertStringContainsString( 'due_date does not match pattern', $result['error'] );
	}

	public function test_validate__accepts_anything_where_the_schema_declares_no_type() {
		// Arrange.
		$schema = [
			'type' => 'object',
			'properties' => [ 'anything' => [] ],
		];

		// Act.
		$result = Plain_Schema_Validator::strict()->validate( [ 'anything' => [ 1, 'two' ] ], $schema, 'unknown' );

		// Assert.
		$this->assertNull( $result['error'] );
	}
}
