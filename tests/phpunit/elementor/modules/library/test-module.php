<?php
namespace Elementor\Testing\Modules\Library;

use Elementor\Modules\Library\Module;
use Elementor\Testing\Elementor_Test_Base;

class Elementor_Test_Module extends Elementor_Test_Base {
	/** @var Module */
	private static $module;

	public function test_should_confirm_module_activation() {
		self::$module = new Module();
		$this->assertDocumentTypeRegistered('page');
		$this->assertDocumentTypeRegistered('section');
		$this->assertDocumentGroupRegistered('blocks');
		$this->assertDocumentGroupRegistered('pages');
	}

	public function test_should_return_library() {
		$this->assertEquals( 'library', self::$module->get_name() );
	}

	public function test_should_localize_settings() {
		$res = self::$module->localize_settings( [] );
		$this->assertEquals(
			[
				'i18n' => [],
			], $res
		);

		$res = self::$module->localize_settings( [
			'content one' => [],
			'content two' => [],
		] );
		$this->assertEquals(
			[
				'content one' => [],
				'content two' => [],
				'i18n' => [],
			], $res
		);
	}

}
