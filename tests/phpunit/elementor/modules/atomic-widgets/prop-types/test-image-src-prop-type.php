<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Image_Attachment_Id_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Src_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Url_Prop_Type;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Image_Src_Prop_Type extends Elementor_Test_Base {

	const ATTACHMENT_ID = 123;
	const EXTERNAL_URL = 'https://example.com/photo.jpg';
	const ALT_TEXT = 'Team photo';

	public function test_get_unsupported_keys__returns_alt_for_library_image() {
		// Arrange
		$value = $this->make_library_src_value( String_Prop_Type::generate( self::ALT_TEXT ) );

		// Act
		$unsupported_keys = Image_Src_Prop_Type::get_unsupported_keys( $value );

		// Assert
		$this->assertSame( [ 'alt' ], $unsupported_keys );
	}

	public function test_get_unsupported_keys__returns_nothing_for_external_image() {
		// Arrange
		$value = $this->make_external_src_value();

		// Act
		$unsupported_keys = Image_Src_Prop_Type::get_unsupported_keys( $value );

		// Assert
		$this->assertSame( [], $unsupported_keys );
	}

	public function test_get_unsupported_keys__returns_nothing_for_library_image_without_alt() {
		// Arrange
		$value = $this->make_library_src_value( null );

		// Act
		$unsupported_keys = Image_Src_Prop_Type::get_unsupported_keys( $value );

		// Assert
		$this->assertSame( [], $unsupported_keys );
	}

	public function test_sanitize__strips_alt_from_library_image() {
		// Arrange
		$prop_type = Image_Src_Prop_Type::make();
		$value = Image_Src_Prop_Type::generate( $this->make_library_src_value( String_Prop_Type::generate( self::ALT_TEXT ) ) );

		// Act
		$sanitized = $prop_type->sanitize( $value );

		// Assert
		$this->assertArrayNotHasKey( 'alt', $sanitized['value'] );
		$this->assertSame( self::ATTACHMENT_ID, $sanitized['value']['id']['value'] );
	}

	public function test_sanitize__keeps_alt_on_external_image() {
		// Arrange
		$prop_type = Image_Src_Prop_Type::make();
		$value = Image_Src_Prop_Type::generate( $this->make_external_src_value() );

		// Act
		$sanitized = $prop_type->sanitize( $value );

		// Assert
		$this->assertSame( self::ALT_TEXT, $sanitized['value']['alt']['value'] );
	}

	public function test_validate__accepts_library_image_with_alt_for_backward_compatibility() {
		// Arrange
		$prop_type = Image_Src_Prop_Type::make();
		$value = Image_Src_Prop_Type::generate( $this->make_library_src_value( String_Prop_Type::generate( self::ALT_TEXT ) ) );

		// Act
		$is_valid = $prop_type->validate( $value );

		// Assert
		$this->assertTrue( $is_valid );
	}

	private function make_library_src_value( ?array $alt ): array {
		return [
			'id' => Image_Attachment_Id_Prop_Type::generate( self::ATTACHMENT_ID ),
			'alt' => $alt,
		];
	}

	private function make_external_src_value(): array {
		return [
			'url' => Url_Prop_Type::generate( self::EXTERNAL_URL ),
			'alt' => String_Prop_Type::generate( self::ALT_TEXT ),
		];
	}
}
