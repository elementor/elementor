<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Settings_Validator;
use Elementor\Modules\Mcp\Abilities\Utils\V3_Json_Schema_Builder;
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

	public function test_validate__rejects_array_value_on_scalar_slot() {
		// Arrange.
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

	public function test_validate__rejects_non_allowlisted_key_and_shape_error_together() {
		// Arrange.
		$settings = [
			'title' => [ 'not' => 'a scalar' ],
			'color_menu_item' => '#ff0000',
		];

		// Act.
		$result = V3_Settings_Validator::validate( 'theme-post-title', $settings, $this->theme_post_title_config() );

		// Assert.
		$this->assertInstanceOf( \WP_Error::class, $result['error'] );
		$this->assertStringContainsString( 'color_menu_item', $result['error']->get_error_message() );
		$this->assertStringContainsString( 'title', $result['error']->get_error_message() );
		$this->assertStringContainsString( 'invalid shape', $result['error']->get_error_message() );
		$this->assertArrayNotHasKey( 'title', $result['allowed'] );
	}

	public function test_validate__shape_check_matches_builder_for_advertised_schema() {
		// Arrange — same controls stack `Widget_Context_Helper` feeds to `V3_Json_Schema_Builder::build()`.
		$widget_config = $this->theme_post_title_config();
		$settings = [
			'title' => [ 'not' => 'a scalar' ],
			'header_size' => 'h9',
		];
		$allowed_keys = [ 'title', 'header_size' ];

		$advertised_schema = V3_Json_Schema_Builder::build( $widget_config['controls'], $allowed_keys );
		$shape = V3_Json_Schema_Builder::check_settings_shape( $settings, $advertised_schema );

		// Act.
		$validator = V3_Settings_Validator::validate( 'theme-post-title', $settings, $widget_config );

		// Assert — builder shape check and validator agree on rejected keys.
		$this->assertArrayHasKey( 'title', $shape['errors'] );
		$this->assertArrayHasKey( 'header_size', $shape['errors'] );
		$this->assertInstanceOf( \WP_Error::class, $validator['error'] );
		$this->assertArrayNotHasKey( 'title', $validator['allowed'] );
		$this->assertArrayNotHasKey( 'header_size', $validator['allowed'] );
	}

	public function test_validate__rejects_allowlisted_key_without_control_entry() {
		$widget_config = [
			'controls' => [
				'title' => [ 'type' => 'text' ],
			],
		];
		$settings = [
			'title' => 'Hello',
			'link' => [ 'url' => 'https://example.com' ],
		];

		$result = V3_Settings_Validator::validate( 'theme-post-title', $settings, $widget_config );

		$this->assertInstanceOf( \WP_Error::class, $result['error'] );
		$this->assertStringContainsString( 'link', $result['error']->get_error_message() );
		$this->assertStringContainsString( 'no schema for allowlisted key', $result['error']->get_error_message() );
		$this->assertSame( 'Hello', $result['allowed']['title'] );
		$this->assertArrayNotHasKey( 'link', $result['allowed'] );
	}

	public function test_validate__rejects_all_keys_when_controls_are_missing() {
		$settings = [
			'title' => 'Hello',
			'header_size' => 'h2',
		];

		$result = V3_Settings_Validator::validate( 'theme-post-title', $settings, [] );

		$this->assertInstanceOf( \WP_Error::class, $result['error'] );
		$this->assertStringContainsString( 'title', $result['error']->get_error_message() );
		$this->assertStringContainsString( 'header_size', $result['error']->get_error_message() );
		$this->assertSame( [], $result['allowed'] );
	}
}
