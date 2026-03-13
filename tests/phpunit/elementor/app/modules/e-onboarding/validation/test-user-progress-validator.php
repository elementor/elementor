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

	public function test_validates_complete_progress_data() {
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
		$this->assertTrue( $result['user_exit'] );
	}

	public function test_rejects_invalid_types() {
		// Assert - current_step should be numeric
		$result = $this->validator->validate( [ 'current_step' => 'three' ] );
		$this->assertInstanceOf( \WP_Error::class, $result );

		// Assert - completed_steps should be array
		$result = $this->validator->validate( [ 'completed_steps' => 'building_for' ] );
		$this->assertInstanceOf( \WP_Error::class, $result );

		// Assert - total_steps should be numeric
		$result = $this->validator->validate( [ 'total_steps' => 'five' ] );
		$this->assertInstanceOf( \WP_Error::class, $result );
	}

	public function test_rejects_invalid_exit_type() {
		// Act
		$result = $this->validator->validate( [ 'exit_type' => 'invalid_exit' ] );

		// Assert
		$this->assertInstanceOf( \WP_Error::class, $result );
	}

	public function test_accepts_valid_exit_types() {
		// Assert - user_exit
		$result = $this->validator->validate( [ 'exit_type' => 'user_exit' ] );
		$this->assertIsArray( $result );
		$this->assertSame( 'user_exit', $result['exit_type'] );

		// Assert - unexpected
		$result = $this->validator->validate( [ 'exit_type' => 'unexpected' ] );
		$this->assertIsArray( $result );
		$this->assertSame( 'unexpected', $result['exit_type'] );

		// Assert - null
		$result = $this->validator->validate( [ 'exit_type' => null ] );
		$this->assertIsArray( $result );
		$this->assertNull( $result['exit_type'] );
	}

	public function test_converts_numeric_strings() {
		// Act
		$result = $this->validator->validate( [
			'current_step' => '5',
			'total_steps' => '10',
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( 5, $result['current_step'] );
		$this->assertSame( 10, $result['total_steps'] );
	}
}
