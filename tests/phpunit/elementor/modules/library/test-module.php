<?php
namespace Elementor\Testing\Modules\Library;

use Elementor\Modules\Library\Module;
use Elementor\Testing\Elementor_Test_Base;
use Elementor\Testing\Traits\Elementor_Library;

class Elementor_Test_Module extends Elementor_Test_Base {

	use Elementor_Library;

	/** @var Module */
	private static $module;

	public function test_should_confirm_module_activation() {
		self::$module = new Module();

		$this->assertDocumentTypeRegistered( 'page' );
		$this->assertDocumentTypeRegistered( 'section' );
	}

	public function test_should_return_library() {
		$this->assertEquals( 'library', self::$module->get_name() );
	}
}
