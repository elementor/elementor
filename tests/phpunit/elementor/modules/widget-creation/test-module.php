<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\WidgetCreation;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\WidgetCreation\Module;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Module extends Elementor_Test_Base {
	private $original_experiment_default_state;

	public function set_up() {
		parent::set_up();

		$this->original_experiment_default_state = Plugin::$instance->experiments
			->get_features( Module::EXPERIMENT_NAME )['default'];

		Plugin::$instance->experiments->set_feature_default_state(
			Module::EXPERIMENT_NAME,
			Experiments_Manager::STATE_ACTIVE
		);
	}

	public function tear_down() {
		parent::tear_down();

		Plugin::$instance->experiments->set_feature_default_state(
			Module::EXPERIMENT_NAME,
			$this->original_experiment_default_state
		);
	}

	public function test_heading_cta_is_rendered_for_admin() {
		// Arrange.
		wp_set_current_user( $this->factory()->create_and_get_administrator_user()->ID );
		$module = new Module();

		// Act.
		ob_start();
		$module->render_custom_widgets_category_heading_cta();
		$output = ob_get_clean();

		// Assert.
		$this->assertStringContainsString( 'elementor-panel-custom-widgets__cta', $output );
	}

	public function test_heading_cta_is_not_rendered_for_non_admin() {
		// Arrange.
		$subscriber_id = $this->factory()->user->create( [ 'role' => 'subscriber' ] );
		wp_set_current_user( $subscriber_id );
		$module = new Module();

		// Act.
		ob_start();
		$module->render_custom_widgets_category_heading_cta();
		$output = ob_get_clean();

		// Assert.
		$this->assertEmpty( $output );
	}

	public function test_heading_cta_is_not_rendered_when_experiment_is_inactive() {
		// Arrange.
		Plugin::$instance->experiments->set_feature_default_state(
			Module::EXPERIMENT_NAME,
			Experiments_Manager::STATE_INACTIVE
		);
		wp_set_current_user( $this->factory()->create_and_get_administrator_user()->ID );
		$module = new Module();

		// Act.
		ob_start();
		$module->render_custom_widgets_category_heading_cta();
		$output = ob_get_clean();

		// Assert.
		$this->assertEmpty( $output );
	}
}
