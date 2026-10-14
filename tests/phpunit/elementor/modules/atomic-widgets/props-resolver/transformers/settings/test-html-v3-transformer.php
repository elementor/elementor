<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropsResolver\Transformers\Settings;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Settings\Html_V3_Transformer;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Html_V3_Transformer extends TestCase {

	public function test_transform__extracts_content_string() {
		// Arrange.
		$transformer = new Html_V3_Transformer();

		// Content is already resolved by recursive shape resolution (plain string).
		$value = [
			'content' => 'Hello <strong>world</strong>',
		];

		// Act.
		$result = $transformer->transform( $value, Props_Resolver_Context::make() );

		// Assert.
		$this->assertSame( 'Hello <strong>world</strong>', $result );
	}

	public function test_transform__returns_empty_string_when_content_is_null() {
		// Arrange.
		$transformer = new Html_V3_Transformer();
		$value = [
			'content' => null,
		];

		// Act.
		$result = $transformer->transform( $value, Props_Resolver_Context::make() );

		// Assert.
		$this->assertSame( '', $result );
	}

	public function test_transform__returns_empty_string_when_content_key_missing() {
		// Arrange.
		$transformer = new Html_V3_Transformer();
		$value = [];

		// Act.
		$result = $transformer->transform( $value, Props_Resolver_Context::make() );

		// Assert.
		$this->assertSame( '', $result );
	}
}
