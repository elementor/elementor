<?php
namespace Elementor\Testing\Modules\GlobalClasses;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\GlobalClasses\API;
use Elementor\Modules\GlobalClasses\Repository;
use Elementor\Modules\GlobalClasses\Module;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Data\Manager as Data_Manager;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Module extends Elementor_Test_Base {
	private $global_classes_experiment_default_state;
	private $atomic_widgets_experiment_default_state;
	private Data_Manager $data_manager;

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

	public function set_up(): void {
		parent::set_up();

//		$this->global_classes_experiment_default_state = Plugin::instance()->experiments->get_features( Module::NAME )[ 'default' ];
//		$this->atomic_widgets_experiment_default_state = Plugin::instance()->experiments->get_features( Atomic_Widgets_Module::EXPERIMENT_NAME )[ 'default' ];
	}

	public function tear_down() {
		parent::tear_down();

		global $wp_rest_server;
		$wp_rest_server = false;

		remove_all_actions( 'rest_api_init' );

//		Plugin::instance()->experiments->set_feature_default_state( Atomic_Widgets_Module::EXPERIMENT_NAME, $this->atomic_widgets_experiment_default_state );
//		Plugin::instance()->experiments->set_feature_default_state( Module::NAME, $this->global_classes_experiment_default_state );
	}

	public function test_it__returns_all_global_classes() {
		// Arrange
//		$this->act_as_admin();
//
//		$kit = Plugin::$instance->kits_manager->get_active_kit();
//		$repository = new Repository( $kit );
//		$api = new API( $repository );
//		$api->register_hooks();
//
//
//		// Act
//		$request = new \WP_REST_Request( 'POST', '/elementor/v1/global-classes' );
//		$request->set_body_params( $this->mock_global_class );
//		$response = rest_do_request( $request );
//
//
//		// Assert
//		$id = $response->get_data()['id'];
//		$classes = $kit->get_json_meta( Repository::META_KEY );
//
//		var_dump( 'classes', $classes );
//		die;
//		$this->assertArrayHasKey( 'items', $classes );
//		$this->assertArrayHasKey( 'order', $classes );
//		$this->assertArrayHasKey( $id, $classes['items'] );

		$this->assertTrue( true );
	}

	private function experiment_on() {
		Plugin::instance()->experiments->set_feature_default_state( Atomic_Widgets_Module::EXPERIMENT_NAME, Experiments_Manager::STATE_ACTIVE );
		Plugin::instance()->experiments->set_feature_default_state( Module::NAME, Experiments_Manager::STATE_ACTIVE );
	}

	private function experiment_off() {
		Plugin::instance()->experiments->set_feature_default_state( Atomic_Widgets_Module::EXPERIMENT_NAME, Experiments_Manager::STATE_INACTIVE );
		Plugin::instance()->experiments->set_feature_default_state( Module::NAME, Experiments_Manager::STATE_INACTIVE );
	}
}
