<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Mcp\Super_Admin\Path_Validator;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Path_Validator extends Elementor_Test_Base {

	public function test_resolve_under_abspath__empty() {
		// Arrange & Act
		$resolved = Path_Validator::resolve_under_abspath( '' );

		// Assert
		$this->assertSame( '', $resolved );
	}

	public function test_resolve_under_abspath__null_byte() {
		// Arrange & Act
		$resolved = Path_Validator::resolve_under_abspath( "wp-includes\0evil" );

		// Assert
		$this->assertSame( '', $resolved );
	}

	public function test_resolve_under_abspath__traversal() {
		// Arrange & Act
		$resolved = Path_Validator::resolve_under_abspath( '../wp-config.php' );

		// Assert
		$this->assertSame( '', $resolved );
	}

	public function test_resolve_under_abspath__outside_abspath() {
		// Arrange & Act
		$resolved = Path_Validator::resolve_under_abspath( '/etc/passwd' );

		// Assert
		$this->assertSame( '', $resolved );
	}

	public function test_resolve_under_abspath__wp_includes() {
		// Arrange
		$expected = wp_normalize_path( (string) realpath( trailingslashit( ABSPATH ) . 'wp-includes' ) );

		// Act
		$resolved = Path_Validator::resolve_under_abspath( 'wp-includes' );

		// Assert
		$this->assertSame( $expected, $resolved );
		$this->assertStringNotContainsString( '..', $resolved );
	}

	public function test_resolve_under_abspath__symlink_pointing_outside() {
		// Arrange
		$link_name = 'elementor-test-outside-link-' . wp_generate_password( 8, false );
		$link_path = trailingslashit( ABSPATH ) . $link_name;
		symlink( sys_get_temp_dir(), $link_path );

		try {
			// Act
			$resolved = Path_Validator::resolve_under_abspath( $link_name );

			// Assert
			$this->assertSame( '', $resolved );
		} finally {
			unlink( $link_path );
		}
	}
}
