<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Control_Value_Compatibility;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Value_Resolvers;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Control_Value_Compatibility extends TestCase {

	public function test_infer_resolver__uses_text_for_select_controls_even_for_width_property() {
		// Arrange.
		$control = [
			'type' => 'select',
			'selectors' => [
				'{{WRAPPER}}' => 'width: {{VALUE}}; max-width: {{VALUE}}',
			],
		];

		// Act.
		$resolver = V3_Control_Value_Compatibility::infer_resolver( $control, 'width' );

		// Assert.
		$this->assertSame( 'text', $resolver );
	}

	public function test_accepts__rejects_dimension_array_for_select_control() {
		// Arrange.
		$control = [ 'type' => 'select' ];

		// Act.
		$accepted = V3_Control_Value_Compatibility::accepts(
			$control,
			'dimension',
			[ 'unit' => 'rem', 'size' => 40 ]
		);

		// Assert.
		$this->assertFalse( $accepted );
	}

	public function test_resolve_element_width__maps_numeric_value_to_custom_width_pair() {
		// Act.
		$patch = V3_Value_Resolvers::resolve_element_width( '40rem' );

		// Assert.
		$this->assertSame( 'initial', $patch['_element_width'] );
		$this->assertSame( [ 'unit' => 'rem', 'size' => 40.0 ], $patch['_element_custom_width'] );
	}

	public function test_resolve_element_width__maps_full_width_keyword_to_inherit_mode() {
		// Act.
		$patch = V3_Value_Resolvers::resolve_element_width( '100%' );

		// Assert.
		$this->assertSame( [ '_element_width' => 'inherit' ], $patch );
	}
}
