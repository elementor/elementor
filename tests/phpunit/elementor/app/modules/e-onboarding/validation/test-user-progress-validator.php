<?php

namespace Elementor\Tests\Phpunit\Elementor\App\Modules\E_Onboarding\Validation;

use Elementor\App\Modules\E_Onboarding\Validation\User_Progress_Validator;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_User_Progress_Validator extends TestCase {

	private User_Progress_Validator $validator;

	public function setUp(): void {
		parent::setUp();
		$this->validator = new User_Progress_Validator();
	}

	public function test_validate_returns_empty_array_for_empty_params() {
		// Act
		$result = $this->validator->validate( [] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertEmpty( $result );
	}

	public function test_validate_current_step_accepts_numeric() {
		// Act
		$result = $this->validator->validate( [
			'current_step' => 3,
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( 3, $result['current_step'] );
	}

	public function test_validate_current_step_accepts_numeric_string() {
		// Act
		$result = $this->validator->validate( [
			'current_step' => '5',
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( 5, $result['current_step'] );
	}

	public function test_validate_current_step_rejects_non_numeric() {
		// Act
		$result = $this->validator->validate( [
			'current_step' => 'three',
		] );

		// Assert
		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'invalid_current_step', $result->get_error_code() );
	}

	public function test_validate_completed_steps_accepts_array() {
		// Act
		$result = $this->validator->validate( [
			'completed_steps' => [ 'building_for', 'site_about' ],
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( [ 'building_for', 'site_about' ], $result['completed_steps'] );
	}

	public function test_validate_completed_steps_accepts_numeric_values() {
		// Act
		$result = $this->validator->validate( [
			'completed_steps' => [ 0, 1, 2 ],
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( [ 0, 1, 2 ], $result['completed_steps'] );
	}

	public function test_validate_completed_steps_filters_invalid_values() {
		// Act
		$result = $this->validator->validate( [
			'completed_steps' => [ 'building_for', null, [], 'site_about' ],
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( [ 'building_for', 'site_about' ], $result['completed_steps'] );
	}

	public function test_validate_completed_steps_rejects_non_array() {
		// Act
		$result = $this->validator->validate( [
			'completed_steps' => 'building_for',
		] );

		// Assert
		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'invalid_completed_steps', $result->get_error_code() );
	}

	public function test_validate_exit_type_accepts_user_exit() {
		// Act
		$result = $this->validator->validate( [
			'exit_type' => 'user_exit',
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( 'user_exit', $result['exit_type'] );
	}

	public function test_validate_exit_type_accepts_unexpected() {
		// Act
		$result = $this->validator->validate( [
			'exit_type' => 'unexpected',
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( 'unexpected', $result['exit_type'] );
	}

	public function test_validate_exit_type_accepts_null() {
		// Act
		$result = $this->validator->validate( [
			'exit_type' => null,
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertNull( $result['exit_type'] );
	}

	public function test_validate_exit_type_converts_empty_string_to_null() {
		// Act
		$result = $this->validator->validate( [
			'exit_type' => '',
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertNull( $result['exit_type'] );
	}

	public function test_validate_exit_type_rejects_invalid_value() {
		// Act
		$result = $this->validator->validate( [
			'exit_type' => 'invalid_exit',
		] );

		// Assert
		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'invalid_exit_type', $result->get_error_code() );
	}

	public function test_validate_complete_step_accepts_string() {
		// Act
		$result = $this->validator->validate( [
			'complete_step' => 'building_for',
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( 'building_for', $result['complete_step'] );
	}

	public function test_validate_complete_step_accepts_numeric() {
		// Act
		$result = $this->validator->validate( [
			'complete_step' => 2,
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( 2, $result['complete_step'] );
	}

	public function test_validate_complete_step_rejects_array() {
		// Act
		$result = $this->validator->validate( [
			'complete_step' => [ 'building_for' ],
		] );

		// Assert
		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'invalid_complete_step', $result->get_error_code() );
	}

	public function test_validate_total_steps_accepts_numeric() {
		// Act
		$result = $this->validator->validate( [
			'total_steps' => 5,
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( 5, $result['total_steps'] );
	}

	public function test_validate_total_steps_rejects_non_numeric() {
		// Act
		$result = $this->validator->validate( [
			'total_steps' => 'five',
		] );

		// Assert
		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'invalid_total_steps', $result->get_error_code() );
	}

	public function test_validate_start_converts_to_bool() {
		// Act
		$result = $this->validator->validate( [
			'start' => true,
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertTrue( $result['start'] );
	}

	public function test_validate_complete_converts_to_bool() {
		// Act
		$result = $this->validator->validate( [
			'complete' => true,
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertTrue( $result['complete'] );
	}

	public function test_validate_user_exit_converts_to_bool() {
		// Act
		$result = $this->validator->validate( [
			'user_exit' => true,
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertTrue( $result['user_exit'] );
	}

	public function test_validate_ignores_unknown_fields() {
		// Act
		$result = $this->validator->validate( [
			'current_step' => 2,
			'unknown_field' => 'some_value',
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'current_step', $result );
		$this->assertArrayNotHasKey( 'unknown_field', $result );
	}

	public function test_validate_all_fields_together() {
		// Act
		$result = $this->validator->validate( [
			'current_step' => 2,
			'completed_steps' => [ 'building_for', 'site_about' ],
			'exit_type' => 'user_exit',
			'complete_step' => 'experience_level',
			'total_steps' => 5,
			'start' => false,
			'complete' => false,
			'user_exit' => true,
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( 2, $result['current_step'] );
		$this->assertSame( [ 'building_for', 'site_about' ], $result['completed_steps'] );
		$this->assertSame( 'user_exit', $result['exit_type'] );
		$this->assertSame( 'experience_level', $result['complete_step'] );
		$this->assertSame( 5, $result['total_steps'] );
		$this->assertFalse( $result['start'] );
		$this->assertFalse( $result['complete'] );
		$this->assertTrue( $result['user_exit'] );
	}
}
