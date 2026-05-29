<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Audits;

use Elementor\Modules\Audits\Module;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Module extends TestCase {

	public function test_module_name_is_audits() {
		// Arrange / Act.
		$module = Module::instance();

		// Assert.
		$this->assertSame( 'audits', $module->get_name() );
	}

	public function test_inline_config_is_printed_when_editor_assets_enqueue() {
		// Arrange.
		$module = Module::instance();
		$module->register_data_controller();
		wp_register_script( 'elementor-audits', 'http://example.test/audits.js', [], '1.0', true );

		// Act.
		do_action( 'elementor/editor/before_enqueue_scripts' );

		// Assert: the inline script body must contain the global init.
		$inline = wp_scripts()->get_data( 'elementor-audits', 'data' );
		$this->assertIsString( $inline );
		$this->assertStringContainsString( 'window.elementorAudits', $inline );
		$this->assertStringContainsString( '"audits"', $inline );
	}
}
