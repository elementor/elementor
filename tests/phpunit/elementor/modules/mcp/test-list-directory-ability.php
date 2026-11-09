<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Mcp\Abilities\List_Directory_Ability;
use Elementor\Modules\Mcp\Super_Admin\Super_Admin_Settings;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_List_Directory_Ability extends Elementor_Test_Base {

	private List_Directory_Ability $ability;

	public function setUp(): void {
		parent::setUp();
		$this->ability = new List_Directory_Ability();
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
		$result = $this->ability->execute( [ 'path' => 'wp-includes' ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'rest_forbidden', $result->get_error_code() );
	}

	public function test_execute__traversal_refused() {
		// Arrange
		$this->act_as_admin();
		Super_Admin_Settings::set_enabled( true );

		// Act
		$result = $this->ability->execute( [ 'path' => '../' ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( List_Directory_Ability::ERROR_INVALID_PATH, $result->get_error_code() );
	}

	public function test_execute__lists_wp_includes() {
		// Arrange
		$this->act_as_admin();
		Super_Admin_Settings::set_enabled( true );

		// Act
		$result = $this->ability->execute( [ 'path' => 'wp-includes' ] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertNotEmpty( $result['entries'] );
		$first = $result['entries'][0];
		$this->assertArrayHasKey( 'name', $first );
		$this->assertArrayHasKey( 'type', $first );
		$this->assertContains( $first['type'], [ 'dir', 'file' ] );
	}

	public function test_execute__file_path_not_dir() {
		// Arrange
		$this->act_as_admin();
		Super_Admin_Settings::set_enabled( true );

		// Act
		$result = $this->ability->execute( [ 'path' => 'wp-includes/version.php' ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( List_Directory_Ability::ERROR_NOT_A_DIR, $result->get_error_code() );
	}
}
