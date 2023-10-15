<?php

namespace Elementor\Testing\Modules\KitElementsDefaults\Data;

use Elementor\Modules\KitElementsDefaults\Module;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Controller extends Elementor_Test_Base {

	private $kit;

	public function setUp() {
		parent::setUp();

		$this->kit = Plugin::$instance->kits_manager->get_active_kit();
	}

	/**
	 * GET '/kit-elements-defaults'
	 */
	public function test_get_items__only_allowed_users_can_read_defaults() {
		// Arrange.
		$this->act_as_subscriber();

		// Act.
		$response = $this->send_request( 'GET', '/kit-elements-defaults' );

		// Assert.
		$this->assertEquals( 403, $response->get_status() );
	}

	public function test_get_items__empty_kit_default_meta() {
		// Arrange.
		$this->act_as_editor();

		// Act.
		$response = $this->send_request( 'GET', '/kit-elements-defaults' );

		// Assert.
		$this->assertEquals( 200, $response->get_status() );
		$this->assertEquals( (object) [], $response->get_data() );
	}

	public function test_get_items() {
		// Arrange.
		$this->act_as_editor();

		// Mock elements defaults.
		$this->kit->update_meta( Module::META_KEY, json_encode( [
			'section' => [
				'color' => '#FFF',
				'background_color' => 'red',
			],
			'column' => [
				'width' => [
					'size' => 50,
					'unit' => '%',
				],
			],
		] ) );

		// Act.
		$response = $this->send_request( 'GET', '/kit-elements-defaults' );

		// Assert.
		$this->assertEquals( 200, $response->get_status() );

		$this->assertEquals( (object) [
			'section' => [
				'color' => '#FFF',
				'background_color' => 'red',
			],
			'column' => [
				'width' => [
					'size' => 50,
					'unit' => '%',
				],
			],
		], $response->get_data() );
	}

	/**
	 * PUT '/kit-elements-defaults/{type}'
	 */
	public function test_update_item__only_allowed_users_can_create_defaults() {
		// Arrange.
		$this->act_as_editor();

		// Act.
		$response = $this->send_request( 'PUT', '/kit-elements-defaults/section', [
			'settings' => [
				'color' => '#FFF',
				'background_color' => 'red',
			],
		] );

		// Assert.
		$this->assertEquals( 403, $response->get_status() );
	}

	public function test_update_item__missing_settings_returns_400() {
		// Arrange.
		$this->act_as_admin();

		// Act.
		$response = $this->send_request( 'PUT', '/kit-elements-defaults/section' );

		// Assert.
		$this->assertEquals( 400, $response->get_status() );
		$this->assertEquals( 'rest_missing_callback_param', $response->get_data()['code'] );
		$this->assertEqualSets( [ 'settings' ], $response->get_data()['data']['params'] );
	}

	public function test_update_item__invalid_settings_returns_400() {
		// Arrange.
		$this->act_as_admin();

		// Act.
		$response = $this->send_request( 'PUT', '/kit-elements-defaults/section', [
			'settings' => 'not-an-object',
		] );

		// Assert.
		$this->assertEquals( 400, $response->get_status() );
		$this->assertEquals( 'rest_invalid_param', $response->get_data()['code'] );
		$this->assertArrayHasKey( 'settings', $response->get_data()['data']['params'] );
	}

	public function test_update_item__sanitizes_invalid_html_elements() {
		// Arrange.
		$this->act_as_admin();

		// Act.
		$response = $this->send_request( 'PUT', '/kit-elements-defaults/button', [
			'settings' => [
				'text' => 'Text before <script>alert("error")</script> Some text after',
				'__globals__' => [
					'button_text_color' => '<script>globals/colors?id=secondary</script>',
				],
			],
		] );

		// Assert.
		$this->assertEquals( 200, $response->get_status() );

		$this->assertSame( [
			'button' => [
				'text' => 'Text before alert("error") Some text after',
				'__globals__' => [
					'button_text_color' => 'globals/colors?id=secondary',
				]
			],
		], $this->kit->get_json_meta( Module::META_KEY ) );
	}

	public function test_update_item__keeps_quotes() {
		// Arrange.
		$this->act_as_admin();

		// Act.
		$response = $this->send_request( 'PUT', '/kit-elements-defaults/section', [
			'settings' => [
				'heading_color' => 'text with "double" and \'single\' quotes',
			],
		] );

		// Assert.
		$this->assertEquals( 200, $response->get_status() );

		$this->assertEquals( [
			'section' => [
				'heading_color' => 'text with "double" and \'single\' quotes',
			],
		], $this->kit->get_json_meta( Module::META_KEY ) );
	}

	/**
	 * @dataProvider get_element_types_data_provider
	 */
	public function test_update_item__for_type( $type, $settings ) {
		// Arrange.
		$this->act_as_admin();

		// Act.
		$response = $this->send_request( 'PUT', "/kit-elements-defaults/{$type}", [
			'settings' => $settings,
		] );


		// Assert.
		$this->assertEquals( 200, $response->get_status() );

		$this->assertEquals( [
			$type => $settings,
		], $this->kit->get_json_meta( Module::META_KEY ) );
	}

	public function get_element_types_data_provider() {
		return [
			[ 'section', ['html_tag' => 'div'] ],
			[ 'inner-section', ['html_tag' => 'div'] ],
			[ 'column', [ 'html_tag' => 'div' ] ],
			[ 'container', ['content_width' => 'full'] ],
			[ 'button', ['button_type' => 'info'] ],
		];
	}

	public function test_update_item() {
		// Arrange.
		$this->act_as_admin();

		// Mock elements defaults.
		$this->kit->update_meta( Module::META_KEY, json_encode( [
			'section' => [
				'old_control' => 'that_should_be_removed',
			],
			'column' => [
				'width' => [
					'size' => 50,
					'unit' => '%',
				],
			],
		] ) );

		// Act.
		$response = $this->send_request( 'PUT', '/kit-elements-defaults/section', [
			'settings' => [
				'heading_color' => 'red',
				'color_text' => '#FFF',
				'text_align' => 'center',
				'text_align_tablet' => 'right',
				'text_align_mobile' => 'left',
				'text_align_widescreen' => 'left',
				'invalid_control' => 'that_should_be_removed',
				"content_width" => [
					"size" => 50,
					"unit" => "px",
				],
				'__globals__' => [
					'color_link' => 'globals/colors?id=secondary',
					'color_link_mobile' => 'globals/colors?id=primary',
					'invalid_control1' => 'invalid',
				],
				'__dynamic__' => [
					'_element_id' => "[elementor-tag id=\"4f74e2e\" name=\"post-url'\" settings=\"%7B%7D\"]",
					'invalid_control2' => 'invalid',
				],
			],
		] );

		// Assert.
		$this->assertEquals( 200, $response->get_status() );

		$this->assertSame( [
			'section' => [
				'heading_color' => 'red',
				'color_text' => '#FFF',
				'text_align' => 'center',
				'text_align_tablet' => 'right',
				'text_align_mobile' => 'left',
				'text_align_widescreen' => 'left',
				'content_width' => [
					'size' => 50,
					'unit' => 'px',
				],
				'__globals__' => [
					'color_link' => 'globals/colors?id=secondary',
					'color_link_mobile' => 'globals/colors?id=primary',
				],
				'__dynamic__' => [
					'_element_id' => "[elementor-tag id=\"4f74e2e\" name=\"post-url'\" settings=\"%7B%7D\"]",
				],
			],
			'column' => [
				'width' => [
					'size' => 50,
					'unit' => '%',
				],
			],
		], $this->kit->get_json_meta( Module::META_KEY ) );
	}

	/**
	 * DELETE '/kit-elements-defaults/{type}'
	 */
	public function test_delete_item__only_allowed_users_can_delete_defaults() {
		// Arrange.
		$this->act_as_editor();

		// Act.
		$response = $this->send_request( 'DELETE', '/kit-elements-defaults/section' );

		// Assert.
		$this->assertEquals( 403, $response->get_status() );
	}

	public function test_delete_item__keeps_quotes() {
		// Arrange.
		$this->act_as_admin();

		// Mock elements defaults.
		$this->kit->update_meta( Module::META_KEY, wp_slash( json_encode( [
			'section' => [
				'heading_color' => 'text with "double" and \'single\' quotes',
			],
			'column' => [
				'width' => [
					'size' => 50,
					'unit' => '%',
				],
			],
		] ) ) );

		// Act.
		$response = $this->send_request( 'DELETE', '/kit-elements-defaults/column' );

		// Assert.
		$this->assertEquals( 200, $response->get_status() );

		$this->assertEquals( [
			'section' => [
				'heading_color' => 'text with "double" and \'single\' quotes',
			],
		], $this->kit->get_json_meta( Module::META_KEY ) );
	}

	public function test_delete_item() {
		// Arrange.
		$this->act_as_admin();

		// Mock elements defaults.
		$this->kit->update_meta( Module::META_KEY, json_encode( [
			'section' => [
				'heading_color' => 'red',
				'color_text' => '#FFF',
			],
			'column' => [
				'width' => [
					'size' => 50,
					'unit' => '%',
				],
			],
		] ) );

		// Act.
		$response = $this->send_request( 'DELETE', '/kit-elements-defaults/section' );

		// Assert.
		$this->assertEquals( 200, $response->get_status() );

		$this->assertEquals( [
			'column' => [
				'width' => [
					'size' => 50,
					'unit' => '%',
				],
			],
		], $this->kit->get_json_meta( Module::META_KEY ) );
	}

	/**
	 * Validations
	 */

	/**
	 * @dataProvider invalid_kit_data_provider
	 */
	public function test_validation__invalid_kit_returns_404( $method, $endpoint, $data ) {
		// Arrange.
		$this->act_as_admin();

		$_GET['force_delete_kit'] = 1;

		$this->kit->force_delete();

		// Act.
		$response = $this->send_request( $method, $endpoint, $data );

		// Assert.
		$this->assertEquals( 404, $response->get_status() );
	}

	/**
	 * @dataProvider invalid_element_type_data_provider
	 */
	public function test_validation__invalid_element_type_returns_400( $method, $endpoint, $data ) {
		// Arrange.
		$this->act_as_editor();

		// Act.
		$response = $this->send_request( $method, $endpoint . '/invalid_element_type', $data );

		// Assert.
		$this->assertEquals( 400, $response->get_status() );
		$this->assertEquals( 'rest_invalid_param', $response->get_data()['code'] );
		$this->assertArrayHasKey( 'type', $response->get_data()['data']['params'] );
	}


	/**
	 * Data Providers
	 */
	public function invalid_kit_data_provider() {
		return [
			'index' => [
				'GET',
				'/kit-elements-defaults',
				[],
			],

			'update' => [
				'PUT',
				'/kit-elements-defaults/section',
				[
					'settings' => [
						'color' => '#FFF',
						'background_color' => 'red',
					],
				],
			],

			'destroy' => [
				'DELETE',
				'/kit-elements-defaults/section',
				[],
			],
		];
	}

	public function invalid_element_type_data_provider() {
		return [
			'update' => [
				'PUT',
				'/kit-elements-defaults',
				[
					'settings' => [
						'color' => '#FFF',
						'background_color' => 'red',
					],
				],
			],

			'destroy' => [
				'DELETE',
				'/kit-elements-defaults',
				[],
			],
		];
	}

	/**
	 * Utils
	 */
	private function send_request( $method, $endpoint, $params = [] ) {
		$request = new \WP_REST_Request( $method, "/elementor/v1{$endpoint}" );

		foreach ( $params as $key => $value ) {
			$request->set_param( $key, $value );
		}

		return rest_do_request( $request );
	}
}
