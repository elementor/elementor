<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Variable_Compatibility;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Variable_Compatibility extends TestCase {

	public function test_supports__color_family_properties() {
		// Arrange / Act / Assert.
		$this->assertTrue( V3_Variable_Compatibility::supports( 'color' ) );
		$this->assertTrue( V3_Variable_Compatibility::supports( 'background-color' ) );
		$this->assertTrue( V3_Variable_Compatibility::supports( 'border-color' ) );
		$this->assertTrue( V3_Variable_Compatibility::supports( 'border-top-color' ) );
		$this->assertTrue( V3_Variable_Compatibility::supports( 'outline-color' ) );
		$this->assertTrue( V3_Variable_Compatibility::supports( 'fill' ) );
		$this->assertTrue( V3_Variable_Compatibility::supports( 'stroke' ) );
		$this->assertTrue( V3_Variable_Compatibility::supports( 'caret-color' ) );
		$this->assertTrue( V3_Variable_Compatibility::supports( 'text-decoration-color' ) );
	}

	public function test_supports__is_case_insensitive_and_trims() {
		$this->assertTrue( V3_Variable_Compatibility::supports( 'COLOR' ) );
		$this->assertTrue( V3_Variable_Compatibility::supports( '  Background-Color  ' ) );
	}

	public function test_supports__rejects_sliders_and_dimensions() {
		// Arrange.
		$rejected = [
			'font-size',
			'line-height',
			'letter-spacing',
			'word-spacing',
			'font-weight',
			'width',
			'max-width',
			'min-width',
			'height',
			'max-height',
			'min-height',
			'padding',
			'padding-top',
			'margin',
			'margin-left',
			'border-radius',
			'border-width',
			'border-top-width',
			'top',
			'right',
			'bottom',
			'left',
			'gap',
			'opacity',
			'flex-basis',
		];

		// Act / Assert.
		foreach ( $rejected as $property ) {
			$this->assertFalse( V3_Variable_Compatibility::supports( $property ), $property . ' should be unsupported' );
		}
	}

	public function test_reject_reason__includes_property_and_guidance() {
		// Arrange / Act.
		$reason = V3_Variable_Compatibility::reject_reason( 'Font-Size' );

		// Assert.
		$this->assertStringContainsString( '`font-size`', $reason );
		$this->assertStringContainsString( 'literal value', $reason );
		$this->assertStringContainsString( 'V4', $reason );
	}

	public function test_is_var_reference__matches_var_prefix_only() {
		// Arrange / Act / Assert.
		$this->assertTrue( V3_Variable_Compatibility::is_var_reference( 'var(--x)' ) );
		$this->assertTrue( V3_Variable_Compatibility::is_var_reference( '  VAR(--x)' ) );
		$this->assertTrue( V3_Variable_Compatibility::is_var_reference( 'var( --x , red )' ) );
		$this->assertFalse( V3_Variable_Compatibility::is_var_reference( '16px' ) );
		$this->assertFalse( V3_Variable_Compatibility::is_var_reference( '#fff var(--x)' ) );
	}
}
