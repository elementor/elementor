<?php

namespace Elementor\Tests\Phpunit\Elementor\App\Modules\E_Onboarding\Storage;

use Elementor\Tests\Phpunit\Elementor\App\Modules\E_Onboarding\Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Onboarding_Progress_Manager extends Test_Base {

	public function test_save_and_load_progress() {
		// Arrange
		$progress = $this->progress_manager->get_progress();
		$progress->set_current_step( 2, 'experience_level' );
		$progress->add_completed_step( 'building_for' );
		$progress->add_completed_step( 'site_about' );

		// Act
		$this->progress_manager->save_progress( $progress );
		$loaded_progress = $this->progress_manager->get_progress();

		// Assert
		$this->assertSame( 2, $loaded_progress->get_current_step_index() );
		$this->assertSame( 'experience_level', $loaded_progress->get_current_step_id() );
		$this->assertContains( 'building_for', $loaded_progress->get_completed_steps() );
		$this->assertContains( 'site_about', $loaded_progress->get_completed_steps() );
	}

	public function test_save_and_load_choices() {
		// Arrange
		$choices = $this->progress_manager->get_choices();
		$choices->set_building_for( 'myself' );
		$choices->set_site_about( [ 'blog', 'portfolio' ] );
		$choices->set_experience_level( 'intermediate' );

		// Act
		$this->progress_manager->save_choices( $choices );
		$loaded_choices = $this->progress_manager->get_choices();

		// Assert
		$this->assertSame( 'myself', $loaded_choices->get_building_for() );
		$this->assertSame( [ 'blog', 'portfolio' ], $loaded_choices->get_site_about() );
		$this->assertSame( 'intermediate', $loaded_choices->get_experience_level() );
	}

	public function test_update_progress_with_actions() {
		// Test start action
		$progress = $this->progress_manager->update_progress( [ 'start' => true ] );
		$this->assertNotNull( $progress->get_started_at() );
		$this->assertNull( $progress->get_exit_type() );

		// Test complete step action
		$progress = $this->progress_manager->update_progress( [
			'complete_step' => 'building_for',
			'total_steps' => 5,
		] );
		$this->assertContains( 'building_for', $progress->get_completed_steps() );

		// Test complete action
		$progress = $this->progress_manager->update_progress( [ 'complete' => true ] );
		$this->assertNotNull( $progress->get_completed_at() );
		$this->assertSame( 'user_exit', $progress->get_exit_type() );
	}

	public function test_update_choices_preserves_existing_values() {
		// Arrange
		$this->progress_manager->update_choices( [
			'building_for' => 'myself',
			'experience_level' => 'beginner',
		] );

		// Act - only update one field
		$choices = $this->progress_manager->update_choices( [
			'site_about' => [ 'blog' ],
		] );

		// Assert - both old and new values preserved
		$this->assertSame( 'myself', $choices->get_building_for() );
		$this->assertSame( 'beginner', $choices->get_experience_level() );
		$this->assertSame( [ 'blog' ], $choices->get_site_about() );
	}

	public function test_reset_clears_all_data() {
		// Arrange
		$this->progress_manager->update_progress( [ 'current_step' => 3 ] );
		$this->progress_manager->update_choices( [ 'building_for' => 'myself' ] );

		// Act
		$this->progress_manager->reset();

		// Assert
		$progress = $this->progress_manager->get_progress();
		$choices = $this->progress_manager->get_choices();

		$this->assertSame( 0, $progress->get_current_step_index() );
		$this->assertNull( $choices->get_building_for() );
	}
}
