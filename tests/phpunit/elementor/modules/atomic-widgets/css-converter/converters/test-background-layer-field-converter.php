<?php

namespace Elementor\Testing\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Converters\Background_Image_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Converters\Background_Layer_Field_Converter;
use Elementor\Modules\AtomicWidgets\PropTypes\Background_Image_Overlay_Size_Scale_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Background_Image_Position_Offset_Prop_Type;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Background_Layer_Field_Converter extends TestCase {
	const REPEAT_ENUM = [ 'repeat', 'repeat-x', 'repeat-y', 'no-repeat' ];
	const ATTACHMENT_ENUM = [ 'fixed', 'scroll' ];
	const SIZE_ENUM = [ 'auto', 'cover', 'contain' ];
	const POSITION_ENUM = [
		'center center',
		'center left',
		'center right',
		'top center',
		'top left',
		'top right',
		'bottom center',
		'bottom left',
		'bottom right',
	];

	public function test_convert__declines_when_no_image_layers_in_context() {
		// Arrange.
		$context = new Conversion_Context();

		// Act.
		$converted = $this->repeat_converter()->convert(
			$context,
			[ 'property' => 'background-repeat', 'value' => 'no-repeat' ]
		);

		// Assert.
		$this->assertFalse( $converted );
		$this->assertNull( $context->get_prop( 'background' ) );
	}

	public function test_convert__single_repeat_applies_to_all_layers() {
		// Arrange.
		$context = $this->context_with_images( [ 'a.jpg', 'b.jpg' ] );

		// Act.
		$converted = $this->repeat_converter()->convert(
			$context,
			[ 'property' => 'background-repeat', 'value' => 'no-repeat' ]
		);

		// Assert: both layers get the same repeat value.
		$this->assertTrue( $converted );

		$layers = $this->get_layers( $context );

		$this->assertSame( [ '$$type' => 'string', 'value' => 'no-repeat' ], $layers[0]['value']['repeat'] );
		$this->assertSame( [ '$$type' => 'string', 'value' => 'no-repeat' ], $layers[1]['value']['repeat'] );
	}

	public function test_convert__comma_repeat_applies_per_layer() {
		// Arrange.
		$context = $this->context_with_images( [ 'a.jpg', 'b.jpg' ] );

		// Act.
		$this->repeat_converter()->convert(
			$context,
			[ 'property' => 'background-repeat', 'value' => 'no-repeat, repeat-x' ]
		);

		// Assert.
		$layers = $this->get_layers( $context );

		$this->assertSame( 'no-repeat', $layers[0]['value']['repeat']['value'] );
		$this->assertSame( 'repeat-x', $layers[1]['value']['repeat']['value'] );
	}

	public function test_convert__count_mismatch_declines() {
		// Arrange: 1 layer, 2 values.
		$context = $this->context_with_images( [ 'a.jpg' ] );

		// Act.
		$converted = $this->repeat_converter()->convert(
			$context,
			[ 'property' => 'background-repeat', 'value' => 'no-repeat, repeat-x' ]
		);

		// Assert.
		$this->assertFalse( $converted );
	}

	public function test_convert__out_of_enum_token_declines() {
		// Arrange.
		$context = $this->context_with_images( [ 'a.jpg' ] );

		// Act.
		$converted = $this->repeat_converter()->convert(
			$context,
			[ 'property' => 'background-repeat', 'value' => 'banana' ]
		);

		// Assert.
		$this->assertFalse( $converted );
	}

	public function test_convert__size_enum_cover_sets_field() {
		// Arrange.
		$context = $this->context_with_images( [ 'a.jpg' ] );

		// Act.
		$this->size_converter()->convert(
			$context,
			[ 'property' => 'background-size', 'value' => 'cover' ]
		);

		// Assert.
		$layers = $this->get_layers( $context );

		$this->assertSame( [ '$$type' => 'string', 'value' => 'cover' ], $layers[0]['value']['size'] );
	}

	public function test_convert__size_pair_percentage_parses_as_scale_prop_type() {
		// Arrange.
		$context = $this->context_with_images( [ 'a.jpg' ] );

		// Act.
		$this->size_converter()->convert(
			$context,
			[ 'property' => 'background-size', 'value' => '50% 100%' ]
		);

		// Assert.
		$size_value = $this->get_layers( $context )[0]['value']['size'];

		$this->assertSame( 'background-image-size-scale', $size_value['$$type'] );
		$this->assertSame( 50, $size_value['value']['width']['value']['size'] );
		$this->assertSame( 100, $size_value['value']['height']['value']['size'] );
	}

	public function test_convert__position_enum_sets_field() {
		// Arrange.
		$context = $this->context_with_images( [ 'a.jpg' ] );

		// Act.
		$this->position_converter()->convert(
			$context,
			[ 'property' => 'background-position', 'value' => 'center center' ]
		);

		// Assert.
		$layers = $this->get_layers( $context );

		$this->assertSame( [ '$$type' => 'string', 'value' => 'center center' ], $layers[0]['value']['position'] );
	}

	public function test_convert__position_offset_pair_parses_as_offset_prop_type() {
		// Arrange.
		$context = $this->context_with_images( [ 'a.jpg' ] );

		// Act.
		$this->position_converter()->convert(
			$context,
			[ 'property' => 'background-position', 'value' => '10px 20px' ]
		);

		// Assert.
		$pos_value = $this->get_layers( $context )[0]['value']['position'];

		$this->assertSame( 'background-image-position-offset', $pos_value['$$type'] );
		$this->assertSame( 10, $pos_value['value']['x']['value']['size'] );
		$this->assertSame( 20, $pos_value['value']['y']['value']['size'] );
	}

	private function context_with_images( array $urls ): Conversion_Context {
		$context = new Conversion_Context();

		( new Background_Image_Converter() )->convert(
			$context,
			[ 'property' => 'background-image', 'value' => implode( ', ', array_map( fn( $u ) => "url($u)", $urls ) ) ]
		);

		return $context;
	}

	private function get_layers( Conversion_Context $context ): array {
		return $context->get_prop( 'background' )['value']['background-overlay']['value'];
	}

	private function repeat_converter(): Background_Layer_Field_Converter {
		return new Background_Layer_Field_Converter( 'background-repeat', 'repeat', self::REPEAT_ENUM );
	}

	private function size_converter(): Background_Layer_Field_Converter {
		return new Background_Layer_Field_Converter(
			'background-size',
			'size',
			self::SIZE_ENUM,
			Background_Image_Overlay_Size_Scale_Prop_Type::class,
			[ 'width', 'height' ]
		);
	}

	private function position_converter(): Background_Layer_Field_Converter {
		return new Background_Layer_Field_Converter(
			'background-position',
			'position',
			self::POSITION_ENUM,
			Background_Image_Position_Offset_Prop_Type::class,
			[ 'x', 'y' ]
		);
	}
}
