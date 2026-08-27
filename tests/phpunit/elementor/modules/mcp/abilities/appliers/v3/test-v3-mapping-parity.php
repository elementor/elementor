<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Auto_Mapper;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Style_Settings_Index;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Widget_Bridge_Registry;
use Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Fixtures\V3_Widget_Fixtures;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/fixtures/v3-widget-fixtures.php';

/**
 * Locks the CSS-property → V3-setting mapping against fixtures captured from the
 * hand-authored registry, so auto-derivation cannot silently change what the LLM
 * is told it can style.
 */
class Test_V3_Mapping_Parity extends TestCase {

	/**
	 * @dataProvider golden_widget_types
	 */
	public function test_wrapper_mapping__matches_golden( string $widget_type ) {
		// Arrange.
		$golden = V3_Widget_Fixtures::poc_goldens()[ $widget_type ];
		$config = V3_Widget_Fixtures::widget_config( $widget_type );
		$overrides = V3_Widget_Bridge_Registry::get_style_overrides( $widget_type );

		// Act.
		$generic_index = V3_Style_Settings_Index::build( $config['controls'], $overrides );

		// Assert.
		$this->assertSame( $golden['wrapper_style_overrides'], $overrides );
		$this->assertSame( $golden['wrapper_generic_index'], $generic_index );
	}

	/**
	 * @dataProvider golden_widget_types
	 */
	public function test_non_style_keys__matches_golden( string $widget_type ) {
		// Arrange.
		$golden = V3_Widget_Fixtures::poc_goldens()[ $widget_type ];

		// Act.
		$non_style_keys = V3_Widget_Bridge_Registry::get_non_style_keys( $widget_type );

		// Assert.
		$this->assertSame( $golden['non_style_keys'], $non_style_keys );
	}

	/**
	 * @dataProvider golden_widget_types
	 */
	public function test_inner_elements__match_golden( string $widget_type ) {
		// Arrange.
		$golden = V3_Widget_Fixtures::poc_goldens()[ $widget_type ];
		$config = V3_Widget_Fixtures::widget_config( $widget_type );

		// Act.
		$inner_elements = V3_Widget_Bridge_Registry::get_inner_elements( $widget_type );

		// Assert.
		$this->assertSame(
			array_keys( $golden['inner_elements'] ),
			array_keys( $inner_elements ),
			'Inner-element aliases changed for ' . $widget_type
		);
		$this->assertSame(
			$golden['default_inner_element'],
			V3_Widget_Bridge_Registry::get_default_inner_element( $widget_type )
		);

		foreach ( $golden['inner_elements'] as $alias => $expected ) {
			$mapping = V3_Auto_Mapper::for_scope( $config, $inner_elements[ $alias ] );

			$this->assertSame( $expected['overrides'], $mapping['overrides'], $alias . ' overrides' );
			$this->assertSame( $expected['generic_index'], $mapping['generic_index'], $alias . ' generic index' );
			$this->assertSame(
				$expected['accepted_css_properties'],
				V3_Auto_Mapper::accepted_css_properties( $config, $inner_elements[ $alias ] ),
				$alias . ' accepted properties'
			);
			$this->assertSame(
				$expected['supported_states'],
				V3_Auto_Mapper::supported_states( $config, $inner_elements[ $alias ] ),
				$alias . ' supported states'
			);
		}
	}

	public function golden_widget_types(): array {
		$cases = [];

		foreach ( array_keys( V3_Widget_Fixtures::poc_goldens() ) as $widget_type ) {
			$cases[ $widget_type ] = [ $widget_type ];
		}

		return $cases;
	}
}
