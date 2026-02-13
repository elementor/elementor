<?php

namespace Elementor\Tests\Phpunit\Elementor\App\Modules\E_Onboarding;

use Elementor\App\Modules\E_Onboarding\Module;
use Elementor\App\Modules\E_Onboarding\Storage\Entities\User_Choices;
use Elementor\App\Modules\E_Onboarding\Storage\Entities\User_Progress;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Module extends Test_Base {

	/**
	 * Invoke the private maybe_invalidate_theme_selection method via reflection.
	 *
	 * @param Module        $module   The module instance.
	 * @param User_Progress $progress The progress entity.
	 * @param User_Choices  $choices  The choices entity.
	 */
	private function invoke_maybe_invalidate_theme_selection( Module $module, User_Progress $progress, User_Choices $choices ): void {
		$method = new \ReflectionMethod( Module::class, 'maybe_invalidate_theme_selection' );
		$method->setAccessible( true );
		$method->invoke( $module, $progress, $choices );
	}

	/**
	 * @return Module
	 */
	private function get_module(): Module {
		return \Elementor\Plugin::$instance->modules_manager->get_modules( 'e-onboarding' );
	}

	public function test_invalidate_clears_theme_selection_when_active_theme_differs() {
		// Arrange
		$this->progress_manager->update_choices( [
			'theme_selection' => 'hello-elementor',
		] );
		$this->progress_manager->update_progress( [
			'complete_step' => 'theme_selection',
			'total_steps' => 5,
		] );

		$progress = $this->progress_manager->get_progress();
		$choices = $this->progress_manager->get_choices();

		// Precondition: theme_selection is in completed steps
		$this->assertContains( 'theme_selection', $progress->get_completed_steps() );
		$this->assertSame( 'hello-elementor', $choices->get_theme_selection() );

		// The active theme in tests is typically not 'hello-elementor'.
		$active_theme = get_stylesheet();
		$this->assertNotSame( 'hello-elementor', $active_theme, 'Test assumes hello-elementor is not the active theme.' );

		// Act
		$module = $this->get_module();
		$this->invoke_maybe_invalidate_theme_selection( $module, $progress, $choices );

		// Assert - theme_selection should be cleared from choices and completed steps
		$this->assertNull( $choices->get_theme_selection() );
		$this->assertNotContains( 'theme_selection', $progress->get_completed_steps() );

		// Also verify persistence
		$loaded_progress = $this->progress_manager->get_progress();
		$loaded_choices = $this->progress_manager->get_choices();

		$this->assertNull( $loaded_choices->get_theme_selection() );
		$this->assertNotContains( 'theme_selection', $loaded_progress->get_completed_steps() );
	}

	public function test_invalidate_preserves_other_completed_steps() {
		// Arrange
		$this->progress_manager->update_progress( [
			'complete_step' => 'building_for',
			'total_steps' => 5,
		] );
		$this->progress_manager->update_progress( [
			'complete_step' => 'experience_level',
			'total_steps' => 5,
		] );
		$this->progress_manager->update_progress( [
			'complete_step' => 'theme_selection',
			'total_steps' => 5,
		] );
		$this->progress_manager->update_choices( [
			'theme_selection' => 'hello-elementor',
		] );

		$progress = $this->progress_manager->get_progress();
		$choices = $this->progress_manager->get_choices();

		// Act
		$module = $this->get_module();
		$this->invoke_maybe_invalidate_theme_selection( $module, $progress, $choices );

		// Assert - other completed steps should still be present
		$this->assertContains( 'building_for', $progress->get_completed_steps() );
		$this->assertContains( 'experience_level', $progress->get_completed_steps() );
		$this->assertNotContains( 'theme_selection', $progress->get_completed_steps() );
	}

	public function test_invalidate_does_nothing_when_no_theme_selected() {
		// Arrange
		$this->progress_manager->update_progress( [
			'complete_step' => 'building_for',
			'total_steps' => 5,
		] );

		$progress = $this->progress_manager->get_progress();
		$choices = $this->progress_manager->get_choices();

		$completed_steps_before = $progress->get_completed_steps();

		// Act
		$module = $this->get_module();
		$this->invoke_maybe_invalidate_theme_selection( $module, $progress, $choices );

		// Assert - nothing should change
		$this->assertNull( $choices->get_theme_selection() );
		$this->assertSame( $completed_steps_before, $progress->get_completed_steps() );
	}

	public function test_invalidate_does_nothing_when_selected_theme_matches_active_theme() {
		// Arrange
		$active_theme = get_stylesheet();

		$this->progress_manager->update_choices( [
			'theme_selection' => $active_theme,
		] );
		$this->progress_manager->update_progress( [
			'complete_step' => 'theme_selection',
			'total_steps' => 5,
		] );

		$progress = $this->progress_manager->get_progress();
		$choices = $this->progress_manager->get_choices();

		// Act
		$module = $this->get_module();
		$this->invoke_maybe_invalidate_theme_selection( $module, $progress, $choices );

		// Assert - nothing should change because theme matches
		$this->assertSame( $active_theme, $choices->get_theme_selection() );
		$this->assertContains( 'theme_selection', $progress->get_completed_steps() );
	}

	public function test_invalidate_preserves_other_choices() {
		// Arrange
		$this->progress_manager->update_choices( [
			'building_for' => 'business',
			'experience_level' => 'intermediate',
			'theme_selection' => 'hello-elementor',
		] );
		$this->progress_manager->update_progress( [
			'complete_step' => 'theme_selection',
			'total_steps' => 5,
		] );

		$progress = $this->progress_manager->get_progress();
		$choices = $this->progress_manager->get_choices();

		// Act
		$module = $this->get_module();
		$this->invoke_maybe_invalidate_theme_selection( $module, $progress, $choices );

		// Assert - other choices should be preserved
		$loaded_choices = $this->progress_manager->get_choices();
		$this->assertSame( 'business', $loaded_choices->get_building_for() );
		$this->assertSame( 'intermediate', $loaded_choices->get_experience_level() );
		$this->assertNull( $loaded_choices->get_theme_selection() );
	}
}
