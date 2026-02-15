<?php

namespace Elementor\Tests\Phpunit\Elementor\App\Modules\E_Onboarding\Storage\Entities;

use Elementor\App\Modules\E_Onboarding\Storage\Entities\User_Progress;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_User_Progress extends TestCase {

	public function test_from_array_loads_all_fields() {
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

	public function test_supports_legacy_current_step_field() {
		// Arrange - using legacy 'current_step' instead of 'current_step_index'
		$data = [ 'current_step' => 3 ];

		// Act
		$progress = User_Progress::from_array( $data );

		// Assert
		$this->assertSame( 3, $progress->get_current_step_index() );
	}

	public function test_add_completed_step_prevents_duplicates() {
		// Arrange
		$progress = new User_Progress();

		// Act
		$progress->add_completed_step( 'building_for' );
		$progress->add_completed_step( 'site_about' );
		$progress->add_completed_step( 'building_for' ); // Duplicate

		// Assert
		$this->assertSame( [ 'building_for', 'site_about' ], $progress->get_completed_steps() );
	}

	public function test_had_unexpected_exit_detection() {
		$progress = new User_Progress();

		// No unexpected exit at first step
		$progress->set_current_step( 0 );
		$this->assertFalse( $progress->had_unexpected_exit() );

		// Unexpected exit when in progress without exit type
		$progress->set_current_step( 2 );
		$progress->set_exit_type( null );
		$progress->set_completed_at( null );
		$this->assertTrue( $progress->had_unexpected_exit() );

		// No unexpected exit when exit_type is set
		$progress->set_exit_type( 'user_exit' );
		$this->assertFalse( $progress->had_unexpected_exit() );

		// No unexpected exit when completed
		$progress->set_exit_type( null );
		$progress->set_completed_at( 1700001000 );
		$this->assertFalse( $progress->had_unexpected_exit() );
	}
}
