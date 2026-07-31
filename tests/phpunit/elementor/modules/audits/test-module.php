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

	public function test_packages_filter_adds_floating_panels_and_audits() {
		// Arrange.
		Module::instance();

		// Act.
		$packages = apply_filters( 'elementor/editor/v2/packages', [] );

		// Assert.
		$this->assertContains( 'editor-floating-panels', $packages );
		$this->assertContains( 'editor-audits', $packages );
	}

	public function test_inline_config_is_printed_when_editor_assets_enqueue() {
		// Arrange.
		Module::instance();
		wp_register_script( 'elementor-v2-editor-audits', 'http://example.test/editor-audits.js', [], '1.0', true );

		// Act.
		do_action( 'elementor/editor/v2/scripts/enqueue' );

		// Assert.
		$inline = wp_scripts()->get_data( 'elementor-v2-editor-audits', 'data' );
		$this->assertIsString( $inline );
		$this->assertStringContainsString( 'window.elementorAudits', $inline );
		$this->assertStringContainsString( '"restNamespace"', $inline );
		$this->assertStringNotContainsString( '"audits"', $inline );
	}
}
