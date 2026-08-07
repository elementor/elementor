<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropsResolver;

use Elementor\Core\DynamicTags\Data_Tag;
use Elementor\Core\DynamicTags\Manager as Dynamic_Tags_Manager;
use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Prop_Type;
use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Tags_Module;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Svg_Src_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropsResolver\Render_Props_Resolver;
use Elementor\Modules\DynamicTags\Module as V1_Dynamic_Tags_Module;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @group props-resolver
 */
class Test_Render_Props_Resolver_Dynamic_Url extends Elementor_Test_Base {

	const URL = 'https://example.com/wp-content/uploads/dynamic.svg';

	private ?Dynamic_Tags_Manager $original_dynamic_tags = null;

	private $url_tag;

	public function setUp(): void {
		parent::setUp();

		$this->original_dynamic_tags = Plugin::$instance->dynamic_tags;
		Plugin::$instance->dynamic_tags = new Dynamic_Tags_Manager();

		$this->url_tag = $this->make_url_tag();

		Plugin::$instance->dynamic_tags->register( $this->url_tag );

		Dynamic_Tags_Module::fresh()->register_hooks();

		Render_Props_Resolver::reset();
	}

	public function tearDown(): void {
		Plugin::$instance->controls_manager->delete_stack( $this->url_tag );
		Plugin::$instance->dynamic_tags = $this->original_dynamic_tags;

		Render_Props_Resolver::reset();

		parent::tearDown();
	}

	public function test_resolve__image_src_bound_to_a_url_dynamic_tag() {
		// Arrange.
		$schema = $this->get_extended_schema( [
			'image' => Image_Prop_Type::make()->default_size( 'full' ),
		] );

		$props = [
			'image' => Image_Prop_Type::generate( [
				'src' => $this->generate_url_tag_value(),
				'size' => 'full',
			] ),
		];

		// Act.
		$result = Render_Props_Resolver::for_settings()->resolve( $schema, $props );

		// Assert.
		$this->assertSame( self::URL, $result['image']['src'] );
	}

	public function test_resolve__svg_src_bound_to_a_url_dynamic_tag() {
		// Arrange.
		add_filter( 'pre_http_request', [ $this, 'mock_svg_http_response' ], 1 );

		$schema = $this->get_extended_schema( [
			'svg' => Svg_Src_Prop_Type::make(),
		] );

		$props = [
			'svg' => $this->generate_url_tag_value(),
		];

		// Act.
		$result = Render_Props_Resolver::for_settings()->resolve( $schema, $props );

		// Cleanup.
		remove_filter( 'pre_http_request', [ $this, 'mock_svg_http_response' ], 1 );

		// Assert.
		$this->assertSame( self::URL, $result['svg']['url'] );
		$this->assertStringContainsString( '<svg', $result['svg']['html'] );
	}

	public function mock_svg_http_response() {
		return [
			'body' => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"></svg>',
			'response' => [
				'code' => 200,
				'message' => 'OK',
			],
		];
	}

	private function get_extended_schema( array $schema ): array {
		return apply_filters( 'elementor/atomic-widgets/props-schema', $schema );
	}

	private function generate_url_tag_value(): array {
		return Dynamic_Prop_Type::generate( [
			'name' => 'mock-url-tag',
			'group' => V1_Dynamic_Tags_Module::BASE_GROUP,
			'settings' => [],
		] );
	}

	private function make_url_tag(): Data_Tag {
		return new class extends Data_Tag {
			public function get_name() {
				return 'mock-url-tag';
			}

			public function get_title() {
				return 'Mock Url Tag';
			}

			public function get_group() {
				return V1_Dynamic_Tags_Module::BASE_GROUP;
			}

			public function get_categories() {
				return [ V1_Dynamic_Tags_Module::URL_CATEGORY ];
			}

			protected function get_value( array $options = [] ) {
				return Test_Render_Props_Resolver_Dynamic_Url::URL;
			}

			protected function register_controls() {}

			protected function register_advanced_section() {}
		};
	}
}
