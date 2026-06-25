<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Dialect;

use Elementor\Modules\AtomicWidgets\Dialect\Base_Dialect_Adapter;
use Elementor\Modules\AtomicWidgets\Dialect\Dialect_Utils;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Dialect_Utils extends TestCase {
	public function test_get_adapters_by_element_returns_empty_for_unknown_element() {
		// Arrange
		$unknown_element = 'non-existent-element';
		$dialect = 'llm';

		// Act
		$adapters = Dialect_Utils::get_adapters_by_element( $unknown_element, $dialect );

		// Assert
		$this->assertSame( [], $adapters );
	}
}
