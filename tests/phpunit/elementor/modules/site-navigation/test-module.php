<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\SiteNavigation;

use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\SiteNavigation\Module as SiteNavigation;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Plugin;

class Elementor_Test_Module extends Elementor_Test_Base {
	private $original_experiment_default_state;

	public function setUp() {
		parent::setUp();

		remove_all_filters( 'elementor/editor/v2/scripts/env' );

		$this->original_experiment_default_state = Plugin::$instance->experiments
			->get_features( SiteNavigation::PAGES_PANEL_EXPERIMENT_NAME )['default'];
	}

	public function tearDown() {
		parent::tearDown();

		Plugin::$instance->experiments->set_feature_default_state(
			SiteNavigation::PAGES_PANEL_EXPERIMENT_NAME,
			$this->original_experiment_default_state
		);
	}


	public function test_construct_experiment_inactive() {
		// Arrange
		Plugin::$instance->experiments->set_feature_default_state(
			SiteNavigation::PAGES_PANEL_EXPERIMENT_NAME,
			Experiments_Manager::STATE_INACTIVE
		);

		// Act.
		$module = new SiteNavigation();

		// Assert.
		$env = apply_filters( 'elementor/editor/v2/scripts/env', [] );
		$this->assertArrayNotHasKey( '@elementor/editor-site-navigation', $env );
	}

	public function test_construct_experiment_active() {
		// Arrange
		Plugin::$instance->experiments->set_feature_default_state(
			SiteNavigation::PAGES_PANEL_EXPERIMENT_NAME,
			Experiments_Manager::STATE_ACTIVE
		);

		// Act.
		$module = new SiteNavigation();

		// Assert.
		$env = apply_filters( 'elementor/editor/v2/scripts/env', [] );
		$this->assertTrue( $env['@elementor/editor-site-navigation']['is_pages_panel_active'] );
	}
}
