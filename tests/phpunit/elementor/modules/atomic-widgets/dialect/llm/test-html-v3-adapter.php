<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Dialect\Llm;

use Elementor\Modules\AtomicWidgets\PropTypes\Dialect\Adapter_Context;
use Elementor\Modules\AtomicWidgets\PropTypes\Dialect\Dialect_Walker;
use Elementor\Modules\AtomicWidgets\PropTypes\Dialect\Llm\Html_V3_Adapter;
use Elementor\Modules\AtomicWidgets\PropTypes\Html_V3_Prop_Type;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Html_V3_Adapter extends TestCase {
	private function make_prop_type() {
		return Html_V3_Prop_Type::make()->default( [
			'content'  => [ '$$type' => 'string', 'value' => 'Default text' ],
			'children' => [],
		] );
	}

	public function test_to_schema_returns_string_type_with_description() {
		// Arrange
		$prop_type = $this->make_prop_type();

		// Act
		$schema = Dialect_Walker::to_schema( $prop_type, 'llm' );

		// Assert
		$this->assertSame( 'string', $schema['type'] );
		$this->assertStringContainsString( 'innerHTML', $schema['description'] );
		$this->assertStringContainsString( 'READ CAREFULLY', $schema['llm_instructions'] );
	}

	public function test_to_dialect_value_extracts_content_string() {
		// Arrange
		$prop_type = $this->make_prop_type();
		$canonical = Html_V3_Prop_Type::generate( [
			'content'  => [ '$$type' => 'string', 'value' => 'Hello <b>world</b>' ],
			'children' => [],
		] );
		$ctx = new Adapter_Context( $prop_type, [] );

		// Act
		$result = Html_V3_Adapter::to_dialect_value( $ctx, $canonical );

		// Assert
		$this->assertSame( 'Hello <b>world</b>', $result );
	}

	public function test_to_dialect_value_returns_default_when_null() {
		// Arrange
		$prop_type = $this->make_prop_type();
		$ctx = new Adapter_Context( $prop_type, [] );

		// Act
		$result = Html_V3_Adapter::to_dialect_value( $ctx, null );

		// Assert
		$this->assertSame( 'Default text', $result );
	}

	public function test_to_canonical_value_wraps_string() {
		// Arrange
		$prop_type = $this->make_prop_type();
		$ctx = new Adapter_Context( $prop_type, [] );

		// Act
		$result = Html_V3_Adapter::to_canonical_value( $ctx, 'Hello <b>world</b>' );

		// Assert
		$this->assertSame( 'html-v3', $result['$$type'] );
		$this->assertSame( 'Hello <b>world</b>', $result['value']['content']['value'] );
		$this->assertSame( [], $result['value']['children'] );
	}

	public function test_to_canonical_value_returns_null_when_null() {
		// Arrange
		$prop_type = $this->make_prop_type();
		$ctx = new Adapter_Context( $prop_type, [] );

		// Act
		$result = Html_V3_Adapter::to_canonical_value( $ctx, null );

		// Assert
		$this->assertNull( $result );
	}
}
