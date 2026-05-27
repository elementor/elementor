<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Styles;

use Elementor\Modules\AtomicWidgets\Styles\Size_Constants;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Size_Constants extends TestCase {

	public function test_grid_auto_track_returns_expected_units_in_preferred_order() {
		// Arrange.
		$expected = [ 'px', '%', 'fr', 'auto', 'custom' ];

		// Act.
		$result = Size_Constants::grid_auto_track();

		// Assert.
		$this->assertSame( $expected, $result );
	}
}
