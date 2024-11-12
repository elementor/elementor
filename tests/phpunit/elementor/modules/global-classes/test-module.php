<?php
namespace Elementor\Testing\Modules\GlobalClasses;

use Elementor\Modules\GlobalClasses\API;
use Elementor\Modules\GlobalClasses\Repository;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Module extends Elementor_Test_Base {
	private $mock_global_class = [
		"label" => "flexy",
		"variants" => [
			[
				"meta" => [
					"breakpoint" => "desktop",
					"state" => null
				],
				"props" => [
					"display" => "flex"
				]
			]
		]
	];


//	public function tear_down() {
//		parent::tear_down();
//
//		global $wp_rest_server;
//		$wp_rest_server = false;
//
//		remove_all_actions( 'rest_api_init' );
//	}

	public function test_it__returns_all_global_classes() {
		// Arrange
		$this->act_as_admin();

		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$repository = new Repository( $kit );
		$api = new API( $repository );
		$api->register_hooks();


		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/global-classes' );
		$request->set_body_params( $this->mock_global_class );
		$response = rest_do_request( $request );


		// Assert
		$id = $response->get_data()['id'];
		$classes = $kit->get_json_meta( Repository::META_KEY );

		$this->assertArrayHasKey( 'items', $classes );
		$this->assertArrayHasKey( 'order', $classes );
		$this->assertArrayHasKey( $id, $classes['items'] );
	}
}
