<?php
namespace Elementor\Tests\Phpunit\Modules\GlobalClasses;

use Elementor\Modules\GlobalClasses\Database\Global_Classes_Database_Updater;
use Elementor\Modules\GlobalClasses\Database\Migrations\Add_Capabilities;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Global_Classes_Database_Updater extends Elementor_Test_Base {
	/**
	 * @var Global_Classes_Database_Updater
	 */
	private $database_updater;

	public function setUp(): void {
		parent::setUp();

		$this->database_updater = new Global_Classes_Database_Updater();

        remove_all_actions( 'admin_init' );
	}

	public function tearDown(): void {
		$roles = ['administrator', 'editor', 'author', 'contributor', 'shop_manager'];
		$capabilities = [
			Add_Capabilities::ACCESS_CLASS_MANAGER,
			Add_Capabilities::UPDATE_CLASS,
			Add_Capabilities::REMOVE_CSS_CLASS,
			Add_Capabilities::APPLY_CSS_CLASS,
		];

		foreach ( $roles as $role_name ) {
			$role = get_role( $role_name );
			if ( $role ) {
				foreach ( $capabilities as $capability ) {
					$role->remove_cap(  $capability );
				}
			}
		}

		delete_option( Global_Classes_Database_Updater::OPTION_NAME );

		parent::tearDown();
	}

	public function test_should_run_add_capabilities_migration_when_version_option_is_empty() {
		// Assert
		$this->assertFalse( get_option( Global_Classes_Database_Updater::OPTION_NAME ) );
		$admin_role = get_role( 'administrator' );
		$this->assertFalse( $admin_role->has_cap( Add_Capabilities::ACCESS_CLASS_MANAGER ) );

		// Arrange
		$this->database_updater->register();

        // Act
        do_action( 'admin_init' );

		// Assert
		$this->assertEquals( 1, intval( get_option( Global_Classes_Database_Updater::OPTION_NAME ) ) );

		$admin_role = get_role( 'administrator' );
		$this->assertTrue( $admin_role->has_cap( Add_Capabilities::ACCESS_CLASS_MANAGER ) );
		$this->assertTrue( $admin_role->has_cap( Add_Capabilities::UPDATE_CLASS ) );
		$this->assertTrue( $admin_role->has_cap( Add_Capabilities::REMOVE_CSS_CLASS ) );
		$this->assertTrue( $admin_role->has_cap( Add_Capabilities::APPLY_CSS_CLASS ) );
	}

	public function test_should_not_run_add_capabilities_migration_when_version_option_is_1() {
		// Arrange
		update_option( Global_Classes_Database_Updater::OPTION_NAME, 1 );

        $this->database_updater->register();

        // Act
        do_action( 'admin_init' );

		// Assert
		$this->assertEquals( 1, intval( get_option( Global_Classes_Database_Updater::OPTION_NAME ) ) );

		$admin_role = get_role( 'administrator' );
		$this->assertFalse( $admin_role->has_cap( Add_Capabilities::ACCESS_CLASS_MANAGER ) );
		$this->assertFalse( $admin_role->has_cap( Add_Capabilities::UPDATE_CLASS ) );
		$this->assertFalse( $admin_role->has_cap( Add_Capabilities::REMOVE_CSS_CLASS ) );
		$this->assertFalse( $admin_role->has_cap( Add_Capabilities::APPLY_CSS_CLASS ) );
	}
}
