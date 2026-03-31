<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\GlobalClasses\Abilities;

use Elementor\Core\Kits\Manager as Kits_Manager;
use Elementor\Modules\GlobalClasses\Abilities\Global_Classes_Ability;
use PHPUnit\Framework\TestCase;
use Spatie\Snapshots\MatchesSnapshots;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Targeted regression tests for Global_Classes_Ability.
 *
 * The instructions embed the $$type:classes reference format used when
 * agents wire global class IDs into element settings. A regression here
 * (e.g. dropping the $$type prefix or the correct format string) silently
 * breaks agent-generated element wiring.
 *
 * @group Elementor\Modules\GlobalClasses
 */
class Test_Global_Classes_Ability extends TestCase {
	use MatchesSnapshots;

	private function get_config(): array {
		$ability = new Global_Classes_Ability( $this->createMock( Kits_Manager::class ) );
		$ref     = new \ReflectionMethod( $ability, 'get_config' );
		$ref->setAccessible( true );

		return $ref->invoke( $ability );
	}

	// ── Snapshot: pins the exact instruction text ────────────────────────────

	public function test_annotations_instructions__snapshot(): void {
		$config = $this->get_config();

		$this->assertMatchesSnapshot( $config['meta']['annotations']['instructions'] );
	}

	// ── Contract: $$type:classes format must be present ──────────────────────

	public function test_annotations_instructions__contains_double_dollar_classes_format(): void {
		$instructions = $this->get_config()['meta']['annotations']['instructions'];

		$this->assertStringContainsString(
			'$$type":"classes"',
			$instructions,
			'Instructions must include the $$type:classes reference format for element settings.classes.'
		);
	}

	// ── Contract: ability metadata ────────────────────────────────────────────

	public function test_annotations__is_readonly_and_not_destructive(): void {
		$annotations = $this->get_config()['meta']['annotations'];

		$this->assertTrue( $annotations['readonly'] );
		$this->assertFalse( $annotations['destructive'] );
	}
}
