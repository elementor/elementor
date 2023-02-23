<?php

namespace Elementor\Testing\Modules\Announcements;

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

	public function setUp() {
		parent::setUp();

		wp_set_current_user( self::factory()->get_administrator_user()->ID );

		$this->module = new Module();
	}

	public function test_get_name(): void {
		$this->assertTrue(
			$this->name === $this->module->get_name(),
			'Test module name is correct'
		);
	}

	public function test_is_active(): void {
		$this->assertTrue(
			$this->module->is_active(),
			'Test module name is correct'
		);
	}

	public function test_construct_assets() {
		// Act
		$this->module->__construct();
		do_action( 'elementor/editor/after_enqueue_scripts' );

		// Assert
		$announcement_script = array_search( 'announcements-app', wp_scripts()->queue );
		$this->assertTrue( $announcement_script >= 0 );

		$announcement_style = array_search( 'announcements-app', wp_styles()->queue );
		$this->assertTrue( $announcement_style >= 0 );
	}

	public function test_construct_render() {
		// Act
		$this->module->__construct();

		ob_start();
		do_action( 'elementor/editor/footer');
		$result = ob_get_clean();

		// Assert
		$this->assertStringContainsString( '<div id="e-announcements-root"></div>', $result );
	}
}
