<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Escaped_Html_Prop_Type;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Escaped_Html_Prop_Type extends TestCase {

	public function test_get_key() {
		// Arrange.
		$prop_type = Escaped_Html_Prop_Type::make();

		// Assert.
		$this->assertSame( 'escaped-html', Escaped_Html_Prop_Type::get_key() );
		$this->assertSame( 'escaped-html', $prop_type->get_key() );
	}

	public function test_generate__produces_typed_envelope() {
		// Act.
		$result = Escaped_Html_Prop_Type::generate( 'Hello <strong>world</strong>' );

		// Assert.
		$this->assertSame( 'escaped-html', $result['$$type'] );
		$this->assertSame( 'Hello <strong>world</strong>', $result['value'] );
	}

	public function test_validate__valid_with_string_value() {
		// Arrange.
		$prop_type = Escaped_Html_Prop_Type::make();

		// Act.
		$result = $prop_type->validate( [
			'$$type' => 'escaped-html',
			'value' => 'Hello <strong>world</strong>',
		] );

		// Assert.
		$this->assertTrue( $result );
	}

	public function test_validate__accepts_null_when_not_required() {
		// Arrange.
		$prop_type = Escaped_Html_Prop_Type::make();

		// Act.
		$result = $prop_type->validate( null );

		// Assert.
		$this->assertTrue( $result );
	}

	public function test_validate__fails_when_value_is_not_a_string() {
		// Arrange.
		$prop_type = Escaped_Html_Prop_Type::make();

		// Act.
		$result = $prop_type->validate( [
			'$$type' => 'escaped-html',
			'value' => 5,
		] );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_validate__fails_when_type_mismatches() {
		// Arrange.
		$prop_type = Escaped_Html_Prop_Type::make();

		// Act.
		$result = $prop_type->validate( [
			'$$type' => 'html-v3',
			'value' => 'Hello',
		] );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_sanitize__strips_disallowed_tags_but_keeps_inner_text() {
		// Arrange.
		$prop_type = Escaped_Html_Prop_Type::make();

		// Act.
		$result = $prop_type->sanitize( [
			'$$type' => 'escaped-html',
			'value' => 'Hello <script>alert("xss")</script><strong>world</strong>',
		] );

		// Assert.
		$this->assertSame( 'Hello alert("xss")<strong>world</strong>', $result['value'] );
	}

	public function test_sanitize__strips_id_attribute_from_inline_elements() {
		// Arrange.
		$prop_type = Escaped_Html_Prop_Type::make();

		// Act.
		$result = $prop_type->sanitize( [
			'$$type' => 'escaped-html',
			'value' => 'Hello <strong id="e-abc">world</strong>',
		] );

		// Assert.
		$this->assertSame( 'Hello <strong>world</strong>', $result['value'] );
	}

	public function test_sanitize__preserves_allowed_inline_tags_and_link_attributes() {
		// Arrange.
		$prop_type = Escaped_Html_Prop_Type::make();

		// Act.
		$result = $prop_type->sanitize( [
			'$$type' => 'escaped-html',
			'value' => '<b>bold</b> <em>em</em> <a href="https://example.com" target="_blank">link</a>',
		] );

		// Assert.
		$this->assertSame( '<b>bold</b> <em>em</em> <a href="https://example.com" target="_blank">link</a>', $result['value'] );
	}

	public function test_sanitize__preserves_leading_and_trailing_whitespace() {
		// Arrange.
		$prop_type = Escaped_Html_Prop_Type::make();

		// Act.
		$result = $prop_type->sanitize( [
			'$$type' => 'escaped-html',
			'value' => '  Hello <strong>world</strong>  ',
		] );

		// Assert.
		$this->assertSame( '  Hello <strong>world</strong>  ', $result['value'] );
	}

	public function test_sanitize__allows_block_tags_from_wrapper_list() {
		// Arrange.
		$prop_type = Escaped_Html_Prop_Type::make();

		// Act.
		$result = $prop_type->sanitize( [
			'$$type' => 'escaped-html',
			'value' => '<div>block</div> <strong>inline</strong>',
		] );

		// Assert.
		$this->assertSame( '<div>block</div> <strong>inline</strong>', $result['value'] );
	}

	public function test_sanitize__strips_javascript_href_from_links() {
		// Arrange.
		$prop_type = Escaped_Html_Prop_Type::make();

		// Act.
		$result = $prop_type->sanitize( [
			'$$type' => 'escaped-html',
			'value' => '<a href="javascript:alert(1)">click</a>',
		] );

		// Assert.
		$this->assertStringNotContainsString( 'javascript:', $result['value'] );
		$this->assertStringContainsString( 'click', $result['value'] );
	}

	public function test_sanitize__strips_data_href_from_links() {
		// Arrange.
		$prop_type = Escaped_Html_Prop_Type::make();

		// Act.
		$result = $prop_type->sanitize( [
			'$$type' => 'escaped-html',
			'value' => '<a href="data:text/html,<script>alert(1)</script>">click</a>',
		] );

		// Assert.
		$this->assertStringNotContainsString( 'data:text/html', $result['value'] );
		$this->assertStringContainsString( 'click', $result['value'] );
	}

	public function test_json_schema__exposes_value_as_string_for_llms() {
		// Arrange.
		$prop_type = Escaped_Html_Prop_Type::make();

		// Act.
		$schema = $prop_type->to_json_schema();

		// Assert.
		$this->assertSame( 'object', $schema['type'] );
		$this->assertSame( 'escaped-html', $schema['properties']['$$type']['const'] );
		$this->assertSame( 'string', $schema['properties']['value']['type'] );
	}
}
