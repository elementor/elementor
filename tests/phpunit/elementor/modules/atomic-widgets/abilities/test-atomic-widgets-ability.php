<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\AtomicWidgets\Abilities;

use Elementor\Core\Breakpoints\Manager as Breakpoints_Manager;
use Elementor\Elements_Manager;
use Elementor\Modules\AtomicWidgets\Abilities\Atomic_Widgets_Ability;
use PHPUnit\Framework\TestCase;
use Spatie\Snapshots\MatchesSnapshots;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Targeted regression tests for Atomic_Widgets_Ability.
 *
 * Pins the annotations.instructions text so LLM/MCP context regressions
 * (e.g. wrong prop-type guidance, removed call-ordering rules) are caught
 * before they reach production agents.
 *
 * @group Elementor\Modules\AtomicWidgets
 */
class Test_Atomic_Widgets_Ability extends TestCase {
	use MatchesSnapshots;

	private function make_ability(): Atomic_Widgets_Ability {
		return new Atomic_Widgets_Ability(
			$this->createMock( Elements_Manager::class ),
			$this->createMock( Breakpoints_Manager::class )
		);
	}

	private function get_config(): array {
		$ability = $this->make_ability();
		$ref     = new \ReflectionMethod( $ability, 'get_config' );
		$ref->setAccessible( true );

		return $ref->invoke( $ability );
	}

	// ── Snapshot: pins the exact instruction text ────────────────────────────

	public function test_annotations_instructions__snapshot(): void {
		$config = $this->get_config();

		$this->assertMatchesSnapshot( $config['meta']['annotations']['instructions'] );
	}

	// ── Contract: must instruct consumers to call this ability first ─────────

	public function test_annotations_instructions__directs_call_ordering(): void {
		$instructions = $this->get_config()['meta']['annotations']['instructions'];

		$this->assertStringContainsString(
			'Call before',
			$instructions,
			'Instructions must tell consumers to call this ability before working with styles or prop types.'
		);
	}

	// ── Contract: ability metadata ────────────────────────────────────────────

	public function test_annotations__is_readonly_and_not_destructive(): void {
		$annotations = $this->get_config()['meta']['annotations'];

		$this->assertTrue( $annotations['readonly'] );
		$this->assertFalse( $annotations['destructive'] );
		$this->assertTrue( $annotations['idempotent'] );
	}
}
