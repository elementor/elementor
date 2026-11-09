<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Mcp\Super_Admin\Super_Admin_Settings;
use Elementor\Settings;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Super_Admin_Settings extends Elementor_Test_Base {

	public function setUp(): void {
		parent::setUp();
		delete_option( Super_Admin_Settings::OPTION );
	}

	public function tearDown(): void {
		delete_option( Super_Admin_Settings::OPTION );
		parent::tearDown();
	}

	public function test_is_enabled__defaults_to_false() {
		// Assert
		$this->assertFalse( Super_Admin_Settings::is_enabled() );
	}

	public function test_set_enabled__round_trip() {
		// Act
		Super_Admin_Settings::set_enabled( true );

		// Assert
		$this->assertTrue( Super_Admin_Settings::is_enabled() );
		$this->assertSame( Super_Admin_Settings::ENABLED_VALUE, get_option( Super_Admin_Settings::OPTION ) );

		// Act
		Super_Admin_Settings::set_enabled( false );

		// Assert
		$this->assertFalse( Super_Admin_Settings::is_enabled() );
		$this->assertSame( '', get_option( Super_Admin_Settings::OPTION ) );
	}

	public function test_register_hooks__hooks_after_create_settings() {
		// Arrange
		$settings = new Super_Admin_Settings();

		// Act
		$settings->register_hooks();

		// Assert
		$this->assertNotFalse(
			has_action( 'elementor/admin/after_create_settings/' . Settings::PAGE_ID, [ $settings, 'register_admin_settings' ] )
		);
	}

	public function test_register_admin_settings__adds_field_on_advanced_tab() {
		// Arrange
		$settings_page = new Settings();
		$super_admin_settings = new Super_Admin_Settings();

		// Act
		$super_admin_settings->register_admin_settings( $settings_page );
		$tabs = $settings_page->get_tabs();

		// Assert
		$this->assertArrayHasKey(
			Super_Admin_Settings::FIELD_ID,
			$tabs[ Settings::TAB_ADVANCED ]['sections'][ Settings::TAB_ADVANCED ]['fields']
		);
	}
}
