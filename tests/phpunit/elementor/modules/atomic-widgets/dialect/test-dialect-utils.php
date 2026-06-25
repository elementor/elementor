<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Dialect;

use Elementor\Modules\AtomicWidgets\Dialect\Dialect_Utils;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Dialect_Utils extends TestCase {
	public function test_omit_returns_consistent_signal() {
		// Arrange & Act
		$signal = Dialect_Utils::omit();

		// Assert
		$this->assertTrue( Dialect_Utils::is_omit( $signal ) );
	}

	public function test_is_omit_returns_false_for_non_signal() {
		$this->assertFalse( Dialect_Utils::is_omit( 'something-else' ) );
		$this->assertFalse( Dialect_Utils::is_omit( [] ) );
		$this->assertFalse( Dialect_Utils::is_omit( null ) );
	}
}
