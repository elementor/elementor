<?php
namespace Elementor\Tests\Phpunit\Includes\Settings;

use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Utils;
use Elementor\Plugin;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\EditorOne\Module as EditorOneModule;

class Test_Settings extends Elementor_Test_Base {

	public function setUp(): void {
		parent::setUp();
		$this->activate_editor_one_experiment();
	}

	public function tearDown(): void {
		parent::tearDown();
		$this->deactivate_editor_one_experiment();
	}

	public function test_register_admin_menu() {
		// Arrange.
		$this->act_as_admin();

		// Act.
		do_action( 'admin_menu' );

		// Assert.
		global $submenu;

		$elementor_menu = $submenu['elementor-home'];

		$expected_items = [
			'elementor-home' => 'Home',
			'elementor-editor' => 'Editor',
		];

		$index = 0;

		foreach ( $expected_items as $expected_slug => $expected_label ) {
			$actual_label = $elementor_menu[ $index ][0];
			$actual_slug = $elementor_menu[ $index ][2];

			$this->assertEquals( $expected_label, $actual_label );
			$this->assertEquals( $expected_slug, $actual_slug );

			$index++;
		}
	}

	private function activate_editor_one_experiment(): void {
		$experiments = Plugin::instance()->experiments;
		$experiments->set_feature_default_state(
			EditorOneModule::EXPERIMENT_NAME,
			Experiments_Manager::STATE_ACTIVE
		);
	}

	private function deactivate_editor_one_experiment(): void {
		$experiments = Plugin::instance()->experiments;
		$experiments->set_feature_default_state(
			EditorOneModule::EXPERIMENT_NAME,
			Experiments_Manager::STATE_INACTIVE
		);
	}
}

