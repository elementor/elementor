<?php

namespace Elementor\Tests\Phpunit\Elementor\App\Modules\E_Onboarding\Storage\Entities;

use Elementor\App\Modules\E_Onboarding\Storage\Entities\User_Progress;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_User_Progress extends TestCase {

	public function test_from_array_creates_instance_with_all_fields() {
		// Arrange
		$data = [
			'current_step_index' => 2,
			'current_step_id' => 'experience_level',
			'completed_steps' => [ 'building_for', 'site_about' ],
			'exit_type' => 'user_exit',
			'last_active_timestamp' => 1700000000,
			'started_at' => 1699999000,
			'completed_at' => 1700001000,
		];

		// Act
		$progress = User_Progress::from_array( $data );

		// Assert
		$this->assertSame( 2, $progress->get_current_step_index() );
		$this->assertSame( 'experience_level', $progress->get_current_step_id() );
		$this->assertSame( [ 'building_for', 'site_about' ], $progress->get_completed_steps() );
		$this->assertSame( 'user_exit', $progress->get_exit_type() );
		$this->assertSame( 1700000000, $progress->get_last_active_timestamp() );
		$this->assertSame( 1699999000, $progress->get_started_at() );
		$this->assertSame( 1700001000, $progress->get_completed_at() );
	}

	public function test_from_array_with_empty_data_creates_instance_with_defaults() {
		// Act
		$progress = User_Progress::from_array( [] );

		// Assert
		$this->assertSame( 0, $progress->get_current_step_index() );
		$this->assertNull( $progress->get_current_step_id() );
		$this->assertSame( [], $progress->get_completed_steps() );
		$this->assertNull( $progress->get_exit_type() );
		$this->assertNull( $progress->get_last_active_timestamp() );
		$this->assertNull( $progress->get_started_at() );
		$this->assertNull( $progress->get_completed_at() );
	}

	public function test_from_array_supports_legacy_current_step_field() {
		// Arrange - using legacy 'current_step' instead of 'current_step_index'
		$data = [
			'current_step' => 3,
		];

		// Act
		$progress = User_Progress::from_array( $data );

		// Assert
		$this->assertSame( 3, $progress->get_current_step_index() );
	}

	public function test_to_array_returns_all_fields() {
		// Arrange
		$progress = new User_Progress();
		$progress->set_current_step( 1, 'site_about' );
		$progress->set_completed_steps( [ 'building_for' ] );
		$progress->set_exit_type( 'unexpected' );
		$progress->set_last_active_timestamp( 1700000000 );
		$progress->set_started_at( 1699999000 );
		$progress->set_completed_at( 1700001000 );

		// Act
		$array = $progress->to_array();

		// Assert
		$this->assertSame( 1, $array['current_step'] );
		$this->assertSame( 1, $array['current_step_index'] );
		$this->assertSame( 'site_about', $array['current_step_id'] );
		$this->assertSame( [ 'building_for' ], $array['completed_steps'] );
		$this->assertSame( 'unexpected', $array['exit_type'] );
		$this->assertSame( 1700000000, $array['last_active_timestamp'] );
		$this->assertSame( 1699999000, $array['started_at'] );
		$this->assertSame( 1700001000, $array['completed_at'] );
	}

	public function test_add_completed_step_adds_unique_steps() {
		// Arrange
		$progress = new User_Progress();

		// Act
		$progress->add_completed_step( 'building_for' );
		$progress->add_completed_step( 'site_about' );
		$progress->add_completed_step( 'building_for' ); // Duplicate

		// Assert
		$this->assertSame( [ 'building_for', 'site_about' ], $progress->get_completed_steps() );
	}

	public function test_is_step_completed() {
		// Arrange
		$progress = new User_Progress();
		$progress->set_completed_steps( [ 'building_for', 'site_about' ] );

		// Assert
		$this->assertTrue( $progress->is_step_completed( 'building_for' ) );
		$this->assertTrue( $progress->is_step_completed( 'site_about' ) );
		$this->assertFalse( $progress->is_step_completed( 'experience_level' ) );
	}

	public function test_had_unexpected_exit_returns_true_when_conditions_met() {
		// Arrange - in progress without exit type and not completed
		$progress = new User_Progress();
		$progress->set_current_step( 2 );
		$progress->set_exit_type( null );
		$progress->set_completed_at( null );

		// Assert
		$this->assertTrue( $progress->had_unexpected_exit() );
	}

	public function test_had_unexpected_exit_returns_false_when_exit_type_set() {
		// Arrange
		$progress = new User_Progress();
		$progress->set_current_step( 2 );
		$progress->set_exit_type( 'user_exit' );
		$progress->set_completed_at( null );

		// Assert
		$this->assertFalse( $progress->had_unexpected_exit() );
	}

	public function test_had_unexpected_exit_returns_false_when_at_first_step() {
		// Arrange
		$progress = new User_Progress();
		$progress->set_current_step( 0 );
		$progress->set_exit_type( null );
		$progress->set_completed_at( null );

		// Assert
		$this->assertFalse( $progress->had_unexpected_exit() );
	}

	public function test_had_unexpected_exit_returns_false_when_completed() {
		// Arrange
		$progress = new User_Progress();
		$progress->set_current_step( 5 );
		$progress->set_exit_type( null );
		$progress->set_completed_at( 1700001000 );

		// Assert
		$this->assertFalse( $progress->had_unexpected_exit() );
	}

	public function test_get_current_step_returns_current_step_index() {
		// Arrange
		$progress = new User_Progress();
		$progress->set_current_step_index( 3 );

		// Assert
		$this->assertSame( 3, $progress->get_current_step() );
		$this->assertSame( 3, $progress->get_current_step_index() );
	}
}
