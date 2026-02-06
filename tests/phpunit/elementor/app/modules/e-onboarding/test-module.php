<?php

namespace Elementor\Tests\Phpunit\Elementor\App\Modules\E_Onboarding;

use Elementor\App\Modules\E_Onboarding\Module;
use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Module extends Elementor_Test_Base {

	public function test_get_name_returns_e_onboarding() {
		// Arrange
		$module = $this->get_module_mock();

		// Assert
		$this->assertSame( 'e-onboarding', $module->get_name() );
	}

	public function test_get_experimental_data_returns_correct_structure() {
		// Act
		$data = Module::get_experimental_data();

		// Assert
		$this->assertIsArray( $data );
		$this->assertArrayHasKey( 'name', $data );
		$this->assertArrayHasKey( 'title', $data );
		$this->assertArrayHasKey( 'description', $data );
		$this->assertArrayHasKey( 'default', $data );
		$this->assertArrayHasKey( 'release_status', $data );
	}

	public function test_get_experimental_data_name_is_e_onboarding() {
		// Act
		$data = Module::get_experimental_data();

		// Assert
		$this->assertSame( 'e_onboarding', $data['name'] );
	}

	public function test_get_experimental_data_is_hidden() {
		// Act
		$data = Module::get_experimental_data();

		// Assert
		$this->assertTrue( $data['hidden'] );
	}

	public function test_get_experimental_data_default_is_inactive() {
		// Act
		$data = Module::get_experimental_data();

		// Assert
		$this->assertSame( 'inactive', $data['default'] );
	}

	public function test_get_experimental_data_release_status_is_dev() {
		// Act
		$data = Module::get_experimental_data();

		// Assert
		$this->assertSame( 'dev', $data['release_status'] );
	}

	public function test_version_constant_exists() {
		// Assert
		$this->assertSame( '1.0.0', Module::VERSION );
	}

	public function test_experiment_name_constant_exists() {
		// Assert
		$this->assertSame( 'e_onboarding', Module::EXPERIMENT_NAME );
	}

	/**
	 * Create a module mock that bypasses the experiment check.
	 */
	private function get_module_mock(): Module {
		$reflector = new \ReflectionClass( Module::class );
		$module = $reflector->newInstanceWithoutConstructor();

		return $module;
	}
}
