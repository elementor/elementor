<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles\Background_Gradient_Overlay_Transformer;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Background_Gradient_Overlay_Transformer extends TestCase {
	private Background_Gradient_Overlay_Transformer $transformer;
	private Props_Resolver_Context $context;

	public function setUp(): void {
		parent::setUp();

		$this->transformer = new Background_Gradient_Overlay_Transformer();
		$this->context = Props_Resolver_Context::make();
	}

	public function test_transform__linear_with_angle_emits_degrees() {
		// Act.
		$result = $this->transformer->transform( [
			'type' => 'linear',
			'angle' => 180,
			'stops' => 'red 0%,blue 100%',
			'positions' => null,
		], $this->context );

		// Assert.
		$this->assertSame( 'linear-gradient(180deg, red 0%,blue 100%)', $result );
	}

	public function test_transform__linear_with_null_angle_omits_angle() {
		// Act.
		$result = $this->transformer->transform( [
			'type' => 'linear',
			'angle' => null,
			'stops' => 'rgba(0, 0, 0, 0.35) 0%,rgba(0, 0, 0, 0.35) 100%',
			'positions' => null,
		], $this->context );

		// Assert: a missing angle is valid CSS (to bottom). "nulldeg" drops the whole background-image.
		$this->assertSame( 'linear-gradient(rgba(0, 0, 0, 0.35) 0%,rgba(0, 0, 0, 0.35) 100%)', $result );
	}

	public function test_transform__linear_with_missing_angle_omits_angle() {
		// Act.
		$result = $this->transformer->transform( [
			'type' => 'linear',
			'stops' => 'red 0%,blue 100%',
		], $this->context );

		// Assert.
		$this->assertSame( 'linear-gradient(red 0%,blue 100%)', $result );
	}

	public function test_transform__linear_with_zero_angle_keeps_zero_degrees() {
		// Act.
		$result = $this->transformer->transform( [
			'type' => 'linear',
			'angle' => 0,
			'stops' => 'red 0%,blue 100%',
			'positions' => null,
		], $this->context );

		// Assert: 0deg is a real angle and must not be treated as missing.
		$this->assertSame( 'linear-gradient(0deg, red 0%,blue 100%)', $result );
	}

	public function test_transform__radial_emits_circle_at_position() {
		// Act.
		$result = $this->transformer->transform( [
			'type' => 'radial',
			'angle' => null,
			'positions' => 'bottom left',
			'stops' => 'red 0%,blue 100%',
		], $this->context );

		// Assert.
		$this->assertSame( 'radial-gradient(circle at bottom left, red 0%,blue 100%)', $result );
	}
}
