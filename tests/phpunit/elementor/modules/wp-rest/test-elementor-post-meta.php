<?php

namespace Elementor\Testing\Modules\WpRest;

use Elementor\Modules\WpRest\Classes\Elementor_Post_Meta;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Elementor_Post_Meta extends Elementor_Test_Base {
	protected Elementor_Post_Meta $post_meta;

	protected int $post_id;

	public function setUp(): void {
		parent::setUp();

		$this->post_meta = new Elementor_Post_Meta();
		$this->post_id = $this->factory()->create_and_get_default_post()->ID;

		$document = Plugin::$instance->documents->get( $this->post_id );
		$document->set_is_built_with_elementor( true );

		do_action( 'rest_api_init' );
	}

	public function test_register() {
		// Arrange
		$this->post_meta->register();

		// Act
		$request = new \WP_REST_Request( 'OPTIONS', '/wp/v2/posts' );
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data();
		$meta_schema = $data['schema']['properties']['meta']['properties'];

		// Assert
		$this->assertArrayHasKey( '_elementor_edit_mode', $meta_schema );
		$this->assertArrayHasKey( '_elementor_template_type', $meta_schema );
		$this->assertArrayHasKey( '_elementor_data', $meta_schema );
		$this->assertArrayHasKey( '_elementor_page_settings', $meta_schema );
	}

	public function test_check_edit_permission_with_valid_user() {
		// Arrange
		$this->act_as_admin();

		// Act
		$has_permission = $this->post_meta->check_edit_permission( true, '_elementor_edit_mode', $this->post_id );

		// Assert
		$this->assertTrue( $has_permission );
	}

	public function test_check_edit_permission_with_invalid_user() {
		// Arrange
		$this->act_as_subscriber();

		// Act
		$has_permission = $this->post_meta->check_edit_permission( true, '_elementor_edit_mode', $this->post_id );

		// Assert
		$this->assertFalse( $has_permission );
	}

	public function test_check_edit_permission_with_non_elementor_post() {
		// Arrange
		$this->act_as_admin();
		$non_elementor_post_id = $this->factory()->post->create();

		// Act
		$has_permission = $this->post_meta->check_edit_permission( true, '_elementor_edit_mode', $non_elementor_post_id );

		// Assert
		$this->assertTrue( $has_permission );
	}

	public function test_check_edit_permission_with_elementor_post_and_excluded_user_roles() {
		// Arrange
		$this->act_as_admin();
		update_option( 'elementor_exclude_user_roles', [ 'administrator' ] );

		// Act
		$has_permission = $this->post_meta->check_edit_permission( true, '_elementor_edit_mode', $this->post_id );

		// Assert
		$this->assertFalse( $has_permission );
	}

	public function test_meta_should_not_be_registered_for_non_elementor_post_types() {
		// Arrange
		$this->act_as_admin();

		register_post_type( 'non_elementor', [
			'public' => true,
			'show_in_rest' => true,
			'supports' => [ 'title', 'editor', 'custom-fields' ],
		] );

		do_action( 'rest_api_init' );

		// Act
		$request = new \WP_REST_Request( 'OPTIONS', '/wp/v2/non_elementor' );
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data();

		// Assert
		$meta_schema = $data['schema']['properties']['meta']['properties'];
		$this->assertArrayNotHasKey( '_elementor_edit_mode', $meta_schema );
		$this->assertArrayNotHasKey( '_elementor_template_type', $meta_schema );
		$this->assertArrayNotHasKey( '_elementor_data', $meta_schema );
		$this->assertArrayNotHasKey( '_elementor_page_settings', $meta_schema );
	}

	public function test_page_settings_json_object_should_be_saved_as_an_array() {
		// Arrange
		$this->act_as_admin();

		$page_settings = [
			'hide_title' => 'yes',
			'custom_setting' => 'value',
		];

		$object_settings = (object) [
			'meta' => (object) [
				'_elementor_page_settings' => (object) $page_settings,
			],
		];

		$json_string = wp_json_encode( $object_settings );

		// Act
		$request = new \WP_REST_Request( 'POST', '/wp/v2/posts/' . $this->post_id );
		$request->set_body( $json_string );
		$request->set_header( 'content-type', 'application/json' );
		rest_get_server()->dispatch( $request );

		// Assert
		$saved_value = get_post_meta( $this->post_id, '_elementor_page_settings', true );
		$this->assertEquals( $page_settings, $saved_value, 'Saved value should be an array' );
	}

	/**
	 * @see https://github.com/elementor/elementor/issues/30160
	 * Issue caused by WP_REST_Meta_Fields::is_meta_value_same_as_stored_value() function that attempted to
	 * sanitize the meta value as a string by using a default type of 'string' in the schema.
	 */
	public function test_page_settings_should_be_saved_when_meta_value_is_same_as_stored_value() {
		// Arrange
		$this->act_as_admin();

		$page_settings = [
			'hide_title' => 'yes',
			'custom_setting' => 'value',
		];

		update_post_meta( $this->post_id, '_elementor_page_settings', $page_settings );

		// Act
		$request = new \WP_REST_Request( 'POST', '/wp/v2/posts/' . $this->post_id );
		$request->set_param( 'meta', [
			'_elementor_page_settings' => $page_settings,
		] );
		$request->set_header( 'content-type', 'application/json' );
		$data = rest_get_server()->dispatch( $request );

		// Assert
		$this->assertEquals( 200, $data->get_status(), 'Status should be 200' );
	}

	public function test_sanitize_elementor_data__keeps_allowed_link_destinations_for_contributor() {
		// Arrange.
		$this->act_as( 'contributor' );
		$destinations = [
			$this->url_destination( 'https://example.com/welcome' ),
			$this->url_destination( 'mailto:user@example.com' ),
			$this->url_destination( '/welcome' ),
			$this->url_destination( '#welcome' ),
			[
				'$$type' => 'query',
				'value' => [
					'id' => [
						'$$type' => 'number',
						'value' => 15,
					],
				],
			],
		];

		// Act.
		$stored = json_decode( $this->post_meta->sanitize_elementor_data( $this->elementor_data_with_destinations( $destinations ) ), true );

		// Assert.
		$this->assertSame( $destinations, $this->destinations_from( $stored ) );
	}

	public function test_sanitize_elementor_data__clears_disallowed_link_protocol_for_contributor() {
		// Arrange.
		$this->act_as( 'contributor' );
		$stored_input = $this->elementor_data_with_destinations( [
			$this->url_destination( 'notascheme:value' ),
			'notascheme:value',
		] );

		// Act.
		$stored = json_decode( $this->post_meta->sanitize_elementor_data( $stored_input ), true );

		// Assert.
		$destinations = $this->destinations_from( $stored );
		$this->assertSame( $this->url_destination( '' ), $destinations[0] );
		$this->assertSame( '', $destinations[1] );
	}

	public function test_rest_update__keeps_link_destination_added_by_admin() {
		// Arrange.
		$this->act_as_admin();
		$elementor_data = $this->elementor_data_with_destinations( [
			'notascheme:value',
		] );
		$request = new \WP_REST_Request( 'POST', '/wp/v2/posts/' . $this->post_id );
		$request->set_param( 'meta', [
			'_elementor_edit_mode' => 'builder',
			'_elementor_data' => $elementor_data,
		] );

		// Act.
		$response = rest_get_server()->dispatch( $request );

		// Assert.
		$this->assertSame( 200, $response->get_status() );
		$saved = json_decode( get_post_meta( $this->post_id, '_elementor_data', true ), true );
		$this->assertSame( [ 'notascheme:value' ], $this->destinations_from( $saved ) );
	}

	public function test_sanitize_elementor_data__keeps_link_destination_for_unfiltered_user() {
		// Arrange.
		$this->act_as_admin();
		$stored_input = $this->elementor_data_with_destinations( [ 'notascheme:value' ] );

		// Act.
		$stored = $this->post_meta->sanitize_elementor_data( $stored_input );

		// Assert.
		$this->assertSame( $stored_input, $stored );
	}

	private function elementor_data_with_destinations( array $destinations ): string {
		$elements = [];

		foreach ( $destinations as $index => $destination ) {
			$elements[] = [
				'id' => 'button-' . $index,
				'elType' => 'widget',
				'widgetType' => 'e-button',
				'settings' => [
					'link' => [
						'$$type' => 'link',
						'value' => [
							'destination' => $destination,
							'isTargetBlank' => false,
							'tag' => 'a',
						],
					],
				],
				'elements' => [],
			];
		}

		return wp_json_encode( $elements );
	}

	private function url_destination( string $url ): array {
		return [
			'$$type' => 'url',
			'value' => $url,
		];
	}

	private function destinations_from( array $elements ): array {
		$destinations = [];

		foreach ( $elements as $element ) {
			$destinations[] = $element['settings']['link']['value']['destination'];
		}

		return $destinations;
	}
}
