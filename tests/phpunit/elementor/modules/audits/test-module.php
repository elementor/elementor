<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Audits;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\Audits\Data\Controller;
use Elementor\Modules\Audits\Module;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Module extends Elementor_Test_Base {

	private $original_experiment_default_state;

	public function setUp(): void {
		parent::setUp();

		remove_all_filters( 'elementor/editor/v2/packages' );
		remove_all_actions( 'elementor/editor/v2/scripts/enqueue' );
		unset( Plugin::$instance->data_manager_v2->controllers['audits'] );

		$this->original_experiment_default_state = Plugin::$instance->experiments
			->get_features( Module::EXPERIMENT_NAME )['default'];
	}

	public function tearDown(): void {
		Plugin::$instance->experiments->set_feature_default_state(
			Module::EXPERIMENT_NAME,
			$this->original_experiment_default_state
		);

		parent::tearDown();
	}

	public function test_module_name_is_audits() {
		// Arrange / Act.
		$module = new Module();

		// Assert.
		$this->assertSame( 'audits', $module->get_name() );
	}

	public function test_registers_a_beta_experiment() {
		// Act.
		new Module();

		// Assert.
		$feature = Plugin::$instance->experiments->get_features( Module::EXPERIMENT_NAME );
		$this->assertSame( Experiments_Manager::RELEASE_STATUS_BETA, $feature['release_status'] );
		$this->assertSame( Experiments_Manager::STATE_INACTIVE, $feature['default'] );
	}

	public function test_data_controller_is_not_registered_when_experiment_is_inactive() {
		// Arrange.
		Plugin::$instance->experiments->set_feature_default_state( Module::EXPERIMENT_NAME, Experiments_Manager::STATE_INACTIVE );

		// Act.
		new Module();

		// Assert.
		$this->assertFalse( Plugin::$instance->data_manager_v2->get_controller( 'audits' ) );
	}

	public function test_data_controller_is_registered_when_experiment_is_active() {
		// Arrange.
		Plugin::$instance->experiments->set_feature_default_state( Module::EXPERIMENT_NAME, Experiments_Manager::STATE_ACTIVE );

		// Act.
		new Module();

		// Assert.
		$this->assertInstanceOf( Controller::class, Plugin::$instance->data_manager_v2->get_controller( 'audits' ) );
	}

	public function test_packages_filter_is_not_added_when_experiment_is_inactive() {
		// Arrange.
		Plugin::$instance->experiments->set_feature_default_state( Module::EXPERIMENT_NAME, Experiments_Manager::STATE_INACTIVE );

		// Act.
		new Module();
		$packages = apply_filters( 'elementor/editor/v2/packages', [] );

		// Assert.
		$this->assertNotContains( 'editor-audits', $packages );
		$this->assertNotContains( 'editor-floating-panels', $packages );
	}

	public function test_packages_filter_adds_floating_panels_and_audits_when_experiment_is_active() {
		// Arrange.
		Plugin::$instance->experiments->set_feature_default_state( Module::EXPERIMENT_NAME, Experiments_Manager::STATE_ACTIVE );

		// Act.
		new Module();
		$packages = apply_filters( 'elementor/editor/v2/packages', [] );

		// Assert.
		$this->assertContains( 'editor-floating-panels', $packages );
		$this->assertContains( 'editor-audits', $packages );
	}

	public function test_inline_config_is_not_printed_when_experiment_is_inactive() {
		// Arrange.
		Plugin::$instance->experiments->set_feature_default_state( Module::EXPERIMENT_NAME, Experiments_Manager::STATE_INACTIVE );
		new Module();
		wp_register_script( 'elementor-v2-editor-audits', 'http://example.test/editor-audits.js', [], '1.0', true );

		// Act.
		do_action( 'elementor/editor/v2/scripts/enqueue' );

		// Assert.
		$this->assertEmpty( wp_scripts()->get_data( 'elementor-v2-editor-audits', 'data' ) );
	}

	public function test_inline_config_is_printed_when_editor_assets_enqueue_and_experiment_is_active() {
		// Arrange.
		Plugin::$instance->experiments->set_feature_default_state( Module::EXPERIMENT_NAME, Experiments_Manager::STATE_ACTIVE );
		new Module();
		wp_register_script( 'elementor-v2-editor-audits', 'http://example.test/editor-audits.js', [], '1.0', true );

		// Act.
		do_action( 'elementor/editor/v2/scripts/enqueue' );

		// Assert.
		$inline = wp_scripts()->get_data( 'elementor-v2-editor-audits', 'data' );
		$this->assertIsString( $inline );
		$this->assertStringContainsString( 'window.elementorAudits', $inline );
		$this->assertStringContainsString( '"restNamespace"', $inline );
		$this->assertStringNotContainsString( '"audits"', $inline );
	}
}
