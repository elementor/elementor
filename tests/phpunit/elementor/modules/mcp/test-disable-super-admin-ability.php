<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Mcp\Abilities\Disable_Super_Admin_Ability;
use Elementor\Modules\Mcp\Super_Admin\Super_Admin_Settings;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Disable_Super_Admin_Ability extends Elementor_Test_Base {

	private Disable_Super_Admin_Ability $ability;

	public function setUp(): void {
		parent::setUp();
		$this->ability = new Disable_Super_Admin_Ability();
		delete_option( Super_Admin_Settings::OPTION );
	}

	public function tearDown(): void {
		delete_option( Super_Admin_Settings::OPTION );
		parent::tearDown();
	}

	public function test_check_permission__denies_non_admin() {
		// Arrange
		$this->act_as_subscriber();

		// Assert
		$this->assertFalse( $this->ability->check_permission() );
	}

	public function test_execute__denies_non_admin() {
		// Arrange
		$this->act_as_subscriber();
		Super_Admin_Settings::set_enabled( true );

		// Act
		$result = $this->ability->execute();

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'rest_forbidden', $result->get_error_code() );
		$this->assertSame( \WP_Http::FORBIDDEN, $result->get_error_data()['status'] );
	}

	public function test_execute__disables_when_enabled() {
		// Arrange
		$this->act_as_admin();
		Super_Admin_Settings::set_enabled( true );

		// Act
		$result = $this->ability->execute();

		// Assert
		$this->assertSame( 'disabled', $result['status'] );
		$this->assertTrue( $result['reload_tools'] );
		$this->assertFalse( Super_Admin_Settings::is_enabled() );
	}

	public function test_execute__already_disabled() {
		// Arrange
		$this->act_as_admin();

		// Act
		$result = $this->ability->execute();

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'already_disabled', $result->get_error_code() );
		$this->assertSame( \WP_Http::CONFLICT, $result->get_error_data()['status'] );
	}
}
