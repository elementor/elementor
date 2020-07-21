<?php
namespace Elementor\Testing\Modules\Screenshots\Module;

use Elementor\Modules\Screenshots\Module;
use Elementor\Testing\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Elementor_Test_Enqueue_Scripts extends Elementor_Test_Base {

	/**
	 * @var Module
	 */
	private $module;

	public function setUp() {
		parent::setUp();

		$this->module = Module::instance();
	}

	public function test_should_register_module_scripts() {
		$post = $this->factory()->create_and_get_default_post();

		$_GET[Module::SCREENSHOT_PARAM_NAME] = $post->ID;

		$this->module->enqueue_scripts();

		$this->assertTrue( wp_script_is( 'dom-to-image' ) );
		$this->assertTrue( wp_script_is( 'elementor-screenshot' ) );
	}
}
