<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Mcp\Abilities\Read_File_Ability;
use Elementor\Modules\Mcp\Super_Admin\Super_Admin_Settings;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Read_File_Ability extends Elementor_Test_Base {

	private Read_File_Ability $ability;

	public function setUp(): void {
		parent::setUp();
		$this->ability = new Read_File_Ability();
		delete_option( Super_Admin_Settings::OPTION );
	}

	public function tearDown(): void {
		delete_option( Super_Admin_Settings::OPTION );
		parent::tearDown();
	}

	public function test_execute__denies_subscriber() {
		// Arrange
		$this->act_as_subscriber();
		Super_Admin_Settings::set_enabled( true );

		// Act
		$result = $this->ability->execute( [ 'path' => 'wp-includes/version.php' ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'rest_forbidden', $result->get_error_code() );
	}

	public function test_execute__super_admin_disabled() {
		// Arrange
		$this->act_as_admin();

		// Act
		$result = $this->ability->execute( [ 'path' => 'wp-includes/version.php' ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'super_admin_disabled', $result->get_error_code() );
	}

	public function test_execute__traversal_refused() {
		// Arrange
		$this->act_as_admin();
		Super_Admin_Settings::set_enabled( true );

		// Act
		$result = $this->ability->execute( [ 'path' => '../wp-config.php' ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( Read_File_Ability::ERROR_INVALID_PATH, $result->get_error_code() );
	}

	public function test_execute__reads_version_file() {
		// Arrange
		$this->act_as_admin();
		Super_Admin_Settings::set_enabled( true );
		$this->assertFileExists( ABSPATH . 'wp-includes/version.php' );

		// Act
		$result = $this->ability->execute( [ 'path' => 'wp-includes/version.php' ] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertStringContainsString( '$wp_version', $result['content'] );
		$this->assertGreaterThan( 0, $result['size'] );
	}

	public function test_execute__directory_path() {
		// Arrange
		$this->act_as_admin();
		Super_Admin_Settings::set_enabled( true );

		// Act
		$result = $this->ability->execute( [ 'path' => 'wp-includes' ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( Read_File_Ability::ERROR_NOT_A_FILE, $result->get_error_code() );
	}
}
