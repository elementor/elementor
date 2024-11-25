<?php
namespace Elementor\Testing\Modules\EditorAppBar;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\EditorAppBar\Module;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Module extends Elementor_Test_Base {
	private $experiment_default_state;

	public function set_up(): void {
		parent::set_up();

		$this->experiment_default_state = Plugin::instance()->experiments->get_features( Module::EXPERIMENT_NAME )[ 'default' ];

		remove_all_filters( 'elementor/editor/v2/packages' );
		remove_all_filters( 'elementor/editor/v2/styles' );
		remove_all_filters( 'elementor/editor/templates' );
		remove_all_actions( 'elementor/editor/v2/scripts/enqueue' );
		remove_all_actions( 'elementor/editor/v2/styles/enqueue' );
	}

	public function tear_down() {
		parent::tear_down();

		Plugin::instance()->experiments->set_feature_default_state( Module::EXPERIMENT_NAME, $this->experiment_default_state );
	}

	public function test__enqueues_packages_and_styles_when_experiment_on() {
		// Arrange
		Plugin::instance()->experiments->set_feature_default_state( Module::EXPERIMENT_NAME, Experiments_Manager::STATE_ACTIVE );

		// Act
		 new Module();

		// Assert
		$packages = apply_filters( 'elementor/editor/v2/packages', [] );
		$styles = apply_filters( 'elementor/editor/v2/styles', [] );

		$this->assertEquals( Module::PACKAGES, $packages );
		$this->assertEquals( Module::STYLES, $styles );
	}

	public function test_it__does_not_enqueue_packages_and_styles_when_experiment_off() {
		// Arrange
		Plugin::instance()->experiments->set_feature_default_state( Module::EXPERIMENT_NAME, Experiments_Manager::STATE_INACTIVE );

		// Act
		new Module();

		// Assert
		$packages = apply_filters( 'elementor/editor/v2/packages', [] );
		$styles = apply_filters( 'elementor/editor/v2/styles', [] );

		$this->assertEmpty( $packages );
		$this->assertEmpty( $styles );
	}

	public function test_it__dequeues_responsive_bar_script_and_style_when_experiment_on() {
		// Arrange
		Plugin::instance()->experiments->set_feature_default_state( Module::EXPERIMENT_NAME, Experiments_Manager::STATE_ACTIVE );

		add_action( 'elementor/editor/v2/scripts/enqueue', fn() => wp_enqueue_script( 'elementor-responsive-bar', 'http://example.com/responsive-bar.js' ) );
		add_action( 'elementor/editor/v2/styles/enqueue', fn() => wp_enqueue_style( 'elementor-responsive-bar', 'http://example.com/responsive-bar.css' ) );

		// Act
		new Module();

		do_action( 'elementor/editor/v2/scripts/enqueue' );
		do_action( 'elementor/editor/v2/styles/enqueue' );

		// Assert
		$this->assertFalse( wp_script_is( 'elementor-responsive-bar') );
		$this->assertFalse( wp_style_is( 'elementor-responsive-bar') );
	}

	public function test_it__doesnt_dequeue_responsive_bar_script_and_style_when_experiment_off() {
		// Arrange
		Plugin::instance()->experiments->set_feature_default_state( Module::EXPERIMENT_NAME, Experiments_Manager::STATE_INACTIVE );

		add_action( 'elementor/editor/v2/scripts/enqueue', fn() => wp_enqueue_script( 'elementor-responsive-bar', 'http://example.com/responsive-bar.js' ) );
		add_action( 'elementor/editor/v2/styles/enqueue', fn() => wp_enqueue_style( 'elementor-responsive-bar', 'http://example.com/responsive-bar.css' ) );

		// Act
		new Module();

		do_action( 'elementor/editor/v2/scripts/enqueue' );
		do_action( 'elementor/editor/v2/styles/enqueue' );

		// Assert
		$this->assertTrue( wp_script_is( 'elementor-responsive-bar') );
		$this->assertTrue( wp_style_is( 'elementor-responsive-bar') );
	}

	public function test_it__removes_responsive_bar_template_when_experiment_on() {
		// Arrange
		Plugin::instance()->experiments->set_feature_default_state( Module::EXPERIMENT_NAME, Experiments_Manager::STATE_ACTIVE );

		// Act
		new Module();

		$templates = apply_filters( 'elementor/editor/templates', [ 'responsive-bar' ] );

		// Assert
		$this->assertEmpty( $templates );
	}

	public function test_it__doesnt_remove_responsive_bar_template_when_experiment_off() {
		// Arrange
		Plugin::instance()->experiments->set_feature_default_state( Module::EXPERIMENT_NAME, Experiments_Manager::STATE_INACTIVE );

		// Act
		new Module();

		$templates = apply_filters( 'elementor/editor/templates', [ 'responsive-bar' ] );

		// Assert
		$this->assertEquals( [ 'responsive-bar' ], $templates );
	}
}
