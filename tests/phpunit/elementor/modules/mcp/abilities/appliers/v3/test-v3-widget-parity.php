<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Auto_Mapper;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Widget_Map_Loader;
use Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Fixtures\V3_Widget_Fixtures;
use Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Support\Parity_Fixture_Loader;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/fixtures/v3-widget-fixtures.php';
require_once __DIR__ . '/support/parity-fixture-loader.php';

/**
 * The one data-provider-driven test that guards every allowlisted V3 widget's MCP surface.
 *
 * Adding a new V3 widget to MCP means:
 *   1. Ship the map file at `modules/mcp/abilities/appliers/v3/maps/<widget>-map.php`.
 *   2. Ship a parity fixture at `tests/…/v3/fixtures/parity/<widget>.php` naming what the LLM
 *      should be able to write and what it should NOT be able to write.
 *   3. Ship the widget's controls dump at `tests/…/v3/fixtures/controls/<widget>.json` (only
 *      needed for widgets whose controls the core PHPUnit suite cannot introspect — Pro-only
 *      widgets, or widgets that require a WordPress boot the suite doesn't run).
 *   4. Re-run this file. Every failure names a specific CSS property that regressed.
 *
 * @group Elementor\Modules\Mcp
 */
class Test_V3_Widget_Parity extends TestCase {

	protected function setUp(): void {
		parent::setUp();
	}

	private function skip_if_no_controls_capture( string $widget_type ): void {
		if ( ! Parity_Fixture_Loader::has_controls( $widget_type ) ) {
			$this->markTestSkipped( sprintf(
				'No controls fixture for `%s`. Capture one by running: wp eval-file bin/capture-v3-controls.php -- %s',
				$widget_type,
				$widget_type
			) );
		}
	}

	/**
	 * @dataProvider parity_fixtures
	 * @param array<string, mixed> $fixture
	 */
	public function test_expected_supported_properties_route_to_native_settings( string $widget_type, array $fixture ) {
		$this->skip_if_no_controls_capture( $widget_type );
		$routed = $this->routed_property_keys( $widget_type );
		$missing = array_values( array_diff( $fixture['expected_supported'], $routed ) );

		$this->assertSame(
			[],
			$missing,
			sprintf(
				'On `%s` the LLM should be able to write these CSS properties, but they are not mapped to any native setting: %s. Add an override to the widget map or extend the introspector.',
				$widget_type,
				implode( ', ', $missing )
			)
		);
	}

	/**
	 * @dataProvider parity_fixtures
	 * @param array<string, mixed> $fixture
	 */
	public function test_expected_unsupported_properties_do_not_route( string $widget_type, array $fixture ) {
		$this->skip_if_no_controls_capture( $widget_type );
		$routed = $this->routed_property_keys( $widget_type );
		$leaked = array_values( array_intersect( $fixture['expected_unsupported'], $routed ) );

		$this->assertSame(
			[],
			$leaked,
			sprintf(
				'On `%s` these CSS properties were expected to fall through to custom_css but are being mapped to native settings: %s. If this is now supported, move them from `expected_unsupported` to `expected_supported`.',
				$widget_type,
				implode( ', ', $leaked )
			)
		);
	}

	/**
	 * @dataProvider parity_fixtures
	 * @param array<string, mixed> $fixture
	 */
	public function test_non_style_keys_match_expected( string $widget_type, array $fixture ) {
		$this->skip_if_no_controls_capture( $widget_type );

		if ( null === $fixture['expected_non_style_keys'] ) {
			$this->markTestSkipped( sprintf(
				'Parity fixture for `%s` did not author `expected_non_style_keys` yet. Fill it in from the failing shape and remove the null.',
				$widget_type
			) );
		}

		$actual = V3_Widget_Map_Loader::get_non_style_keys( $widget_type, Parity_Fixture_Loader::controls( $widget_type ) );

		sort( $actual );
		$expected = $fixture['expected_non_style_keys'];
		sort( $expected );

		$this->assertSame(
			$expected,
			$actual,
			sprintf( 'Non-style write allowlist for `%s` drifted from the parity fixture.', $widget_type )
		);
	}

	/**
	 * @dataProvider parity_fixtures
	 * @param array<string, mixed> $fixture
	 */
	public function test_inner_element_aliases_match_expected( string $widget_type, array $fixture ) {
		$this->skip_if_no_controls_capture( $widget_type );

		if ( null === $fixture['expected_inner_aliases'] ) {
			$this->markTestSkipped( sprintf(
				'Parity fixture for `%s` did not author `expected_inner_aliases` yet.',
				$widget_type
			) );
		}

		$aliases = array_keys(
			V3_Widget_Map_Loader::get_inner_elements( $widget_type, Parity_Fixture_Loader::controls( $widget_type ) )
		);

		sort( $aliases );
		$expected = $fixture['expected_inner_aliases'];
		sort( $expected );

		$this->assertSame(
			$expected,
			$aliases,
			sprintf( 'Inner-element aliases for `%s` drifted from the parity fixture.', $widget_type )
		);
	}

	public function parity_fixtures(): array {
		$cases = [];

		foreach ( Parity_Fixture_Loader::all() as $widget_type => $fixture ) {
			$cases[ $widget_type ] = [ $widget_type, $fixture ];
		}

		return $cases;
	}

	/**
	 * Every CSS property (or `property@state`) that has *some* route at the widget's wrapper
	 * scope — either an explicit override or a generic-index hit. Inner-element scopes are
	 * intentionally not folded in: the LLM writes to an alias only via `alias { … }` blocks,
	 * so wrapper coverage is the natural granularity of the parity contract.
	 *
	 * @return string[]
	 */
	private function routed_property_keys( string $widget_type ): array {
		$controls = Parity_Fixture_Loader::controls( $widget_type );
		$config = [ 'controls' => $controls ];
		$map = V3_Widget_Map_Loader::get( $widget_type, $controls );

		$mapping = V3_Auto_Mapper::for_scope( $config, [
			'setting_keys' => $map['wrapper']['setting_keys'],
			'style_overrides' => $map['wrapper']['style_overrides'],
		] );

		return array_values(
			array_unique(
				array_merge(
					array_keys( $mapping['overrides'] ),
					array_keys( $mapping['generic_index'] )
				)
			)
		);
	}
}
