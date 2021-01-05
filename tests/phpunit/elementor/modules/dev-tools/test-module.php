<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Common\DevTools;

use Elementor\Plugin;
use Elementor\Testing\Elementor_Test_Base;
use Elementor\Modules\DevTools\Module;

class Elementor_Test_Module extends Elementor_Test_Base {
	/**
	 * @var \Elementor\Modules\DevTools\Module
	 */
	private $module;

	public function setUp() {
		parent::setUp();

		$this->module = new Module();
	}

	public function test_localize_settings() {
		$this->module->deprecation->deprecated_function(__FUNCTION__, '0.0.0', '', '0.0.0'  );

		$result = $this->module->localize_settings( [] );

		$this->assertEqualSets( [
			'0.0.0',
			'',
		], $result['dev_tools']['deprecation']['soft_notices'][ __FUNCTION__ ] );	}
}
