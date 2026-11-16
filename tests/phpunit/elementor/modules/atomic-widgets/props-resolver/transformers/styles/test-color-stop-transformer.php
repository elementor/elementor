<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles\Color_Stop_Transformer;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Color_Stop_Transformer extends TestCase {
	private Color_Stop_Transformer $transformer;
	private Props_Resolver_Context $context;

	public function setUp(): void {
		parent::setUp();

		$this->transformer = new Color_Stop_Transformer();
		$this->context = Props_Resolver_Context::make();
	}

	public function test_transform__with_offset_emits_color_and_percent() {
		// Act.
		$result = $this->transformer->transform( [
			'color' => '#ff0000',
			'offset' => 25,
		], $this->context );

		// Assert.
		$this->assertSame( '#ff0000 25%', $result );
	}

	public function test_transform__with_null_offset_emits_color_only() {
		// Act.
		$result = $this->transformer->transform( [
			'color' => '#ff0000',
			'offset' => null,
		], $this->context );

		// Assert: valid CSS — browser distributes stops automatically.
		$this->assertSame( '#ff0000', $result );
	}

	public function test_transform__with_missing_offset_key_emits_color_only() {
		// Act.
		$result = $this->transformer->transform( [
			'color' => '#ff0000',
		], $this->context );

		// Assert.
		$this->assertSame( '#ff0000', $result );
	}

	public function test_transform__with_zero_offset_emits_zero_percent() {
		// Act.
		$result = $this->transformer->transform( [
			'color' => '#ff0000',
			'offset' => 0,
		], $this->context );

		// Assert: 0 is a valid position and must be preserved.
		$this->assertSame( '#ff0000 0%', $result );
	}
}
