<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Dynamic_Resolver;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Dynamic_Resolver extends TestCase {

	public function test_is_dynamic_capable__returns_false_when_control_has_no_dynamic_config() {
		// Arrange.
		$control = [ 'type' => 'text' ];

		// Act.
		$result = V3_Dynamic_Resolver::is_dynamic_capable( $control );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_is_dynamic_capable__returns_true_when_dynamic_active_is_true() {
		// Arrange.
		$control = [ 'type' => 'text', 'dynamic' => [ 'active' => true ] ];

		// Act.
		$result = V3_Dynamic_Resolver::is_dynamic_capable( $control );

		// Assert.
		$this->assertTrue( $result );
	}

	public function test_is_dynamic_capable__returns_true_when_dynamic_default_is_non_empty_string() {
		// Arrange.
		$control = [ 'type' => 'text', 'dynamic' => [ 'default' => 'post-title' ] ];

		// Act.
		$result = V3_Dynamic_Resolver::is_dynamic_capable( $control );

		// Assert.
		$this->assertTrue( $result );
	}

	public function test_extract_input__returns_null_for_scalar_value() {
		// Arrange.
		$control = [ 'type' => 'text', 'dynamic' => [ 'active' => true, 'categories' => [ 'text' ] ] ];

		// Act.
		$result = V3_Dynamic_Resolver::extract_input( 'Hello world', null );

		// Assert.
		$this->assertNull( $result );
	}

	public function test_extract_input__extracts_top_level_dynamic_shape() {
		// Arrange.
		$value = [ 'name' => 'post-title', 'settings' => [ 'fallback' => 'Hi' ] ];

		// Act.
		$result = V3_Dynamic_Resolver::extract_input( $value, null );

		// Assert.
		$this->assertSame(
			[
				'name' => 'post-title',
				'settings' => [ 'fallback' => 'Hi' ],
			],
			$result
		);
	}

	public function test_extract_input__extracts_nested_dynamic_on_url_control_property() {
		// Arrange.
		$value = [
			'url' => [ 'name' => 'post-url', 'settings' => [] ],
		];

		// Act.
		$result = V3_Dynamic_Resolver::extract_input( $value, 'url' );

		// Assert.
		$this->assertSame(
			[
				'name' => 'post-url',
				'settings' => [],
			],
			$result
		);
	}

	public function test_extract_input__returns_null_when_nested_property_is_missing() {
		// Arrange.
		$value = [ 'is_external' => 'on' ];

		// Act.
		$result = V3_Dynamic_Resolver::extract_input( $value, 'url' );

		// Assert.
		$this->assertNull( $result );
	}
}
