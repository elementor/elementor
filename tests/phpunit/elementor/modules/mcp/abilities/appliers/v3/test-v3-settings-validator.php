<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Settings_Validator;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Settings_Validator extends TestCase {

	private function theme_post_title_config(): array {
		return [
			'controls' => [
				'title' => [ 'type' => 'text' ],
				'header_size' => [
					'type' => 'select',
					'options' => [ 'h1' => 'H1', 'h2' => 'H2', 'h3' => 'H3' ],
				],
			],
		];
	}

	public function test_validate__passes_plain_valid_primitive_through() {
		// Arrange.
		$settings = [
			'title' => 'Hello world',
			'header_size' => 'h2',
		];

		// Act.
		$result = V3_Settings_Validator::validate( 'theme-post-title', $settings, $this->theme_post_title_config() );

		// Assert.
		$this->assertNull( $result['error'] );
		$this->assertSame( 'Hello world', $result['allowed']['title'] );
		$this->assertSame( 'h2', $result['allowed']['header_size'] );
	}

	public function test_validate__rejects_array_value_on_a_scalar_slot_with_shape_error() {
		// Arrange — array smuggled into a scalar slot.
		$settings = [
			'title' => [ 'not' => 'a scalar' ],
		];

		// Act.
		$result = V3_Settings_Validator::validate( 'theme-post-title', $settings, $this->theme_post_title_config() );

		// Assert.
		$this->assertInstanceOf( \WP_Error::class, $result['error'] );
		$this->assertStringContainsString( 'title', $result['error']->get_error_message() );
		$this->assertStringContainsString( 'invalid shape', $result['error']->get_error_message() );
		$this->assertArrayNotHasKey( 'title', $result['allowed'] );
	}

	public function test_validate__rejects_enum_violation() {
		// Arrange.
		$settings = [ 'header_size' => 'h9' ];

		// Act.
		$result = V3_Settings_Validator::validate( 'theme-post-title', $settings, $this->theme_post_title_config() );

		// Assert.
		$this->assertInstanceOf( \WP_Error::class, $result['error'] );
		$this->assertStringContainsString( 'header_size', $result['error']->get_error_message() );
	}

	public function test_validate__rejects_unknown_key_via_allowlist() {
		// Arrange.
		$settings = [
			'title_color' => '#ff0000',
			'title' => 'Hello',
		];

		// Act.
		$result = V3_Settings_Validator::validate( 'theme-post-title', $settings, $this->theme_post_title_config() );

		// Assert — allowlist error is folded into the aggregate.
		$this->assertInstanceOf( \WP_Error::class, $result['error'] );
		$this->assertStringContainsString( 'title_color', $result['error']->get_error_message() );
		$this->assertSame( 'Hello', $result['allowed']['title'] );
	}
}
