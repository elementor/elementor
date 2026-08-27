<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Auto_Mapper;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Widget_Map_Loader;
use Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Fixtures\V3_Widget_Fixtures;
use PHPUnit\Framework\TestCase;
use Spatie\Snapshots\MatchesSnapshots;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/fixtures/v3-widget-fixtures.php';

/**
 * Guards the CSS contract MCP gives an LLM for allowlisted V3 widgets.
 *
 * `poc-goldens.json` is the mapping the hand-authored registry produced before derivation.
 * Auto-derivation may cover more properties, and may move a property from the widget wrapper
 * into an inner element, but it must never make a property unstylable.
 */
class Test_V3_Mapping_Parity extends TestCase {
	use MatchesSnapshots;

	/**
	 * Properties deliberately dropped: Elementor's own custom properties and mask declarations
	 * are implementation details an LLM cannot author usefully.
	 */
	const CURATED_OUT_PROPERTY_PREFIXES = [ '--', '-webkit-mask' ];

	/**
	 * @dataProvider golden_widget_types
	 */
	public function test_resolved_mapping__keeps_every_golden_property_stylable( string $widget_type ) {
		// Arrange.
		$golden = V3_Widget_Fixtures::poc_goldens()[ $widget_type ];
		$expected = $this->stylable_golden_keys( $golden );

		// Act.
		$actual = $this->resolved_mapping_keys( $widget_type );

		// Assert.
		$this->assertSame( [], array_values( array_diff( $expected, $actual ) ) );
	}

	/**
	 * @dataProvider golden_widget_types
	 */
	public function test_non_style_keys__matches_hand_written_registry_lists( string $widget_type ) {
		// Arrange.
		$config = V3_Widget_Fixtures::widget_config( $widget_type );
		$expected = V3_Widget_Fixtures::poc_goldens()[ $widget_type ]['non_style_keys'];

		// Act.
		$actual = V3_Widget_Map_Loader::get_non_style_keys( $widget_type, $config['controls'] );

		// Assert.
		sort( $expected );
		sort( $actual );
		$this->assertSame( $expected, $actual );
	}

	/**
	 * @dataProvider allowlisted_widget_types
	 */
	public function test_resolved_map__matches_snapshot( string $widget_type ) {
		// Arrange.
		$config = V3_Widget_Fixtures::widget_config( $widget_type );
		$map = V3_Widget_Map_Loader::get( $widget_type, $config['controls'] );

		// Act.
		$snapshot = [
			'default_inner_element' => $map['default_inner_element'],
			'non_style_keys' => $map['non_style_keys'],
			'wrapper' => $this->scope_snapshot( $config, $this->wrapper_scope( $map ) ),
			'inner_elements' => [],
		];

		foreach ( $map['inner_elements'] as $alias => $inner_element ) {
			$snapshot['inner_elements'][ $alias ] = array_merge(
				[
					'label' => $inner_element['label'] ?? null,
					'canonical_selector' => $inner_element['canonical_selector'] ?? null,
				],
				$this->scope_snapshot( $config, $inner_element )
			);
		}

		// Assert.
		$this->assertMatchesJsonSnapshot( json_encode( $snapshot ) );
	}

	public function test_map_file_overrides__win_over_derived_mapping() {
		// Arrange.
		$config = V3_Widget_Fixtures::widget_config( 'nav-menu' );
		$toggle = V3_Widget_Map_Loader::get_inner_elements( 'nav-menu', $config['controls'] )['toggle'];

		// Act.
		$mapping = V3_Auto_Mapper::for_scope( $config, $toggle );

		// Assert.
		$this->assertSame( 'toggle_size', $mapping['overrides']['font-size']['setting'] );
		$this->assertArrayNotHasKey( 'font-size', $mapping['generic_index'] );
	}

	public function test_inner_elements__are_opt_in_per_map_file() {
		// Arrange.
		$config = V3_Widget_Fixtures::widget_config( 'theme-post-title' );

		// Act.
		$inner_elements = V3_Widget_Map_Loader::get_inner_elements( 'theme-post-title', $config['controls'] );

		// Assert.
		$this->assertSame( [], $inner_elements );
		$this->assertSame( [], V3_Widget_Map_Loader::get_inner_elements( 'theme-archive-title', $config['controls'] ) );
	}

	public function golden_widget_types(): array {
		return $this->as_cases( array_keys( V3_Widget_Fixtures::poc_goldens() ) );
	}

	public function allowlisted_widget_types(): array {
		return $this->as_cases( V3_Widget_Fixtures::widget_types() );
	}

	private function as_cases( array $widget_types ): array {
		$cases = [];

		foreach ( $widget_types as $widget_type ) {
			$cases[ $widget_type ] = [ $widget_type ];
		}

		return $cases;
	}

	/**
	 * @param array<string, mixed> $map
	 * @return array<string, mixed>
	 */
	private function wrapper_scope( array $map ): array {
		return [
			'setting_keys' => $map['wrapper']['setting_keys'],
			'style_overrides' => $map['wrapper']['style_overrides'],
		];
	}

	/**
	 * @param array<string, mixed> $config
	 * @param array<string, mixed> $scope
	 * @return array{accepted_css_properties: string[], supported_states: string[], mapping: array<string, string>}
	 */
	private function scope_snapshot( array $config, array $scope ): array {
		$mapping = V3_Auto_Mapper::for_scope( $config, $scope );
		$targets = [];

		foreach ( array_merge( $mapping['overrides'], $mapping['generic_index'] ) as $match_key => $rule ) {
			$targets[ $match_key ] = $rule['setting']
				?? $rule['typography_prefix']
				?? $rule['border_prefix']
				?? $rule['box_shadow_prefix']
				?? $rule['resolver']
				?? '?';
		}

		ksort( $targets );

		return [
			'accepted_css_properties' => V3_Auto_Mapper::accepted_css_properties( $config, $scope ),
			'supported_states' => V3_Auto_Mapper::supported_states( $config, $scope ),
			'mapping' => $targets,
		];
	}

	/**
	 * @param array<string, mixed> $golden
	 * @return string[]
	 */
	private function stylable_golden_keys( array $golden ): array {
		$keys = array_merge(
			array_keys( $golden['wrapper_style_overrides'] ),
			array_keys( $golden['wrapper_generic_index'] )
		);

		foreach ( $golden['inner_elements'] as $inner_element ) {
			$keys = array_merge(
				$keys,
				array_keys( $inner_element['overrides'] ),
				array_keys( $inner_element['generic_index'] )
			);
		}

		return array_values(
			array_unique(
				array_filter( $keys, fn( $key ) => ! $this->is_curated_out( $key ) )
			)
		);
	}

	/**
	 * @return string[]
	 */
	private function resolved_mapping_keys( string $widget_type ): array {
		$config = V3_Widget_Fixtures::widget_config( $widget_type );
		$map = V3_Widget_Map_Loader::get( $widget_type, $config['controls'] );
		$scopes = array_merge( [ $this->wrapper_scope( $map ) ], array_values( $map['inner_elements'] ) );
		$keys = [];

		foreach ( $scopes as $scope ) {
			$mapping = V3_Auto_Mapper::for_scope( $config, $scope );
			$keys = array_merge( $keys, array_keys( $mapping['overrides'] ), array_keys( $mapping['generic_index'] ) );
		}

		return array_values( array_unique( $keys ) );
	}

	private function is_curated_out( string $match_key ): bool {
		$property = explode( '@', $match_key, 2 )[0];

		foreach ( self::CURATED_OUT_PROPERTY_PREFIXES as $prefix ) {
			if ( str_starts_with( $property, $prefix ) ) {
				return true;
			}
		}

		return false;
	}
}
