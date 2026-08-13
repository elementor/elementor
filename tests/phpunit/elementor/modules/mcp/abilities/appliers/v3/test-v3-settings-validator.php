<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Dynamic_Resolver;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Settings_Validator;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Settings_Validator extends TestCase {

	protected function setUp(): void {
		parent::setUp();
		V3_Dynamic_Resolver::set_tag_info_resolver( function ( $name ) {
			$catalog = [
				'post-title' => [ 'name' => 'post-title', 'categories' => [ 'text' ] ],
				'post-url' => [ 'name' => 'post-url', 'categories' => [ 'url' ] ],
			];
			return $catalog[ $name ] ?? null;
		} );
		V3_Dynamic_Resolver::set_shortcode_builder( function ( $id, $name, $settings ) {
			return sprintf( '[elementor-tag id="%s" name="%s"]', $id, $name );
		} );
	}

	protected function tearDown(): void {
		V3_Dynamic_Resolver::set_tag_info_resolver( null );
		V3_Dynamic_Resolver::set_shortcode_builder( null );
		parent::tearDown();
	}

	private function theme_post_title_config(): array {
		return [
			'controls' => [
				'title' => [
					'type' => 'text',
					'dynamic' => [ 'active' => true, 'categories' => [ 'text' ] ],
				],
				'link' => [
					'type' => 'url',
					'dynamic' => [ 'active' => true, 'categories' => [ 'url' ], 'property' => 'url' ],
				],
				'size' => [
					'type' => 'select',
					'options' => [ 'default' => 'Default', 'small' => 'Small', 'large' => 'Large' ],
				],
				'header_size' => [
					'type' => 'select',
					'options' => [ 'h1' => 'H1', 'h2' => 'H2', 'h3' => 'H3' ],
				],
			],
		];
	}

	public function test_validate__coerces_nested_url_dynamic_into_dynamic_patch_and_empty_url_primitive() {
		// Arrange — reproduces the original bug: LLM sends { url: { name, settings } } for link.
		$settings = [
			'link' => [ 'url' => [ 'name' => 'post-url', 'settings' => [] ] ],
		];

		// Act.
		$result = V3_Settings_Validator::validate( 'theme-post-title', $settings, $this->theme_post_title_config() );

		// Assert.
		$this->assertNull( $result['error'] );
		$this->assertSame(
			[ 'url' => '', 'is_external' => '', 'nofollow' => '' ],
			$result['allowed']['link']
		);
		$this->assertArrayHasKey( 'link', $result['dynamic_patch'] );
		$this->assertStringContainsString( 'name="post-url"', $result['dynamic_patch']['link'] );
	}

	public function test_validate__coerces_top_level_text_dynamic_on_title() {
		// Arrange.
		$settings = [
			'title' => [ 'name' => 'post-title', 'settings' => [] ],
		];

		// Act.
		$result = V3_Settings_Validator::validate( 'theme-post-title', $settings, $this->theme_post_title_config() );

		// Assert.
		$this->assertNull( $result['error'] );
		$this->assertSame( '', $result['allowed']['title'] );
		$this->assertArrayHasKey( 'title', $result['dynamic_patch'] );
	}

	public function test_validate__rejects_array_value_on_a_scalar_slot_with_shape_error() {
		// Arrange — array smuggled into a scalar slot (no `name` key, so not dynamic).
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
		$this->assertEmpty( $result['dynamic_patch'] );
	}

	public function test_validate__errors_when_dynamic_tag_category_does_not_match_slot() {
		// Arrange — post-url is a URL tag, but we bind it on the text slot `title` (categories: [text]).
		$settings = [
			'title' => [ 'name' => 'post-url', 'settings' => [] ],
		];

		// Act.
		$result = V3_Settings_Validator::validate( 'theme-post-title', $settings, $this->theme_post_title_config() );

		// Assert.
		$this->assertInstanceOf( \WP_Error::class, $result['error'] );
		$this->assertStringContainsString( 'not compatible', $result['error']->get_error_message() );
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
