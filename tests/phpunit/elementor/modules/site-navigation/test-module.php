<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\SiteNavigation;

use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\SiteNavigation\Module as SiteNavigation;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Plugin;

class Elementor_Test_Module extends Elementor_Test_Base {
	/**
	 * @var SiteNavigation
	 */
	protected $module;

	/**
	 * @var string module name
	 */
	public $name = 'site-navigation';

	private $original_experiment_default_state;

	public function setUp() {
		parent::setUp();

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
		remove_all_filters( 'elementor/editor-v2/packages/client-env' );

		Plugin::$instance->experiments->set_feature_default_state(
			SiteNavigation::PAGES_PANEL_EXPERIMENT_NAME,
			Experiments_Manager::STATE_INACTIVE
		);

		$this->module = new SiteNavigation();

		// Act.
		$env = apply_filters( 'elementor/editor-v2/packages/client-env', [] );

		// Assert.
		$this->assertEmpty( $env['@elementor/editor-site-navigation'] );
	}

	public function test_construct_experiment_active() {
		remove_all_filters( 'elementor/editor-v2/packages/client-env' );

		Plugin::$instance->experiments->set_feature_default_state(
			SiteNavigation::PAGES_PANEL_EXPERIMENT_NAME,
			Experiments_Manager::STATE_ACTIVE
		);

		$this->module = new SiteNavigation();

		// Act.
		$env = apply_filters( 'elementor/editor-v2/packages/client-env', [] );

		// Assert.
		$this->assertTrue( $env['@elementor/editor-site-navigation']['is_pages_panel_active'] );
	}

	public function test_get_name() {
		// Assert.
		$this->assertTrue(
			$this->name === $this->module->get_name(),
			'Test module name is correct'
		);
	}

	public function test_get_experimental_data() {
		// Arrange.
		$experimental_data = [
			'name' => SiteNavigation::PAGES_PANEL_EXPERIMENT_NAME,
			'title' => esc_html__( 'Pages Panel', 'elementor' ),
			'release_status' => Experiments_Manager::RELEASE_STATUS_BETA,
			'default' => Experiments_Manager::STATE_INACTIVE,
			'hidden' => true,
			'dependencies' => [
				'editor_v2',
			],
		];

		// Assert.
		$this->assertEquals( $experimental_data, SiteNavigation::get_experimental_data() );
	}
}
