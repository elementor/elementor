<?php

namespace Elementor\Testing\Modules\Ai;

use Elementor\Modules\Ai\Module;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Module extends Elementor_Test_Base {

	private $module;
	private $ai_app_mock;

	public function setUp(): void {
		parent::setUp();

		// Create mock for AI app
		$this->ai_app_mock = $this->getMockBuilder('\Elementor\Modules\Ai\Connect\Ai')
			->disableOriginalConstructor()
			->getMock();

		// Create User mock
		$this->user_mock = $this->getMockBuilder('\Elementor\User')
			->disableOriginalConstructor()
			->setMethods(['get_introduction_viewed'])  // Specify the method we want to mock
			->getMock();

		// Configure User mock
		$this->user_mock->method('get_introduction_viewed')
			->willReturn(['ai_get_started' => true]);

		// Create module instance
		$this->module = new Module();

		// Use reflection to set private ai_app property
		$reflection = new \ReflectionClass($this->module);
		$method = $reflection->getMethod('get_ai_app');
		$method->setAccessible(true);
		$method->invoke($this->module, $this->ai_app_mock);
	}

	public function test_handle_kit_install_should_return_early_if_not_success_status() {
		$imported_data = ['status' => 'error'];

		$this->ai_app_mock->expects($this->never())
			->method('send_event');

		$this->module->handle_kit_install($imported_data);
	}

	public function test_handle_kit_install_should_return_early_if_not_site_settings_runner() {
		$imported_data = [
			'status' => 'success',
			'runner' => 'other-runner'
		];

		$this->ai_app_mock->expects($this->never())
			->method('send_event');

		$this->module->handle_kit_install($imported_data);
	}

	public function test_handle_kit_install_should_send_event_when_connected() {
		// Mock is_connected() to return true
		$this->ai_app_mock->method('is_connected')
			->willReturn(true);

		$imported_data = [
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

		// Expect send_event() to be called with correct params
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

		$this->module->handle_kit_install($imported_data);
	}

	public function test_handle_kit_install_should_not_send_event_when_not_connected() {
		// Mock is_connected() to return false
		$this->ai_app_mock->method('is_connected')
			->willReturn(false);

		$imported_data = [
			'status' => 'success',
			'runner' => 'site-settings',
			'configData' => [
				'lastImportedSession' => [
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

		$this->ai_app_mock->expects($this->never())
			->method('send_event');

		$this->module->handle_kit_install($imported_data);
	}
}
