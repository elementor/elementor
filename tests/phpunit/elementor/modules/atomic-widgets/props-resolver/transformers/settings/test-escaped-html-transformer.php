<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropsResolver\Transformers\Settings;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Settings\Escaped_Html_Transformer;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Escaped_Html_Transformer extends TestCase {

	public function test_transform__returns_allowed_html_unchanged() {
		// Arrange.
		$transformer = new Escaped_Html_Transformer();

		// Act.
		$result = $transformer->transform( 'Hello <strong>world</strong>', Props_Resolver_Context::make() );

		// Assert.
		$this->assertSame( 'Hello <strong>world</strong>', $result );
	}

	public function test_transform__strips_disallowed_tags() {
		// Arrange.
		$transformer = new Escaped_Html_Transformer();

		// Act.
		$result = $transformer->transform( 'Hello <script>alert("xss")</script><strong>world</strong>', Props_Resolver_Context::make() );

		// Assert.
		$this->assertSame( 'Hello alert("xss")<strong>world</strong>', $result );
	}

	public function test_transform__keeps_non_operational_attributes_and_strips_event_handlers() {
		// Arrange.
		$transformer = new Escaped_Html_Transformer();

		// Act.
		$result = $transformer->transform(
			'<strong id="e-abc" class="x" data-foo="bar" style="color:red" title="t" onclick="evil()">world</strong>',
			Props_Resolver_Context::make()
		);

		// Assert.
		$this->assertStringContainsString( 'id="e-abc"', $result );
		$this->assertStringContainsString( 'class="x"', $result );
		$this->assertStringContainsString( 'data-foo="bar"', $result );
		$this->assertStringContainsString( 'style=', $result );
		$this->assertStringContainsString( 'title="t"', $result );
		$this->assertStringNotContainsString( 'onclick', $result );
		$this->assertStringContainsString( 'world', $result );
	}

	public function test_transform__strips_javascript_href_from_links() {
		// Arrange.
		$transformer = new Escaped_Html_Transformer();

		// Act.
		$result = $transformer->transform( '<a href="javascript:alert(1)">click</a>', Props_Resolver_Context::make() );

		// Assert.
		$this->assertStringNotContainsString( 'javascript:', $result );
		$this->assertStringContainsString( 'click', $result );
	}

	public function test_transform__returns_empty_string_when_value_is_null() {
		// Arrange.
		$transformer = new Escaped_Html_Transformer();

		// Act.
		$result = $transformer->transform( null, Props_Resolver_Context::make() );

		// Assert.
		$this->assertSame( '', $result );
	}

	public function test_transform__returns_empty_string_when_value_is_not_a_string() {
		// Arrange.
		$transformer = new Escaped_Html_Transformer();

		// Act.
		$result = $transformer->transform( [ 'not', 'a', 'string' ], Props_Resolver_Context::make() );

		// Assert.
		$this->assertSame( '', $result );
	}
}
