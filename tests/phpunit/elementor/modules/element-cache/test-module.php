<?php
namespace Elementor\Testing\Modules\ElementCache;

use ElementorEditorTesting\Elementor_Test_Base;

class Test_Module extends Elementor_Test_Base {

	const ELEMENT_DATA_MOCK = [
		'id' => 'test-element',
		'elType' => 'widget',
		'settings' => [
			'title' => 'Test Element',
		],
		'widgetType' => 'heading',
	];

	public function test_get_unique_id() {
		// Act
		$unique_id = apply_filters( 'elementor/element_cache/unique_id', '' );

		// Assert
		$this->assertIsString( $unique_id );
		$this->assertNotEmpty( $unique_id );
	}

	public function test_shortcode_with_missing_data() {
		// Arrange
		$shortcode = '[elementor-element]';

		// Act
		$output = do_shortcode( $shortcode );

		// Assert
		$this->assertEmpty( $output );
	}

	public function test_shortcode_with_invalid_key() {
		// Arrange
		$data = base64_encode( json_encode( self::ELEMENT_DATA_MOCK ) );
		$shortcode = '[elementor-element data="' . $data . '" k="invalid-key"]';

		// Act
		$output = do_shortcode( $shortcode );

		// Assert
		$this->assertEmpty( $output );
	}

	public function test_shortcode_with_valid_data_and_key() {
		// Arrange
		$unique_id = apply_filters( 'elementor/element_cache/unique_id', '' );
		$data = base64_encode( json_encode( self::ELEMENT_DATA_MOCK ) );
		$shortcode = '[elementor-element data="' . $data . '" k="' . $unique_id . '"]';

		// Act
		ob_start();
		echo do_shortcode( $shortcode );
		$output = ob_get_clean();

		// Assert
		$this->assertNotEmpty( $output );
		$this->assertStringContainsString( 'Test Element', $output );
	}

	public function test_shortcode_with_invalid_data() {
		// Arrange
		$unique_id = apply_filters( 'elementor/element_cache/unique_id', '' );
		$shortcode = '[elementor-element data="invalid-data" k="' . $unique_id . '"]';

		// Act
		$output = do_shortcode( $shortcode );

		// Assert
		$this->assertEmpty( $output );
	}
}
