<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\AtomicWidgets\Abilities;

use Elementor\Core\Breakpoints\Manager as Breakpoints_Manager;
use Elementor\Modules\AtomicWidgets\Abilities\V4_Styles_Ability;
use PHPUnit\Framework\TestCase;
use Spatie\Snapshots\MatchesSnapshots;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Targeted regression tests for V4_Styles_Ability.
 *
 * The annotations.instructions and critical_rules strings directly steer LLM/MCP
 * tool use. Wrong $$type usage or unsafe save patterns here cause rendering
 * failures in the wild. These tests pin the exact text so any accidental change
 * requires a deliberate snapshot update.
 *
 * @group Elementor\Modules\AtomicWidgets
 */
class Test_V4_Styles_Ability extends TestCase {
	use MatchesSnapshots;

	private function make_ability(): V4_Styles_Ability {
		$bp = $this->createMock( Breakpoints_Manager::class );
		$bp->method( 'get_breakpoints_config' )->willReturn( [] );

		return new V4_Styles_Ability( $bp );
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

	// ── Contract: $$type (double dollar) must appear ─────────────────────────

	public function test_annotations_instructions__references_double_dollar_type(): void {
		$instructions = $this->get_config()['meta']['annotations']['instructions'];

		$this->assertStringContainsString(
			'$$type',
			$instructions,
			'Instructions must reference $$type (double dollar sign) to guide correct prop usage.'
		);
	}

	public function test_annotations_instructions__calls_out_double_dollar_explicitly(): void {
		$instructions = $this->get_config()['meta']['annotations']['instructions'];

		$this->assertStringContainsString(
			'double dollar',
			$instructions,
			'Instructions must explicitly name "double dollar" to prevent single-dollar mistakes.'
		);
	}

	// ── Contract: safe save pattern — validate before write ──────────────────

	public function test_annotations_instructions__mentions_validate_before_saving(): void {
		$instructions = $this->get_config()['meta']['annotations']['instructions'];

		$this->assertStringContainsString(
			'validate',
			strtolower( $instructions ),
			'Instructions must tell consumers to validate props before saving.'
		);
	}

	// ── Contract: ability metadata ────────────────────────────────────────────

	public function test_annotations__is_readonly_and_not_destructive(): void {
		$annotations = $this->get_config()['meta']['annotations'];

		$this->assertTrue( $annotations['readonly'] );
		$this->assertFalse( $annotations['destructive'] );
	}
}
