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

		$this->ai_app_mock = $this->getMockBuilder('\Elementor\Modules\Ai\Connect\Ai')
			->disableOriginalConstructor()
			->getMock();

		$this->act_as_admin();

		$this->mock_connect_module();

		$this->module = new Module();
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
								'ai' => ['some_setting' => 'value']
							]
						]
					]
				]
			]
		];
	}

	private function act_as_connected_and_started_user() {
		$this->ai_app_mock->method('is_connected')
			->willReturn(true);

		User::set_introduction_viewed( [ 'introductionKey' => 'ai_get_started' ] );
	}

	public function test_handle_kit_install_should_send_event_when_connected() {
		$this->act_as_connected_and_started_user();

		$imported_data = $this->get_valid_import();

		$this->ai_app_mock->expects($this->once())
			->method('send_event')
			->with([
				'name' => 'kit_installed',
				'data' => ['some_setting' => 'value'],
				'client' => [
					'name' => 'elementor',
					'version' => ELEMENTOR_VERSION,
					'session_id' => '123'
				]
			]);

		do_action( 'elementor/import-export/import-kit/runner/after-run', $imported_data );
	}

	public function test_handle_kit_install_should_return_early_if_not_success_status() {
		$this->act_as_connected_and_started_user();

		$imported_data = $this->get_valid_import();
		$imported_data['status'] = 'error';

		$this->ai_app_mock->expects($this->never())
			->method('send_event');

		do_action( 'elementor/import-export/import-kit/runner/after-run', $imported_data );
	}

	public function test_handle_kit_install_should_return_early_if_not_site_settings_runner() {
		$this->act_as_connected_and_started_user();

		$imported_data = $this->get_valid_import();
		$imported_data['runner'] = 'other-runner';

		$this->ai_app_mock->expects($this->never())
			->method('send_event');

		do_action( 'elementor/import-export/import-kit/runner/after-run', $imported_data );
	}

	public function test_handle_kit_install_should_not_send_event_when_not_connected() {
		User::set_introduction_viewed( [ 'introductionKey' => 'ai_get_started' ] );

		$imported_data = $this->get_valid_import();

		$this->ai_app_mock->expects($this->never())
			->method('send_event');

		do_action( 'elementor/import-export/import-kit/runner/after-run', $imported_data );
	}

	public function test_handle_kit_install_should_not_send_event_when_ai_get_started_not_viewed() {
		$this->ai_app_mock->method('is_connected')
			->willReturn(true);

		$imported_data = $this->get_valid_import();

		$this->ai_app_mock->expects($this->never())
			->method('send_event');

		do_action( 'elementor/import-export/import-kit/runner/after-run', $imported_data );
	}

	public function test_handle_kit_install_should_return_early_if_no_ai_settings() {
		$this->act_as_connected_and_started_user();

		$imported_data = $this->get_valid_import();

		unset( $imported_data['configData']['lastImportedSession']['instance_data']['site_settings']['settings']['ai'] );

		$this->ai_app_mock->expects($this->never())
			->method('send_event');

		do_action( 'elementor/import-export/import-kit/runner/after-run', $imported_data );
	}
}
