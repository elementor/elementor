<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\GuidedTours;

use Elementor\Modules\GuidedTours\Module;
use Elementor\Modules\GuidedTours\Progress_Manager;
use Elementor\Modules\GuidedTours\Tours_Repository;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Module extends Elementor_Test_Base {
	public function tearDown(): void {
		wp_dequeue_script( 'elementor-guided-tours' );
		wp_dequeue_script( 'elementor-guided-tours-driver' );
		wp_dequeue_style( 'elementor-guided-tours' );
		wp_dequeue_style( 'elementor-guided-tours-driver' );
		set_current_screen( 'front' );

		parent::tearDown();
	}

	public function test_enqueue_assets__enqueues_for_eligible_administrator(): void {
		// Arrange.
		$this->act_as_admin();
		set_current_screen( 'dashboard' );
		$repository = new Tours_Repository_Stub( $this->get_tour() );
		$module = new Module( $repository, new Progress_Manager_Stub() );

		// Act.
		$module->enqueue_admin_assets();

		// Assert.
		$this->assertTrue( wp_script_is( 'elementor-guided-tours', 'enqueued' ) );
		$this->assertTrue( wp_script_is( 'elementor-guided-tours-driver', 'enqueued' ) );
		$this->assertSame( 1, $repository->calls );
	}

	public function test_enqueue_editor_assets__enqueues_for_eligible_administrator(): void {
		// Arrange.
		$this->act_as_admin();
		$repository = new Tours_Repository_Stub( $this->get_editor_tour() );
		$module = new Module( $repository, new Progress_Manager_Stub() );

		// Act.
		$module->enqueue_editor_assets();

		// Assert.
		$this->assertTrue( wp_script_is( 'elementor-guided-tours', 'enqueued' ) );
		$this->assertSame( 1, $repository->calls );
	}

	public function test_enqueue_assets__does_not_fetch_or_enqueue_for_non_administrator(): void {
		// Arrange.
		$this->act_as_subscriber();
		set_current_screen( 'dashboard' );
		$repository = new Tours_Repository_Stub( $this->get_tour() );
		$module = new Module( $repository, new Progress_Manager_Stub() );

		// Act.
		$module->enqueue_admin_assets();

		// Assert.
		$this->assertFalse( wp_script_is( 'elementor-guided-tours', 'enqueued' ) );
		$this->assertSame( 0, $repository->calls );
	}

	private function get_editor_tour(): array {
		return [
			'id' => 'editor-ui',
			'version' => 1,
			'is_active' => true,
			'screens' => [ Module::EDITOR_SCREEN_ID ],
			'roles' => [ 'administrator' ],
			'steps' => [
				[
					'id' => 'widget-panel',
					'screen' => Module::EDITOR_SCREEN_ID,
					'selector' => '#elementor-panel',
					'title' => 'Widget panel',
					'description' => 'Browse widgets.',
					'side' => 'right',
				],
			],
		];
	}

	private function get_tour(): array {
		return [
			'id' => 'admin-navigation',
			'version' => 1,
			'is_active' => true,
			'screens' => [ 'dashboard' ],
			'roles' => [ 'administrator' ],
			'steps' => [
				[
					'id' => 'dashboard',
					'screen' => 'dashboard',
					'selector' => '#menu-dashboard',
					'title' => 'Dashboard',
					'description' => 'Start here.',
					'side' => 'right',
				],
			],
		];
	}

	private function get_multi_screen_tour(): array {
		return [
			'id' => 'admin-navigation',
			'version' => 2,
			'is_active' => true,
			'screens' => [ 'dashboard', 'options-general' ],
			'roles' => [ 'administrator' ],
			'steps' => [
				[
					'id' => 'settings-menu',
					'screen' => 'dashboard',
					'selector' => '#menu-settings',
					'title' => 'Settings',
					'description' => 'Start here.',
					'side' => 'right',
					'next_url' => 'options-general.php',
				],
				[
					'id' => 'reading-tab',
					'screen' => 'options-general',
					'selector' => 'a[href="options-reading.php"]',
					'title' => 'Reading',
					'description' => 'Each settings area has its own tab.',
					'side' => 'right',
				],
			],
		];
	}

	public function test_enqueue_assets__enqueues_on_next_screen_after_navigation_step(): void {
		// Arrange.
		$this->act_as_admin();
		set_current_screen( 'options-general' );
		$tour = $this->get_multi_screen_tour();
		$repository = new Tours_Repository_Stub( $tour );
		$module = new Module( $repository, new Progress_Manager_Stub( [
			'status' => Progress_Manager::STATUS_IN_PROGRESS,
			'step_id' => 'settings-menu',
			'version' => 2,
		] ) );

		// Act.
		$module->enqueue_admin_assets();

		// Assert.
		$this->assertTrue( wp_script_is( 'elementor-guided-tours', 'enqueued' ) );
	}

	public function test_enqueue_assets__does_not_enqueue_when_resume_step_is_on_another_screen(): void {
		// Arrange.
		$this->act_as_admin();
		set_current_screen( 'options-reading' );
		$repository = new Tours_Repository_Stub( $this->get_tour() );
		$module = new Module( $repository, new Progress_Manager_Stub( [
			'status' => Progress_Manager::STATUS_IN_PROGRESS,
			'step_id' => 'dashboard',
			'version' => 1,
		] ) );

		// Act.
		$module->enqueue_admin_assets();

		// Assert.
		$this->assertFalse( wp_script_is( 'elementor-guided-tours', 'enqueued' ) );
	}
}

class Tours_Repository_Stub extends Tours_Repository {
	public int $calls = 0;
	private array $tour;

	public function __construct( array $tour ) {
		$this->tour = $tour;
	}

	public function get_eligible_tour( string $screen_id, array $roles ): array {
		$this->calls++;

		return $this->tour;
	}
}

class Progress_Manager_Stub extends Progress_Manager {
	private array $progress;

	public function __construct( array $progress = [] ) {
		$this->progress = $progress;
	}

	public function get_progress( string $tour_id, int $version ): array {
		return $this->progress;
	}

	public function is_completed( string $tour_id, int $version ): bool {
		return Progress_Manager::STATUS_COMPLETED === ( $this->progress['status'] ?? null );
	}
}
