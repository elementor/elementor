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

	public function test_validate_shape__passes_plain_valid_primitive_through() {
		$primitives = [
			'title' => 'Hello world',
			'header_size' => 'h2',
		];

		$result = V3_Settings_Validator::validate_shape( 'theme-post-title', $primitives, $this->theme_post_title_config() );

		$this->assertNull( $result['error'] );
		$this->assertSame( 'Hello world', $result['valid']['title'] );
		$this->assertSame( 'h2', $result['valid']['header_size'] );
	}

	public function test_validate_shape__rejects_array_value_on_scalar_slot() {
		$primitives = [ 'title' => [ 'not' => 'a scalar' ] ];

		$result = V3_Settings_Validator::validate_shape( 'theme-post-title', $primitives, $this->theme_post_title_config() );

		$this->assertInstanceOf( \WP_Error::class, $result['error'] );
		$this->assertStringContainsString( 'title', $result['error']->get_error_message() );
		$this->assertStringContainsString( 'invalid shape', $result['error']->get_error_message() );
		$this->assertArrayNotHasKey( 'title', $result['valid'] );
	}

	public function test_validate_shape__merges_valid_keys_and_reports_invalid_together() {
		$primitives = [
			'title' => 'Hello world',
			'header_size' => 'h9',
		];

		$result = V3_Settings_Validator::validate_shape( 'theme-post-title', $primitives, $this->theme_post_title_config() );

		$this->assertInstanceOf( \WP_Error::class, $result['error'] );
		$this->assertStringContainsString( 'header_size', $result['error']->get_error_message() );
		$this->assertSame( 'Hello world', $result['valid']['title'] );
		$this->assertArrayNotHasKey( 'header_size', $result['valid'] );
	}

	public function test_validate_shape__matches_builder_for_advertised_schema() {
		$widget_config = $this->theme_post_title_config();
		$primitives = [
			'title' => [ 'not' => 'a scalar' ],
			'header_size' => 'h9',
		];

		$advertised_schema = V3_Json_Schema_Builder::build( $widget_config['controls'], array_keys( $primitives ) );
		$shape = V3_Json_Schema_Builder::check_settings_shape( $primitives, $advertised_schema );

		$validator = V3_Settings_Validator::validate_shape( 'theme-post-title', $primitives, $widget_config );

		$this->assertArrayHasKey( 'title', $shape['errors'] );
		$this->assertArrayHasKey( 'header_size', $shape['errors'] );
		$this->assertInstanceOf( \WP_Error::class, $validator['error'] );
		$this->assertArrayNotHasKey( 'title', $validator['valid'] );
		$this->assertArrayNotHasKey( 'header_size', $validator['valid'] );
	}

	public function test_validate_shape__rejects_primitive_key_without_control_entry() {
		$widget_config = [
			'controls' => [ 'title' => [ 'type' => 'text' ] ],
		];
		$primitives = [
			'title' => 'Hello',
			'link' => [ 'url' => 'https://example.com' ],
		];

		$result = V3_Settings_Validator::validate_shape( 'theme-post-title', $primitives, $widget_config );

		$this->assertInstanceOf( \WP_Error::class, $result['error'] );
		$this->assertStringContainsString( 'link', $result['error']->get_error_message() );
		$this->assertStringContainsString( 'no schema for allowlisted key', $result['error']->get_error_message() );
		$this->assertSame( 'Hello', $result['valid']['title'] );
		$this->assertArrayNotHasKey( 'link', $result['valid'] );
	}

	public function test_validate_shape__rejects_all_keys_when_controls_are_missing() {
		$primitives = [
			'title' => 'Hello',
			'header_size' => 'h2',
		];

		$result = V3_Settings_Validator::validate_shape( 'theme-post-title', $primitives, [] );

		$this->assertInstanceOf( \WP_Error::class, $result['error'] );
		$this->assertStringContainsString( 'title', $result['error']->get_error_message() );
		$this->assertStringContainsString( 'header_size', $result['error']->get_error_message() );
		$this->assertSame( [], $result['valid'] );
	}
}
