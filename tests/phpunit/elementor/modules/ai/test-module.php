<?php

namespace Elementor\Testing\Modules\Ai;

use Elementor\Modules\Ai\Module;
use Elementor\Plugin;
use Elementor\User;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Elementor_Test_Module extends Elementor_Test_Base {

	private $module;
	private $ai_app_mock;

	public function setUp(): void {
		parent::setUp();

		$this->ai_app_mock = $this->getMockBuilder( '\Elementor\Modules\Ai\Connect\Ai' )
			->disableOriginalConstructor()
			->getMock();

		$this->act_as_admin();

		$this->mock_connect_module();

		$this->module = $this->getMockBuilder( '\Elementor\Modules\Ai\Module' )
			->setMethods( [ 'is_ai_enabled' ] )
			->getMock();
	}

	private function mock_is_ai_enabled( $is_ai_enabled ) {
		$this->module->method( 'is_ai_enabled' )
			->willReturn( $is_ai_enabled );
	}

	private function mock_connect_module() {
		$module_mock = $this->getMockBuilder( \Elementor\Core\Common\Modules\Connect\Module::class )
			->setMethods( [ 'get_app' ] )
			->getMock();

		$module_mock->method( 'get_app' )->willReturn( $this->ai_app_mock );

		Plugin::$instance->common->add_component( 'connect', $module_mock );
	}

	private function get_valid_import() {
		return [
			'status' => 'success',
			'runner' => 'site-settings',
			'configData' => [
				'lastImportedSession' => [
					'session_id' => '123',
					'instance_data' => [
						'site_settings' => [
							'settings' => [
								'ai' => [ 'some_setting' => 'value' ],
							],
						],
					],
				],
			],
		];
	}

	private function act_as_connected_and_started_user() {
		$this->ai_app_mock->method( 'is_connected' )
			->willReturn( true );

		User::set_introduction_viewed( [ 'introductionKey' => 'ai_get_started' ] );
	}

	public function test_handle_kit_install_should_send_event_when_connected() {
		$this->mock_is_ai_enabled( true );

		$this->act_as_connected_and_started_user();

		$imported_data = $this->get_valid_import();

		$this->ai_app_mock->expects( $this->once() )
			->method( 'send_event' )
			->with([
				'name' => 'kit_installed',
				'data' => [ 'some_setting' => 'value' ],
				'client' => [
					'name' => 'elementor',
					'version' => ELEMENTOR_VERSION,
					'session_id' => '123',
				],
			]);

		do_action( 'elementor/import-export/import-kit/runner/after-run', $imported_data );
	}

	public function test_handle_kit_install_should_return_early_if_not_success_status() {
		$this->mock_is_ai_enabled( true );
	
		$this->act_as_connected_and_started_user();

		$imported_data = $this->get_valid_import();
		$imported_data['status'] = 'error';

		$this->ai_app_mock->expects( $this->never() )
			->method( 'send_event' );

		do_action( 'elementor/import-export/import-kit/runner/after-run', $imported_data );
	}

	public function test_handle_kit_install_should_return_early_if_not_site_settings_runner() {
		$this->mock_is_ai_enabled( true );
	
		$this->act_as_connected_and_started_user();

		$imported_data = $this->get_valid_import();
		$imported_data['runner'] = 'other-runner';

		$this->ai_app_mock->expects( $this->never() )
			->method( 'send_event' );

		do_action( 'elementor/import-export/import-kit/runner/after-run', $imported_data );
	}

	public function test_handle_kit_install_should_not_send_event_when_not_connected() {
		$this->mock_is_ai_enabled( true );

		User::set_introduction_viewed( [ 'introductionKey' => 'ai_get_started' ] );

		$imported_data = $this->get_valid_import();

		$this->ai_app_mock->expects( $this->never() )
			->method( 'send_event' );

		do_action( 'elementor/import-export/import-kit/runner/after-run', $imported_data );
	}

	public function test_handle_kit_install_should_not_send_event_when_ai_get_started_not_viewed() {
		$this->mock_is_ai_enabled( true );

		$this->ai_app_mock->method( 'is_connected' )
			->willReturn( true );

		$imported_data = $this->get_valid_import();

		$this->ai_app_mock->expects( $this->never() )
			->method( 'send_event' );

		do_action( 'elementor/import-export/import-kit/runner/after-run', $imported_data );
	}

	public function test_handle_kit_install_should_return_early_if_no_ai_settings() {
		$this->mock_is_ai_enabled( true );

		$this->act_as_connected_and_started_user();

		$imported_data = $this->get_valid_import();

		unset( $imported_data['configData']['lastImportedSession']['instance_data']['site_settings']['settings']['ai'] );

		$this->ai_app_mock->expects( $this->never() )
			->method( 'send_event' );

		do_action( 'elementor/import-export/import-kit/runner/after-run', $imported_data );
	}

	public function test_handle_kit_install_should_return_early_if_ai_disabled() {
		$this->mock_is_ai_enabled( false );

		$this->act_as_connected_and_started_user();

		$imported_data = $this->get_valid_import();

		$this->ai_app_mock->expects( $this->never() )
			->method( 'send_event' );

		do_action( 'elementor/import-export/import-kit/runner/after-run', $imported_data );
	}

	public function test_is_ai_enabled_should_return_true_if_container_experiment_active() {
		Plugin::$instance->experiments->set_feature_default_state( 'container', 'active' );

		$module = new Module();

		$this->assertTrue( $module->is_ai_enabled() );
	}

	public function test_is_ai_enabled_should_return_false_if_container_experiment_inactive() {
		Plugin::$instance->experiments->set_feature_default_state( 'container', 'inactive' );
		
		$module = new Module();

		$this->assertFalse( $module->is_ai_enabled() );
	}

	public function test_add_create_with_ai_banner_to_homescreen__returns_null_when_site_builder_experiment_active() {
		$this->ensure_site_builder_experiment_registered();
		Plugin::$instance->experiments->set_feature_default_state( 'site-builder', 'active' );

		try {
			$module = new Module();
			$result = $module->add_create_with_ai_banner_to_homescreen( [] );

			$this->assertNull( $result['create_with_ai'] );
		} finally {
			Plugin::$instance->experiments->set_feature_default_state( 'site-builder', 'inactive' );
		}
	}

	private function ensure_site_builder_experiment_registered() {
		if ( Plugin::$instance->experiments->get_features( 'site-builder' ) ) {
			return;
		}

		Plugin::$instance->experiments->add_feature( [
			'name' => 'site-builder',
			'title' => 'Site Builder',
			'description' => 'Enable Site Builder.',
			'release_status' => Plugin::$instance->experiments::RELEASE_STATUS_DEV,
			'hidden' => true,
		] );
	}
}
