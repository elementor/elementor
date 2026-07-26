<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Agents;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\Agents\Module;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Module extends Elementor_Test_Base {

	private $module;

	public function setUp(): void {
		parent::setUp();

		wp_set_current_user( $this->factory()->get_administrator_user()->ID );

		Plugin::$instance->experiments->set_feature_default_state(
			Module::EXPERIMENT_NAME,
			Experiments_Manager::STATE_ACTIVE
		);

		$this->module = new Module();
	}

	public function test_experiment_is_registered() {
		// Arrange
		$data = Module::get_experimental_data();

		// Act & Assert
		$this->assertSame( Module::EXPERIMENT_NAME, $data['name'] );
		$this->assertTrue( $data['hidden'] );
		$this->assertSame( Experiments_Manager::STATE_INACTIVE, $data['default'] );
		$this->assertSame( Experiments_Manager::RELEASE_STATUS_DEV, $data['release_status'] );
	}

	public function test_get_llms_txt_content__returns_empty_when_not_configured() {
		// Act
		$content = $this->module->get_llms_txt_content();

		// Assert
		$this->assertSame( '', $content );
	}

	public function test_get_llms_txt_content__returns_saved_content() {
		// Arrange
		$llms_content = '# llms.txt';
		$kit_id = Plugin::$instance->kits_manager->get_active_id();
		$kit = Plugin::$instance->documents->get( $kit_id, false );
		$kit->update_settings( [
			'agents' => [
				'llms' => $llms_content,
			],
		] );

		// Act
		$content = $this->module->get_llms_txt_content();

		// Assert
		$this->assertSame( $llms_content, $content );
	}

	public function test_is_llms_txt_request__matches_root_path() {
		// Arrange
		$_SERVER['REQUEST_URI'] = '/llms.txt';
		$method = new \ReflectionMethod( Module::class, 'is_llms_txt_request' );
		$method->setAccessible( true );

		// Act
		$result = $method->invoke( $this->module );

		// Cleanup
		unset( $_SERVER['REQUEST_URI'] );

		// Assert
		$this->assertTrue( $result );
	}

	public function test_is_llms_txt_request__does_not_match_other_paths() {
		// Arrange
		$_SERVER['REQUEST_URI'] = '/about';
		$method = new \ReflectionMethod( Module::class, 'is_llms_txt_request' );
		$method->setAccessible( true );

		// Act
		$result = $method->invoke( $this->module );

		// Cleanup
		unset( $_SERVER['REQUEST_URI'] );

		// Assert
		$this->assertFalse( $result );
	}
}
