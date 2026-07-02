<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropsResolver\Transformers\Settings;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Settings\Html_V2_Transformer;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Html_V2_Transformer extends TestCase {

	public function test_transform__extracts_content_string() {
		// Arrange.
		$transformer = new Html_V2_Transformer();
		$value = [
			'content' => 'Hello <strong>world</strong>',
			'children' => [
				[ 'id' => 'e-abc', 'type' => 'strong', 'content' => 'world' ],
			],
		];

		// Act.
		$result = $transformer->transform( $value, Props_Resolver_Context::make() );

		// Assert.
		$this->assertSame( 'Hello <strong>world</strong>', $result );
	}

	public function test_transform__returns_empty_string_when_content_is_null() {
		// Arrange.
		$transformer = new Html_V2_Transformer();
		$value = [
			'content' => null,
			'children' => [],
		];

		// Act.
		$result = $transformer->transform( $value, Props_Resolver_Context::make() );

		// Assert.
		$this->assertSame( '', $result );
	}

	public function test_transform__returns_empty_string_when_content_key_missing() {
		// Arrange.
		$transformer = new Html_V2_Transformer();
		$value = [
			'children' => [],
		];

		// Act.
		$result = $transformer->transform( $value, Props_Resolver_Context::make() );

		// Assert.
		$this->assertSame( '', $result );
	}

	public function test_transform__ignores_children_in_output() {
		// Arrange.
		$transformer = new Html_V2_Transformer();
		$value = [
			'content' => 'text',
			'children' => [
				[ 'id' => 'e-1', 'type' => 'span', 'content' => 'should not appear' ],
			],
		];

		// Act.
		$result = $transformer->transform( $value, Props_Resolver_Context::make() );

		// Assert.
		$this->assertSame( 'text', $result );
		$this->assertStringNotContainsString( 'should not appear', $result );
	}
}
