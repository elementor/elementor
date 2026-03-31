<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Variables\Abilities;

use Elementor\Core\Kits\Manager as Kits_Manager;
use Elementor\Modules\Variables\Abilities\Variables_Ability;
use PHPUnit\Framework\TestCase;
use Spatie\Snapshots\MatchesSnapshots;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Targeted regression tests for Variables_Ability.
 *
 * The instructions embed the $$type reference formats for color and font
 * variables. A regression here (wrong $$type key, dropped variable type)
 * causes agents to generate invalid prop values that silently produce no CSS.
 *
 * @group Elementor\Modules\Variables
 */
class Test_Variables_Ability extends TestCase {
	use MatchesSnapshots;

	private function get_config(): array {
		$ability = new Variables_Ability( $this->createMock( Kits_Manager::class ) );
		$ref     = new \ReflectionMethod( $ability, 'get_config' );
		$ref->setAccessible( true );

		return $ref->invoke( $ability );
	}

	// ── Snapshot: pins the exact instruction text ────────────────────────────

	public function test_annotations_instructions__snapshot(): void {
		$config = $this->get_config();

		$this->assertMatchesSnapshot( $config['meta']['annotations']['instructions'] );
	}

	// ── Contract: $$type formats for each variable type must be present ──────

	public function test_annotations_instructions__contains_global_color_variable_format(): void {
		$instructions = $this->get_config()['meta']['annotations']['instructions'];

		$this->assertStringContainsString(
			'$$type":"global-color-variable"',
			$instructions,
			'Instructions must include the $$type:global-color-variable reference format.'
		);
	}

	public function test_annotations_instructions__contains_global_font_variable_format(): void {
		$instructions = $this->get_config()['meta']['annotations']['instructions'];

		$this->assertStringContainsString(
			'$$type":"global-font-variable"',
			$instructions,
			'Instructions must include the $$type:global-font-variable reference format.'
		);
	}

	// ── Contract: ability metadata ────────────────────────────────────────────

	public function test_annotations__is_readonly_and_not_destructive(): void {
		$annotations = $this->get_config()['meta']['annotations'];

		$this->assertTrue( $annotations['readonly'] );
		$this->assertFalse( $annotations['destructive'] );
	}
}
