<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Html_V3_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Html_V3_Prop_Type extends TestCase {

	public function test_get_key() {
		$this->assertSame( 'html-v3', Html_V3_Prop_Type::get_key() );
	}

	public function test_validate__valid_value() {
		// Arrange.
		$prop_type = Html_V3_Prop_Type::make();

		// Act.
		$result = $prop_type->validate( [
			'$$type' => 'html-v3',
			'value' => [
				'content' => String_Prop_Type::generate( 'Hello <strong>world</strong>' ),
				'children' => [
					[ 'id' => 'e-abc', 'type' => 'strong', 'content' => 'world' ],
				],
			],
		] );

		// Assert.
		$this->assertTrue( $result );
	}

	public function test_validate__valid_with_null_content() {
		// Arrange.
		$prop_type = Html_V3_Prop_Type::make();

		// Act.
		$result = $prop_type->validate( [
			'$$type' => 'html-v3',
			'value' => [
				'content' => null,
				'children' => [],
			],
		] );

		// Assert.
		$this->assertTrue( $result );
	}

	public function test_validate__valid_with_empty_children() {
		// Arrange.
		$prop_type = Html_V3_Prop_Type::make();

		// Act.
		$result = $prop_type->validate( [
			'$$type' => 'html-v3',
			'value' => [
				'content' => String_Prop_Type::generate( 'Hello' ),
				'children' => [],
			],
		] );

		// Assert.
		$this->assertTrue( $result );
	}

	public function test_validate__fails_when_content_missing() {
		// Arrange.
		$prop_type = Html_V3_Prop_Type::make();

		// Act.
		$result = $prop_type->validate( [
			'$$type' => 'html-v3',
			'value' => [
				'children' => [],
			],
		] );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_validate__fails_when_children_missing() {
		// Arrange.
		$prop_type = Html_V3_Prop_Type::make();

		// Act.
		$result = $prop_type->validate( [
			'$$type' => 'html-v3',
			'value' => [
				'content' => String_Prop_Type::generate( 'Hello' ),
			],
		] );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_validate__fails_when_content_is_plain_string() {
		// Arrange.
		$prop_type = Html_V3_Prop_Type::make();

		// Act.
		$result = $prop_type->validate( [
			'$$type' => 'html-v3',
			'value' => [
				'content' => 'plain string',
				'children' => [],
			],
		] );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_validate__fails_when_content_has_wrong_type() {
		// Arrange.
		$prop_type = Html_V3_Prop_Type::make();

		// Act.
		$result = $prop_type->validate( [
			'$$type' => 'html-v3',
			'value' => [
				'content' => [ '$$type' => 'number', 'value' => 123 ],
				'children' => [],
			],
		] );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_validate__fails_when_content_value_is_not_string() {
		// Arrange.
		$prop_type = Html_V3_Prop_Type::make();

		// Act.
		$result = $prop_type->validate( [
			'$$type' => 'html-v3',
			'value' => [
				'content' => [ '$$type' => 'string', 'value' => 123 ],
				'children' => [],
			],
		] );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_validate__fails_when_children_is_not_array() {
		// Arrange.
		$prop_type = Html_V3_Prop_Type::make();

		// Act.
		$result = $prop_type->validate( [
			'$$type' => 'html-v3',
			'value' => [
				'content' => String_Prop_Type::generate( 'Hello' ),
				'children' => 'not-an-array',
			],
		] );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_validate__fails_when_value_is_not_array() {
		// Arrange.
		$prop_type = Html_V3_Prop_Type::make();

		// Act.
		$result = $prop_type->validate( [
			'$$type' => 'html-v3',
			'value' => 'plain string',
		] );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_sanitize__strips_disallowed_tags_from_content() {
		// Arrange.
		$prop_type = Html_V3_Prop_Type::make();

		// Act.
		$result = $prop_type->sanitize( [
			'$$type' => 'html-v3',
			'value' => [
				'content' => String_Prop_Type::generate( 'Hello <script>alert("xss")</script><strong>world</strong>' ),
				'children' => [],
			],
		] );

		// Assert.
		$this->assertSame( 'Hello alert("xss")<strong>world</strong>', $result['value']['content']['value'] );
	}

	public function test_sanitize__preserves_id_attributes_on_inline_elements() {
		// Arrange.
		$prop_type = Html_V3_Prop_Type::make();

		// Act.
		$result = $prop_type->sanitize( [
			'$$type' => 'html-v3',
			'value' => [
				'content' => String_Prop_Type::generate( 'Hello <strong id="e-abc">world</strong>' ),
				'children' => [],
			],
		] );

		// Assert.
		$this->assertSame( 'Hello <strong id="e-abc">world</strong>', $result['value']['content']['value'] );
	}

	public function test_sanitize__sanitizes_children_type_and_content() {
		// Arrange.
		$prop_type = Html_V3_Prop_Type::make();

		// Act.
		$result = $prop_type->sanitize( [
			'$$type' => 'html-v3',
			'value' => [
				'content' => String_Prop_Type::generate( 'Hello' ),
				'children' => [
					[
						'id' => 'e-abc',
						'type' => '<script>span',
						'content' => '<b>bold</b> text',
					],
				],
			],
		] );

		// Assert.
		$this->assertSame( 'e-abc', $result['value']['children'][0]['id'] );
		$this->assertSame( 'span', $result['value']['children'][0]['type'] );
		$this->assertSame( 'bold text', $result['value']['children'][0]['content'] );
	}

	public function test_sanitize__traverses_nested_children() {
		// Arrange.
		$prop_type = Html_V3_Prop_Type::make();

		// Act.
		$result = $prop_type->sanitize( [
			'$$type' => 'html-v3',
			'value' => [
				'content' => String_Prop_Type::generate( 'Hello' ),
				'children' => [
					[
						'id' => 'e-1',
						'type' => 'span',
						'children' => [
							[
								'id' => 'e-2',
								'type' => 'em',
								'content' => 'nested',
							],
						],
					],
				],
			],
		] );

		// Assert.
		$this->assertSame( 'em', $result['value']['children'][0]['children'][0]['type'] );
		$this->assertSame( 'nested', $result['value']['children'][0]['children'][0]['content'] );
	}

	public function test_sanitize__skips_non_array_children() {
		// Arrange.
		$prop_type = Html_V3_Prop_Type::make();

		// Act.
		$result = $prop_type->sanitize( [
			'$$type' => 'html-v3',
			'value' => [
				'content' => String_Prop_Type::generate( 'Hello' ),
				'children' => [
					'not-an-array',
					[ 'id' => 'e-2', 'type' => 'span' ],
				],
			],
		] );

		// Assert.
		$this->assertCount( 1, $result['value']['children'] );
		$this->assertSame( 'e-2', $result['value']['children'][0]['id'] );
	}

	public function test_sanitize__handles_null_content() {
		// Arrange.
		$prop_type = Html_V3_Prop_Type::make();

		// Act.
		$result = $prop_type->sanitize( [
			'$$type' => 'html-v3',
			'value' => [
				'content' => null,
				'children' => [],
			],
		] );

		// Assert.
		$this->assertNull( $result['value']['content'] );
	}
}
