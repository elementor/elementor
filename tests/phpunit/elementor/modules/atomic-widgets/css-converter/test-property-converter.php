<?php

namespace Elementor\Testing\Modules\AtomicWidgets\CssConverter;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Property_Converter_Base;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Mock_Color_Converter extends Property_Converter_Base {
	protected function get_supported_properties(): array {
		return [ 'color', 'border-color' ];
	}

	protected function do_convert( Conversion_Context $context, array $rule ): bool {
		$context->set_prop( $rule['property'], $rule['value'] );

		return true;
	}
}

class Test_Property_Converter extends TestCase {

	public function test_is_supported__true_for_enumerated_property() {
		// Arrange.
		$converter = new Mock_Color_Converter();

		// Act.
		$result = $converter->is_supported( [ 'property' => 'border-color', 'value' => 'red' ] );

		// Assert.
		$this->assertTrue( $result );
	}

	public function test_is_supported__false_for_unowned_property() {
		// Arrange.
		$converter = new Mock_Color_Converter();

		// Act.
		$result = $converter->is_supported( [ 'property' => 'background-color', 'value' => 'red' ] );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_is_supported__false_for_missing_property() {
		// Arrange.
		$converter = new Mock_Color_Converter();

		// Act.
		$result = $converter->is_supported( [ 'value' => 'red' ] );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_convert__writes_prop_into_context() {
		// Arrange.
		$converter = new Mock_Color_Converter();
		$context = new Conversion_Context();

		// Act.
		$converted = $converter->convert( $context, [ 'property' => 'color', 'value' => '#ff0000' ] );

		// Assert.
		$this->assertTrue( $converted );
		$this->assertTrue( $context->has_prop( 'color' ) );
		$this->assertSame( '#ff0000', $context->get_prop( 'color' ) );
	}

	public function test_context__last_write_wins_on_conflict() {
		// Arrange.
		$context = new Conversion_Context();

		// Act.
		$context->set_prop( 'color', 'red' );
		$context->set_prop( 'color', 'blue' );

		// Assert.
		$this->assertSame( 'blue', $context->get_prop( 'color' ) );
	}

	public function test_context__exposes_rules_and_empty_global_variables() {
		// Arrange.
		$rules = [ [ 'property' => 'color', 'value' => 'red' ] ];

		// Act.
		$context = new Conversion_Context( $rules );

		// Assert.
		$this->assertSame( $rules, $context->get_rules() );
		$this->assertSame( [], $context->get_global_variables() );
		$this->assertSame( [], $context->get_props() );
	}
}
