<?php

namespace Elementor\Testing\Modules\KitElementsDefaults\Data;

use Elementor\Modules\KitElementsDefaults\Data\Controller;
use Elementor\Modules\KitElementsDefaults\Data\Routes;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Routes extends Elementor_Test_Base {

	private $kit;

	public function setUp() {
		parent::setUp();

		$this->kit = Plugin::$instance->kits_manager->get_active_kit();
	}

	/**
	 * GET '/kit-elements-defaults'
	 */
	public function test_index__only_allowed_users_can_read_defaults() {
		// Arrange.
		$this->act_as_subscriber();

		( new Routes() )->register();

		// Act.
		$response = $this->send_request( 'GET', '/kit-elements-defaults' );

		// Assert.
		$this->assertEquals( 403, $response->get_status() );
	}

	public function test_index() {
		// Arrange.
		$this->act_as_editor();

		( new Routes() )->register();

		// Mock elements defaults.
		$this->kit->update_meta( Controller::META_KEY, json_encode( [
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

		$this->assertEquals( [
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
	public function test_store__only_allowed_users_can_create_defaults() {
		// Arrange.
		$this->act_as_editor();

		( new Routes() )->register();

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

	public function test_store__missing_settings_returns_400() {
		// Arrange.
		$this->act_as_admin();

		( new Routes() )->register();

		// Act.
		$response = $this->send_request( 'PUT', '/kit-elements-defaults/section' );

		// Assert.
		$this->assertEquals( 400, $response->get_status() );
		$this->assertEquals( 'rest_missing_callback_param', $response->get_data()['code'] );
		$this->assertEqualSets( [ 'settings' ], $response->get_data()['data']['params'] );
	}

	public function test_store__invalid_settings_returns_400() {
		// Arrange.
		$this->act_as_admin();

		( new Routes() )->register();

		// Act.
		$response = $this->send_request( 'PUT', '/kit-elements-defaults/section', [
			'settings' => 'not-an-object',
		] );

		// Assert.
		$this->assertEquals( 400, $response->get_status() );
		$this->assertEquals( 'rest_invalid_param', $response->get_data()['code'] );
		$this->assertArrayHasKey( 'settings', $response->get_data()['data']['params'] );
	}

	public function test_store__widget_returns_201() {
		// Arrange.
		$this->act_as_admin();

		( new Routes() )->register();

		// Act.
		$response = $this->send_request( 'PUT', '/kit-elements-defaults/button', [
			'settings' => [
				'button_type' => 'info',
			],
		] );

		// Assert.
		$this->assertEquals( 201, $response->get_status() );

		$this->assertEquals( [
			'button' => [
				'button_type' => 'info',
			],
		], $this->kit->get_json_meta( Controller::META_KEY ) );
	}

	public function test_store() {
		// Arrange.
		$this->act_as_admin();

		( new Routes() )->register();

		// Mock elements defaults.
		$this->kit->update_meta( Controller::META_KEY, json_encode( [
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
				'invalid_control' => 'that_should_be_removed',
			],
		] );

		// Assert.
		$this->assertEquals( 201, $response->get_status() );

		$this->assertEquals( [
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
		], $this->kit->get_json_meta( Controller::META_KEY ) );
	}

	/**
	 * DELETE '/kit-elements-defaults/{type}'
	 */
	public function test_destroy__only_allowed_users_can_delete_defaults() {
		// Arrange.
		$this->act_as_editor();

		( new Routes() )->register();

		// Act.
		$response = $this->send_request( 'DELETE', '/kit-elements-defaults/section' );

		// Assert.
		$this->assertEquals( 403, $response->get_status() );
	}

	public function test_destroy() {
		// Arrange.
		$this->act_as_admin();

		( new Routes() )->register();

		// Mock elements defaults.
		$this->kit->update_meta( Controller::META_KEY, json_encode( [
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
		$this->assertEquals( 204, $response->get_status() );

		$this->assertEquals( [
			'column' => [
				'width' => [
					'size' => 50,
					'unit' => '%',
				],
			],
		], $this->kit->get_json_meta( Controller::META_KEY ) );
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

		( new Routes() )->register();

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

		( new Routes() )->register();

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

			'store' => [
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
			'store' => [
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
