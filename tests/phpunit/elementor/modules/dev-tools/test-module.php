<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Common\DevTools;

use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\DevTools\Module;

class Elementor_Test_Module extends Elementor_Test_Base {
	/**
	 * @var \Elementor\Modules\DevTools\Module
	 */
	private $module;

	public function setUp(): void {
		parent::setUp();

		$this->module = new Module();
	}

	public function test_get_settings() {
		// Act.
		$settings = $this->module->get_settings();

		// Assert.
		$this->assertArrayHasKey( 'isDebug', $settings );
		$this->assertArrayHasKey( 'urls', $settings );
		$this->assertArrayHasKey( 'deprecation', $settings );
	}
}
