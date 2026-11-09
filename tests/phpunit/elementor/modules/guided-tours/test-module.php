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
		$module->enqueue_assets();

		// Assert.
		$this->assertTrue( wp_script_is( 'elementor-guided-tours', 'enqueued' ) );
		$this->assertTrue( wp_script_is( 'elementor-guided-tours-driver', 'enqueued' ) );
		$this->assertSame( 1, $repository->calls );
	}

	public function test_enqueue_assets__does_not_fetch_or_enqueue_for_non_administrator(): void {
		// Arrange.
		$this->act_as_subscriber();
		set_current_screen( 'dashboard' );
		$repository = new Tours_Repository_Stub( $this->get_tour() );
		$module = new Module( $repository, new Progress_Manager_Stub() );

		// Act.
		$module->enqueue_assets();

		// Assert.
		$this->assertFalse( wp_script_is( 'elementor-guided-tours', 'enqueued' ) );
		$this->assertSame( 0, $repository->calls );
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
					'selector' => '#menu-dashboard',
					'title' => 'Dashboard',
					'description' => 'Start here.',
					'side' => 'right',
				],
			],
		];
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
	public function get_progress( string $tour_id, int $version ): array {
		return [];
	}

	public function is_completed( string $tour_id, int $version ): bool {
		return false;
	}
}
