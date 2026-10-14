<?php

namespace Elementor\Testing\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Converters\Background_Image_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Converters\Background_Position_Property_Converter;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Background_Position_Property_Converter extends TestCase {
	private Background_Position_Property_Converter $converter;
	private Conversion_Context $context;

	public function setUp(): void {
		$this->converter = new Background_Position_Property_Converter();
		$this->context   = new Conversion_Context( [] );
		$this->seed_image_layer();
	}

	/**
	 * @dataProvider enum_provider
	 */
	public function test_convert__normalizes_to_enum_string( string $input, string $expected_enum ) {
		// Act.
		$result = $this->converter->convert( $this->context, $this->rule( $input ) );

		// Assert.
		$this->assertTrue( $result, "Expected '$input' to convert." );
		$position = $this->position_value();
		$this->assertSame( 'string', $position['$$type'] );
		$this->assertSame( $expected_enum, $position['value'] );
	}

	public static function enum_provider(): array {
		return [
			'center single'        => [ 'center', 'center center' ],
			'top single'           => [ 'top', 'top center' ],
			'bottom single'        => [ 'bottom', 'bottom center' ],
			'left single'          => [ 'left', 'center left' ],
			'right single'         => [ 'right', 'center right' ],
			'top left as-is'       => [ 'top left', 'top left' ],
			'left top swap'        => [ 'left top', 'top left' ],
			'right bottom swap'    => [ 'right bottom', 'bottom right' ],
			'center center'        => [ 'center center', 'center center' ],
		];
	}

	public function test_convert__two_sizes_emits_offset_object() {
		// Act.
		$result = $this->converter->convert( $this->context, $this->rule( '20% 80%' ) );

		// Assert.
		$this->assertTrue( $result );
		$position = $this->position_value();
		$this->assertSame( 'background-image-position-offset', $position['$$type'] );
		$this->assertSame( 20, $position['value']['x']['value']['size'] );
		$this->assertSame( '%', $position['value']['x']['value']['unit'] );
		$this->assertSame( 80, $position['value']['y']['value']['size'] );
	}

	/**
	 * @dataProvider unrepresentable_provider
	 */
	public function test_convert__declines_unrepresentable_values( string $input ) {
		// Act.
		$result = $this->converter->convert( $this->context, $this->rule( $input ) );

		// Assert.
		$this->assertFalse( $result, "Expected '$input' to decline." );
	}

	public static function unrepresentable_provider(): array {
		return [
			'keyword + length'   => [ 'center 20%' ],
			'length + keyword'   => [ '50% top' ],
			'three tokens'       => [ 'center top 20%' ],
			'edge offset edge'   => [ 'left 10px top' ],
			'bottom with length' => [ 'bottom 4px' ],
			'calc value'         => [ 'calc(100% - 5rem) center' ],
			'four tokens'        => [ 'left 10px top 20px' ],
			'unknown keyword'    => [ 'middle middle' ],
		];
	}

	private function position_value(): array {
		$background = $this->context->get_prop( 'background' );
		$overlay = $background['value']['background-overlay']['value'][0];
		return $overlay['value']['position'];
	}

	private function seed_image_layer(): void {
		( new Background_Image_Converter() )->convert( $this->context, [
			'property' => 'background-image',
			'value' => 'url(http://x/y.png)',
			'declaration' => 'background-image: url(http://x/y.png)',
		] );
	}

	private function rule( string $value ): array {
		return [
			'property' => 'background-position',
			'value' => $value,
			'declaration' => 'background-position: ' . $value,
		];
	}
}
