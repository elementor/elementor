<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\GuidedTours;

use Elementor\Modules\GuidedTours\Progress_Manager;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Progress_Manager extends Elementor_Test_Base {
	public function setUp(): void {
		parent::setUp();

		$this->act_as_admin();
		delete_user_meta( get_current_user_id(), Progress_Manager::USER_META_KEY );
	}

	public function tearDown(): void {
		delete_user_meta( get_current_user_id(), Progress_Manager::USER_META_KEY );

		parent::tearDown();
	}

	public function test_update__stores_progress_for_current_user(): void {
		// Arrange
		$manager = new Progress_Manager();

		// Act
		$manager->update( 'admin-navigation', 1, Progress_Manager::STATUS_IN_PROGRESS, 'posts' );

		// Assert
		$this->assertSame( [
			'status' => Progress_Manager::STATUS_IN_PROGRESS,
			'version' => 1,
			'step_id' => 'posts',
		], $manager->get_progress( 'admin-navigation', 1 ) );
	}

	public function test_is_completed__returns_true_for_matching_version(): void {
		// Arrange
		$manager = new Progress_Manager();
		$manager->update( 'admin-navigation', 1, Progress_Manager::STATUS_COMPLETED, 'account' );

		// Act
		$is_completed = $manager->is_completed( 'admin-navigation', 1 );

		// Assert
		$this->assertTrue( $is_completed );
	}

	public function test_is_completed__returns_false_after_version_change(): void {
		// Arrange
		$manager = new Progress_Manager();
		$manager->update( 'admin-navigation', 1, Progress_Manager::STATUS_COMPLETED, 'account' );

		// Act
		$is_completed = $manager->is_completed( 'admin-navigation', 2 );

		// Assert
		$this->assertFalse( $is_completed );
		$this->assertSame( [], $manager->get_progress( 'admin-navigation', 2 ) );
	}

	public function test_should_suppress_tour__returns_true_for_dismissed(): void {
		// Arrange
		$manager = new Progress_Manager();
		$manager->update( 'admin-navigation', 1, Progress_Manager::STATUS_DISMISSED, 'posts' );

		// Act
		$should_suppress = $manager->should_suppress_tour( 'admin-navigation', 1 );

		// Assert
		$this->assertTrue( $should_suppress );
	}

	public function test_update__does_not_downgrade_dismissed_progress(): void {
		// Arrange
		$manager = new Progress_Manager();
		$manager->update( 'admin-navigation', 1, Progress_Manager::STATUS_DISMISSED, 'posts' );

		// Act
		$manager->update( 'admin-navigation', 1, Progress_Manager::STATUS_IN_PROGRESS, 'account' );

		// Assert
		$this->assertSame( Progress_Manager::STATUS_DISMISSED, $manager->get_progress( 'admin-navigation', 1 )['status'] );
	}

	public function test_update__does_not_downgrade_completed_progress(): void {
		// Arrange
		$manager = new Progress_Manager();
		$manager->update( 'admin-navigation', 1, Progress_Manager::STATUS_COMPLETED, 'account' );

		// Act
		$manager->update( 'admin-navigation', 1, Progress_Manager::STATUS_IN_PROGRESS, 'posts' );

		// Assert
		$this->assertSame( Progress_Manager::STATUS_COMPLETED, $manager->get_progress( 'admin-navigation', 1 )['status'] );
	}
}
