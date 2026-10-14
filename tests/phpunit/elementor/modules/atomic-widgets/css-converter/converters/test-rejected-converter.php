<?php

namespace Elementor\Testing\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Converters\Rejected_Converter;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Rejected_Converter extends TestCase {
	public function test_convert__adds_declaration_to_rejected_and_returns_true() {
		// Arrange.
		$converter = new Rejected_Converter( 'animation' );
		$context = new Conversion_Context( [] );

		// Act.
		$result = $converter->convert( $context, [
			'property'    => 'animation',
			'value'       => 'spin 1s linear infinite',
			'declaration' => 'animation: spin 1s linear infinite',
		] );

		// Assert.
		$this->assertTrue( $result );
		$this->assertSame( [ 'animation: spin 1s linear infinite;' ], $context->get_rejected() );
		$this->assertEmpty( $context->get_props() );
	}

	public function test_convert__multiple_rejected_declarations_accumulate() {
		// Arrange.
		$converter_anim = new Rejected_Converter( 'animation' );
		$converter_name = new Rejected_Converter( 'animation-name' );
		$context = new Conversion_Context( [] );

		// Act.
		$converter_anim->convert( $context, [
			'property' => 'animation', 'value' => 'spin 1s', 'declaration' => 'animation: spin 1s',
		] );
		$converter_name->convert( $context, [
			'property' => 'animation-name', 'value' => 'slide', 'declaration' => 'animation-name: slide',
		] );

		// Assert.
		$this->assertCount( 2, $context->get_rejected() );
		$this->assertSame( 'animation: spin 1s;', $context->get_rejected()[0] );
		$this->assertSame( 'animation-name: slide;', $context->get_rejected()[1] );
	}

	public function test_convert__rejected_property_does_not_appear_in_custom_css() {
		// Arrange.
		$converter = new Rejected_Converter( 'animation' );
		$context = new Conversion_Context( [] );

		// Act.
		$converter->convert( $context, [
			'property' => 'animation', 'value' => 'spin 1s', 'declaration' => 'animation: spin 1s',
		] );

		// Assert: returns true so the converter loop does NOT add to leftover/customCss.
		$this->assertEmpty( $context->get_props() );
	}
}
