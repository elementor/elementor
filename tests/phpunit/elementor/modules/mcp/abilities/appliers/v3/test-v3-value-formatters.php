<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Value_Formatters;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Value_Formatters extends TestCase {

	public function test_format_color_returns_scalar() {
		$this->assertSame( '#ff0', V3_Value_Formatters::format( 'color', '#ff0' ) );
	}

	public function test_format_dimension_appends_unit() {
		$this->assertSame( '20px', V3_Value_Formatters::format( 'dimension', [ 'size' => 20, 'unit' => 'px' ] ) );
		$this->assertSame( '2rem', V3_Value_Formatters::format( 'dimension', [ 'size' => 2, 'unit' => 'rem' ] ) );
	}

	public function test_format_dimension_returns_null_for_empty_size() {
		$this->assertNull( V3_Value_Formatters::format( 'dimension', [ 'size' => '', 'unit' => 'px' ] ) );
		$this->assertNull( V3_Value_Formatters::format( 'dimension', null ) );
	}

	public function test_format_sides_shortens_linked_uniform_values() {
		$sides = [ 'top' => 4, 'right' => 4, 'bottom' => 4, 'left' => 4, 'unit' => 'px', 'isLinked' => true ];

		$this->assertSame( '4px', V3_Value_Formatters::format( 'sides', $sides ) );
	}

	public function test_format_sides_expands_when_not_linked() {
		$sides = [ 'top' => 1, 'right' => 2, 'bottom' => 3, 'left' => 4, 'unit' => 'px', 'isLinked' => false ];

		$this->assertSame( '1px 2px 3px 4px', V3_Value_Formatters::format( 'sides', $sides ) );
	}

	public function test_format_size_trims_trailing_zeros_on_floats() {
		$this->assertSame( '1.25', V3_Value_Formatters::format_size( 1.25 ) );
		$this->assertSame( '2', V3_Value_Formatters::format_size( 2 ) );
	}

	public function test_format_unknown_resolver_returns_null() {
		$this->assertNull( V3_Value_Formatters::format( 'unknown', 'x' ) );
	}
}
