<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Mcp\Abilities\Enable_Super_Admin_Ability;
use Elementor\Modules\Mcp\Super_Admin\Super_Admin_Settings;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Enable_Super_Admin_Ability extends Elementor_Test_Base {

	private Enable_Super_Admin_Ability $ability;

	public function setUp(): void {
		parent::setUp();
		$this->ability = new Enable_Super_Admin_Ability();
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

		// Act
		$result = $this->ability->execute( [ 'consent' => true ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'rest_forbidden', $result->get_error_code() );
		$this->assertSame( \WP_Http::FORBIDDEN, $result->get_error_data()['status'] );
	}

	public function test_execute__requires_consent() {
		// Arrange
		$this->act_as_admin();

		// Act
		$result = $this->ability->execute( [] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'consent_required', $result->get_error_code() );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
		$this->assertFalse( Super_Admin_Settings::is_enabled() );
	}

	public function test_execute__rejects_non_boolean_consent() {
		// Arrange
		$this->act_as_admin();

		// Act
		$result_string = $this->ability->execute( [ 'consent' => 'true' ] );
		$result_int = $this->ability->execute( [ 'consent' => 1 ] );

		// Assert
		$this->assertWPError( $result_string );
		$this->assertSame( 'consent_required', $result_string->get_error_code() );
		$this->assertWPError( $result_int );
		$this->assertSame( 'consent_required', $result_int->get_error_code() );
		$this->assertFalse( Super_Admin_Settings::is_enabled() );
	}

	public function test_execute__enables_with_consent() {
		// Arrange
		$this->act_as_admin();

		// Act
		$result = $this->ability->execute( [ 'consent' => true ] );

		// Assert
		$this->assertSame( 'enabled', $result['status'] );
		$this->assertTrue( $result['reload_tools'] );
		$this->assertTrue( Super_Admin_Settings::is_enabled() );
	}

	public function test_execute__already_enabled() {
		// Arrange
		$this->act_as_admin();
		Super_Admin_Settings::set_enabled( true );

		// Act
		$result = $this->ability->execute( [ 'consent' => true ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'already_enabled', $result->get_error_code() );
		$this->assertSame( \WP_Http::CONFLICT, $result->get_error_data()['status'] );
	}
}
