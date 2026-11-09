<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Mcp\Abilities\Execute_Php_Ability;
use Elementor\Modules\Mcp\Super_Admin\Super_Admin_Settings;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Execute_Php_Ability extends Elementor_Test_Base {

	private Execute_Php_Ability $ability;

	public function setUp(): void {
		parent::setUp();
		$this->ability = new Execute_Php_Ability();
		delete_option( Super_Admin_Settings::OPTION );
	}

	public function tearDown(): void {
		delete_option( Super_Admin_Settings::OPTION );
		parent::tearDown();
	}

	public function test_check_permission__denies_subscriber() {
		// Arrange
		$this->act_as_subscriber();
		Super_Admin_Settings::set_enabled( true );

		// Assert
		$this->assertFalse( $this->ability->check_permission() );
	}

	public function test_execute__denies_subscriber() {
		// Arrange
		$this->act_as_subscriber();
		Super_Admin_Settings::set_enabled( true );

		// Act
		$result = $this->ability->execute( [ 'code' => 'return 1;' ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'rest_forbidden', $result->get_error_code() );
	}

	public function test_execute__super_admin_disabled() {
		// Arrange
		$this->act_as_admin();
		Super_Admin_Settings::set_enabled( false );

		// Act
		$result = $this->ability->execute( [ 'code' => 'return 1;' ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'super_admin_disabled', $result->get_error_code() );
		$this->assertSame( \WP_Http::FORBIDDEN, $result->get_error_data()['status'] );
	}

	public function test_execute__return_value() {
		// Arrange
		$this->act_as_admin();
		Super_Admin_Settings::set_enabled( true );

		// Act
		$result = $this->ability->execute( [ 'code' => 'return 1 + 1;' ] );

		// Assert
		$this->assertTrue( $result['success'] );
		$this->assertSame( 2, $result['return_value'] );
	}

	public function test_execute__output() {
		// Arrange
		$this->act_as_admin();
		Super_Admin_Settings::set_enabled( true );

		// Act
		$result = $this->ability->execute( [ 'code' => 'echo "hi";' ] );

		// Assert
		$this->assertTrue( $result['success'] );
		$this->assertSame( 'hi', $result['output'] );
	}

	public function test_execute__throwing_code() {
		// Arrange
		$this->act_as_admin();
		Super_Admin_Settings::set_enabled( true );

		// Act
		$result = $this->ability->execute( [ 'code' => 'throw new Exception("boom");' ] );

		// Assert
		$this->assertFalse( $result['success'] );
		$this->assertArrayHasKey( 'error_class', $result );
		$this->assertSame( 'Exception', $result['error_class'] );
	}

	public function test_execute__output_schema_validates_success_result() {
		// Arrange
		$this->act_as_admin();
		Super_Admin_Settings::set_enabled( true );
		$ability_reflection = new \ReflectionClass( $this->ability );
		$definition_method = $ability_reflection->getMethod( 'definition' );
		$definition_method->setAccessible( true );
		$output_schema = $definition_method->invoke( $this->ability )->to_array()['output_schema'];

		// Act
		$result = $this->ability->execute( [ 'code' => 'return ["ok" => true];' ] );

		// Assert
		$this->assertTrue( rest_validate_value_from_schema( $result, $output_schema ) );
	}

	public function test_execute__empty_code() {
		// Arrange
		$this->act_as_admin();
		Super_Admin_Settings::set_enabled( true );

		// Act
		$result = $this->ability->execute( [ 'code' => '   ' ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( Execute_Php_Ability::ERROR_EMPTY_CODE, $result->get_error_code() );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
	}
}
