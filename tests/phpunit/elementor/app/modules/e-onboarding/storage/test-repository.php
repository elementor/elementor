<?php

namespace Elementor\Tests\Phpunit\Elementor\App\Modules\E_Onboarding\Storage;

use Elementor\Tests\Phpunit\Elementor\App\Modules\E_Onboarding\Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Repository extends Test_Base {

	public function test_instance_returns_singleton() {
		// Act
		$instance1 = $this->repository;
		$instance2 = $this->repository::instance();

		// Assert
		$this->assertSame( $instance1, $instance2 );
	}

	public function test_get_progress_returns_user_progress_instance() {
		// Act
		$progress = $this->repository->get_progress();

		// Assert
		$this->assertInstanceOf(
			\Elementor\App\Modules\E_Onboarding\Storage\Entities\User_Progress::class,
			$progress
		);
	}

	public function test_get_choices_returns_user_choices_instance() {
		// Act
		$choices = $this->repository->get_choices();

		// Assert
		$this->assertInstanceOf(
			\Elementor\App\Modules\E_Onboarding\Storage\Entities\User_Choices::class,
			$choices
		);
	}

	public function test_save_progress_persists_data() {
		// Arrange
		$progress = $this->repository->get_progress();
		$progress->set_current_step( 2, 'experience_level' );
		$progress->add_completed_step( 'building_for' );
		$progress->add_completed_step( 'site_about' );

		// Act
		$this->repository->save_progress( $progress );
		$loaded_progress = $this->repository->get_progress();

		// Assert
		$this->assertSame( 2, $loaded_progress->get_current_step_index() );
		$this->assertSame( 'experience_level', $loaded_progress->get_current_step_id() );
		$this->assertContains( 'building_for', $loaded_progress->get_completed_steps() );
		$this->assertContains( 'site_about', $loaded_progress->get_completed_steps() );
	}

	public function test_save_choices_persists_data() {
		// Arrange
		$choices = $this->repository->get_choices();
		$choices->set_building_for( 'myself' );
		$choices->set_site_about( [ 'blog', 'portfolio' ] );
		$choices->set_experience_level( 'intermediate' );

		// Act
		$this->repository->save_choices( $choices );
		$loaded_choices = $this->repository->get_choices();

		// Assert
		$this->assertSame( 'myself', $loaded_choices->get_building_for() );
		$this->assertSame( [ 'blog', 'portfolio' ], $loaded_choices->get_site_about() );
		$this->assertSame( 'intermediate', $loaded_choices->get_experience_level() );
	}

	public function test_update_progress_updates_current_step() {
		// Act
		$progress = $this->repository->update_progress( [
			'current_step' => 3,
		] );

		// Assert
		$this->assertSame( 3, $progress->get_current_step_index() );
	}

	public function test_update_progress_updates_completed_steps() {
		// Act
		$progress = $this->repository->update_progress( [
			'completed_steps' => [ 'building_for', 'site_about' ],
		] );

		// Assert
		$this->assertSame( [ 'building_for', 'site_about' ], $progress->get_completed_steps() );
	}

	public function test_update_progress_updates_exit_type() {
		// Act
		$progress = $this->repository->update_progress( [
			'exit_type' => 'user_exit',
		] );

		// Assert
		$this->assertSame( 'user_exit', $progress->get_exit_type() );
	}

	public function test_update_progress_complete_step_adds_to_completed() {
		// Act
		$progress = $this->repository->update_progress( [
			'complete_step' => 'building_for',
			'total_steps' => 5,
		] );

		// Assert
		$this->assertContains( 'building_for', $progress->get_completed_steps() );
	}

	public function test_update_progress_start_sets_started_at() {
		// Act
		$progress = $this->repository->update_progress( [
			'start' => true,
		] );

		// Assert
		$this->assertNotNull( $progress->get_started_at() );
		$this->assertNull( $progress->get_exit_type() );
	}

	public function test_update_progress_complete_sets_completed_at() {
		// Act
		$progress = $this->repository->update_progress( [
			'complete' => true,
		] );

		// Assert
		$this->assertNotNull( $progress->get_completed_at() );
		$this->assertSame( 'user_exit', $progress->get_exit_type() );
	}

	public function test_update_progress_user_exit_sets_exit_type() {
		// Act
		$progress = $this->repository->update_progress( [
			'user_exit' => true,
		] );

		// Assert
		$this->assertSame( 'user_exit', $progress->get_exit_type() );
	}

	public function test_update_progress_always_updates_last_active_timestamp() {
		// Act
		$progress = $this->repository->update_progress( [] );

		// Assert
		$this->assertNotNull( $progress->get_last_active_timestamp() );
	}

	public function test_update_choices_updates_building_for() {
		// Act
		$choices = $this->repository->update_choices( [
			'building_for' => 'client',
		] );

		// Assert
		$this->assertSame( 'client', $choices->get_building_for() );
	}

	public function test_update_choices_updates_site_about() {
		// Act
		$choices = $this->repository->update_choices( [
			'site_about' => [ 'ecommerce', 'blog' ],
		] );

		// Assert
		$this->assertSame( [ 'ecommerce', 'blog' ], $choices->get_site_about() );
	}

	public function test_update_choices_updates_experience_level() {
		// Act
		$choices = $this->repository->update_choices( [
			'experience_level' => 'advanced',
		] );

		// Assert
		$this->assertSame( 'advanced', $choices->get_experience_level() );
	}

	public function test_update_choices_updates_theme_selection() {
		// Act
		$choices = $this->repository->update_choices( [
			'theme_selection' => 'modern-theme',
		] );

		// Assert
		$this->assertSame( 'modern-theme', $choices->get_theme_selection() );
	}

	public function test_update_choices_updates_site_features() {
		// Act
		$choices = $this->repository->update_choices( [
			'site_features' => [ 'contact_form', 'gallery', 'blog' ],
		] );

		// Assert
		$this->assertSame( [ 'contact_form', 'gallery', 'blog' ], $choices->get_site_features() );
	}

	public function test_update_choices_preserves_existing_values() {
		// Arrange
		$this->repository->update_choices( [
			'building_for' => 'myself',
			'experience_level' => 'beginner',
		] );

		// Act - only update one field
		$choices = $this->repository->update_choices( [
			'site_about' => [ 'blog' ],
		] );

		// Assert - both old and new values preserved
		$this->assertSame( 'myself', $choices->get_building_for() );
		$this->assertSame( 'beginner', $choices->get_experience_level() );
		$this->assertSame( [ 'blog' ], $choices->get_site_about() );
	}

	public function test_reset_clears_all_data() {
		// Arrange
		$this->repository->update_progress( [ 'current_step' => 3 ] );
		$this->repository->update_choices( [ 'building_for' => 'myself' ] );

		// Act
		$this->repository->reset();

		// Assert
		$progress = $this->repository->get_progress();
		$choices = $this->repository->get_choices();

		$this->assertSame( 0, $progress->get_current_step_index() );
		$this->assertNull( $choices->get_building_for() );
	}
}
