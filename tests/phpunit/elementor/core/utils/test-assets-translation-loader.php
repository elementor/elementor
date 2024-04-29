<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Utils;

use Elementor\Core\Utils\Assets_Translation_Loader;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Assets_Translation_Loader extends Elementor_Test_Base {

	/**
	 * @dataProvider replace_requested_translation_file_data_provider
	 */
	public function test_replace_requested_translation_file__default_replace_callback( $src, $expected_relative_path ) {
		// Arrange.
		wp_register_script( 'test-script', $src );

		Assets_Translation_Loader::for_handles( [ 'test-script' ], 'elementor' );

		// Act.
		$relative = str_replace( 'https://localhost/', '', $src );

		$result = apply_filters(
			'load_script_textdomain_relative_path',
			$relative,
			$src
		);

		// Assert.
		$this->assertEquals( $expected_relative_path, $result );
		$this->assertEquals( 'elementor', wp_scripts()->registered['test-script']->textdomain );

		// Cleanup.
		wp_deregister_script( 'test-script' );
	}

	public function test_replace_requested_translation_file__custom_replace_callback() {
		// Arrange.
		$src = 'https://localhost/assets/js/script.js';

		wp_register_script( 'test-script', $src );

		Assets_Translation_Loader::for_handles( [ 'test-script' ], null, function ( $relative_path, $script_src ) use ( $src ) {
			if ( $script_src === $src ) {
				return '/assets/js/script-override.translations.js';
			}

			return $relative_path;
		} );

		// Act.
		$relative = str_replace( 'https://localhost/', '', $src );

		$result = apply_filters(
			'load_script_textdomain_relative_path',
			$relative,
			$src
		);

		// Assert.
		$this->assertEquals( '/assets/js/script-override.translations.js', $result );
		$this->assertNull( wp_scripts()->registered['test-script']->textdomain );

		// Cleanup.
		wp_deregister_script( 'test-script' );
	}

	public function replace_requested_translation_file_data_provider() {
		return [
			'minified' => [
				'src' => 'https://localhost/assets/js/minified.min.js',
				'expected' => 'assets/js/minified.strings.js',
			],
			'not-minified' => [
				'src' => 'https://localhost/assets/js/not-minified.js',
				'expected' => 'assets/js/not-minified.strings.js',
			],
		];
	}
}
