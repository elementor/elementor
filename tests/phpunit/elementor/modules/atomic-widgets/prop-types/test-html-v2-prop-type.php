<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Html_V2_Prop_Type;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Html_V2_Prop_Type extends TestCase {

	public function test_get_key() {
		$this->assertSame( 'html-v2', Html_V2_Prop_Type::get_key() );
	}

	public function test_validate__valid_value() {
		// Arrange.
		$prop_type = Html_V2_Prop_Type::make();

		// Act.
		$result = $prop_type->validate( [
			'$$type' => 'html-v2',
			'value' => [
				'content' => 'Hello <strong>world</strong>',
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
		$prop_type = Html_V2_Prop_Type::make();

		// Act.
		$result = $prop_type->validate( [
			'$$type' => 'html-v2',
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
		$prop_type = Html_V2_Prop_Type::make();

		// Act.
		$result = $prop_type->validate( [
			'$$type' => 'html-v2',
			'value' => [
				'content' => 'Hello',
				'children' => [],
			],
		] );

		// Assert.
		$this->assertTrue( $result );
	}

	public function test_validate__fails_when_content_missing() {
		// Arrange.
		$prop_type = Html_V2_Prop_Type::make();

		// Act.
		$result = $prop_type->validate( [
			'$$type' => 'html-v2',
			'value' => [
				'children' => [],
			],
		] );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_validate__fails_when_children_missing() {
		// Arrange.
		$prop_type = Html_V2_Prop_Type::make();

		// Act.
		$result = $prop_type->validate( [
			'$$type' => 'html-v2',
			'value' => [
				'content' => 'Hello',
			],
		] );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_validate__fails_when_content_is_not_string_or_null() {
		// Arrange.
		$prop_type = Html_V2_Prop_Type::make();

		// Act.
		$result = $prop_type->validate( [
			'$$type' => 'html-v2',
			'value' => [
				'content' => 123,
				'children' => [],
			],
		] );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_validate__fails_when_children_is_not_array() {
		// Arrange.
		$prop_type = Html_V2_Prop_Type::make();

		// Act.
		$result = $prop_type->validate( [
			'$$type' => 'html-v2',
			'value' => [
				'content' => 'Hello',
				'children' => 'not-an-array',
			],
		] );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_validate__fails_when_value_is_not_array() {
		// Arrange.
		$prop_type = Html_V2_Prop_Type::make();

		// Act.
		$result = $prop_type->validate( [
			'$$type' => 'html-v2',
			'value' => 'plain string',
		] );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_sanitize__strips_disallowed_tags_from_content() {
		// Arrange.
		$prop_type = Html_V2_Prop_Type::make();

		// Act.
		$result = $prop_type->sanitize( [
			'$$type' => 'html-v2',
			'value' => [
				'content' => 'Hello <script>alert("xss")</script><strong>world</strong>',
				'children' => [],
			],
		] );

		// Assert.
		$this->assertSame( 'Hello alert("xss")<strong>world</strong>', $result['value']['content'] );
	}

	public function test_sanitize__preserves_id_attributes_on_inline_elements() {
		// Arrange.
		$prop_type = Html_V2_Prop_Type::make();

		// Act.
		$result = $prop_type->sanitize( [
			'$$type' => 'html-v2',
			'value' => [
				'content' => 'Hello <strong id="e-abc">world</strong>',
				'children' => [],
			],
		] );

		// Assert.
		$this->assertSame( 'Hello <strong id="e-abc">world</strong>', $result['value']['content'] );
	}

	public function test_sanitize__sanitizes_children_type_and_content() {
		// Arrange.
		$prop_type = Html_V2_Prop_Type::make();

		// Act.
		$result = $prop_type->sanitize( [
			'$$type' => 'html-v2',
			'value' => [
				'content' => 'Hello',
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

	public function test_sanitize__sanitizes_nested_children() {
		// Arrange.
		$prop_type = Html_V2_Prop_Type::make();

		// Act.
		$result = $prop_type->sanitize( [
			'$$type' => 'html-v2',
			'value' => [
				'content' => 'Hello',
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
		$prop_type = Html_V2_Prop_Type::make();

		// Act.
		$result = $prop_type->sanitize( [
			'$$type' => 'html-v2',
			'value' => [
				'content' => 'Hello',
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
}
