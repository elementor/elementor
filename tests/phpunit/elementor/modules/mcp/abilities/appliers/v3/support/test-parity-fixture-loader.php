<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Support;

use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/parity-fixture-loader.php';
require_once __DIR__ . '/../fixtures/v3-widget-fixtures.php';

class Test_Parity_Fixture_Loader extends TestCase {

	public function test_all__loads_launch_widget_fixtures() {
		$fixtures = Parity_Fixture_Loader::all();

		$this->assertSame( Parity_Fixture_Loader::LAUNCH_WIDGET_TYPES, array_keys( $fixtures ) );
	}

	public function test_compiled_expectations__normalizes_legacy_supported_list() {
		$fixtures = Parity_Fixture_Loader::all();
		$heading = Parity_Fixture_Loader::compiled_expectations( $fixtures['heading'] );

		$this->assertSame( 'heading', $heading['widget_type'] );
		$this->assertContains( 'color', $heading['style_targets']['heading'] );
		$this->assertContains( 'filter', $heading['unsupported'] );
	}

	public function test_has_controls__is_true_only_for_captured_widgets() {
		$this->assertTrue( Parity_Fixture_Loader::has_controls( 'nav-menu' ) );
		$this->assertFalse( Parity_Fixture_Loader::has_controls( 'heading' ) );
	}
}
