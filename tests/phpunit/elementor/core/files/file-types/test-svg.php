<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Files\File_Types;

use Elementor\Core\Files\File_Types\Svg;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Svg extends Elementor_Test_Base {

	/**
	 * Mock Bad String
	 *
	 * This is an SVG that includes an XML comment and PHP code, which should be sanitized off of it.
	 *
	 * @var string
	 */
	public static $mock_bad_svg = '<svg xmlns="http://www.w3.org/2000/svg" height="512pt" viewBox="-34 0 512 512.00205" width="512pt"><!-- this is a test comment --><?php echo \'this is test php code\'; ?><path d="10.308594 6.347656 16.222656 5.023437 26.773438-7.28125 52.929688-16.671875 78.21875-28.09375-2.730468 25.558594-29.007812 60.546875-37.003906 70.675782zm0 0"></path></svg>';

	public static $mock_sanitized_svg = '<svg xmlns="http://www.w3.org/2000/svg" height="512pt" viewBox="-34 0 512 512.00205" width="512pt"><path d="10.308594 6.347656 16.222656 5.023437 26.773438-7.28125 52.929688-16.671875 78.21875-28.09375-2.730468 25.558594-29.007812 60.546875-37.003906 70.675782zm0 0"></path></svg>';

	public function test_get_file_extension() {
		$svg_handler = Plugin::$instance->uploads_manager->get_file_type_handlers( 'svg' );

		$this->assertEquals( 'svg', $svg_handler->get_file_extension() );
	}

	public function test_get_mime_type() {
		$svg_handler = Plugin::$instance->uploads_manager->get_file_type_handlers( 'svg' );

		$this->assertEquals( 'image/svg+xml', $svg_handler->get_mime_type() );
	}

	public function test_file_sanitizer_can_run() {
		$classes_exist = class_exists( 'DOMDocument' ) && class_exists( 'SimpleXMLElement' );

		$this->assertEquals( $classes_exist, Svg::file_sanitizer_can_run() );
	}

	public function test_sanitizer() {
		/** @var Svg $svg_handler */
		$svg_handler = Plugin::$instance->uploads_manager->get_file_type_handlers( 'svg');

		$this->assertEquals( self::$mock_sanitized_svg, $svg_handler->sanitizer( self::$mock_bad_svg ) );
	}
}
