<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers;

use Elementor\Modules\AtomicWidgets\PropTypes\Image_Attachment_Id_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Src_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Url_Prop_Type;
use Elementor\Modules\Mcp\Abilities\Appliers\Library_Image_Alt_Stripper;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Library_Image_Alt_Stripper extends TestCase {

	const ATTACHMENT_ID = 123;

	public function test_strip__removes_alt_from_nested_library_image_src() {
		// Arrange
		$attachment_id = Image_Attachment_Id_Prop_Type::generate( self::ATTACHMENT_ID );
		$image = $this->make_image( [
			'id' => $attachment_id,
			'alt' => String_Prop_Type::generate( 'Team photo' ),
		] );

		// Act
		$stripped = Library_Image_Alt_Stripper::strip( $image );

		// Assert
		$this->assertSame( $this->make_image( [ 'id' => $attachment_id ] ), $stripped );
	}

	public function test_strip__keeps_alt_on_external_image_src() {
		// Arrange
		$image = $this->make_image( [
			'url' => Url_Prop_Type::generate( 'https://example.com/photo.jpg' ),
			'alt' => String_Prop_Type::generate( 'Team photo' ),
		] );

		// Act
		$stripped = Library_Image_Alt_Stripper::strip( $image );

		// Assert
		$this->assertSame( $image, $stripped );
	}

	private function make_image( array $src_value ): array {
		return Image_Prop_Type::generate( [
			'src' => Image_Src_Prop_Type::generate( $src_value ),
			'size' => String_Prop_Type::generate( 'full' ),
		] );
	}
}
