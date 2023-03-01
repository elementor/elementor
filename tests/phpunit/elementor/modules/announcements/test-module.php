<?php

namespace Elementor\Testing\Modules\Announcements;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\Announcements\Module;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Elementor_Test_Module extends Elementor_Test_Base {
	/**
	 * @var Module
	 */
	protected $module;

	/**
	 * @var string module name
	 */
	public $name = 'announcements';

	/**
	 * @var string experiment name
	 */
	private $experiment = 'container';

	private $original_experiment_default_state;

	public function setUp() {
		parent::setUp();

		$this->original_experiment_default_state = Plugin::$instance->experiments
			->get_features( $this->experiment )['default'];

		Plugin::$instance->experiments->set_feature_default_state(
			$this->experiment,
			Experiments_Manager::STATE_INACTIVE
		);

		$this->act_as_admin();

		//To be in admin page in Elementor editor

		$post_id = $this->factory()->create_and_get_default_post()->ID;
		$document = Plugin::$instance->documents->get( $post_id );
		$document->set_is_built_with_elementor( true );
		$edit_link = $document->get_edit_url();
		$this->go_to( $edit_link );
		set_current_screen( 'edit-post' );

		$this->module = new Module();
	}

	public function tearDown() {
		parent::tearDown();

		Plugin::$instance->experiments->set_feature_default_state(
			$this->experiment,
			$this->original_experiment_default_state
		);
	}

	public function test_get_name() {
		$this->assertTrue(
			$this->name === $this->module->get_name(),
			'Test module name is correct'
		);
	}

	public function test_is_active() {
		$this->assertTrue(
			$this->module->is_active(),
			'Test module is active'
		);
	}

	public function test_construct_assets() {
		// Act
		do_action( 'elementor/editor/after_enqueue_scripts' );
		$announcement_script = array_search( 'elementor-announcements-app', wp_scripts()->queue );

		// Assert
		$this->assertTrue( $announcement_script >= 0 );

		$announcement_style = array_search( 'elementor-announcements-app', wp_styles()->queue );
		$this->assertTrue( $announcement_style >= 0 );
	}

	public function test_construct_render() {
		// Act
		ob_start();
		do_action( 'elementor/editor/footer' );
		$result = ob_get_clean();

		// Assert
		$this->assertStringContainsString( '<div id="e-announcements-root"></div>', $result );
	}
}
