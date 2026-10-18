<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp\Abilities\Appliers;

use Elementor\Modules\Components\Components_Repository;
use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Modules\Components\PropTypes\Component_Instance_Prop_Type;
use Elementor\Modules\DataFlow\State_Params;
use Elementor\Modules\Mcp\Abilities\Appliers\State_Applier;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_State_Applier extends Elementor_Test_Base {

	const COUNT_PARAM = [ 'key' => 'count', 'label' => 'Count', 'type' => 'number', 'default' => 0 ];

	public function setUp(): void {
		parent::setUp();

		Plugin::$instance->documents->register_document_type( Component_Document::TYPE, Component_Document::get_class_full_name() );
		register_post_type( Component_Document::TYPE, [
			'label' => Component_Document::get_title(),
			'labels' => Component_Document::get_labels(),
			'public' => false,
			'supports' => Component_Document::get_supported_features(),
		] );
		$this->act_as_admin();
	}

	public function test_apply_state_params__writes_sanitized_params_and_warns_on_dropped_ones() {
		// Arrange
		$node = [ 'id' => 'abc' ];
		$index = [ 'section' => &$node ];

		// Act
		$warnings = ( new State_Applier() )->apply_state_params( $index, [
			'section' => [ self::COUNT_PARAM, [ 'key' => 'bad key', 'type' => 'number' ] ],
			'ghost' => [ self::COUNT_PARAM ],
		] );

		// Assert
		$this->assertSame( [ self::COUNT_PARAM ], $node[ State_Params::DATA_KEY ] );
		$this->assertSame( [ 'state_params_invalid', 'state_unknown_configuration_id' ], $warnings->codes() );
	}

	public function test_apply_state_params__null_and_empty_list_clear_params() {
		// Arrange
		$first = [ State_Params::DATA_KEY => [ self::COUNT_PARAM ] ];
		$second = [ State_Params::DATA_KEY => [ self::COUNT_PARAM ] ];
		$index = [ 'first' => &$first, 'second' => &$second ];

		// Act
		$warnings = ( new State_Applier() )->apply_state_params( $index, [ 'first' => null, 'second' => [] ] );

		// Assert
		$this->assertTrue( $warnings->is_empty() );
		$this->assertArrayNotHasKey( State_Params::DATA_KEY, $first );
		$this->assertArrayNotHasKey( State_Params::DATA_KEY, $second );
	}

	public function test_apply_state_values__keeps_declared_coerced_values_and_reports_the_rest() {
		// Arrange
		$component_id = $this->create_component_with_params( [
			self::COUNT_PARAM,
			[ 'key' => 'open', 'type' => 'boolean', 'default' => false ],
		] );
		$instance = $this->create_instance_node( $component_id );
		$index = [ 'counter' => &$instance ];

		// Act
		$warnings = ( new State_Applier() )->apply_state_values( $index, [
			'counter' => [ 'count' => '5', 'open' => 'maybe', 'ghost' => 1 ],
		] );

		// Assert
		$this->assertSame( [ 'count' => 5 ], $instance[ State_Params::VALUES_DATA_KEY ] );
		$this->assertSame( [ 'state_unknown_key', 'state_type_mismatch' ], $warnings->codes() );
	}

	public function test_apply_state_values__rejects_non_component_targets_and_clears_on_null() {
		// Arrange
		$container = [ 'id' => 'abc', 'elType' => 'e-flexbox' ];
		$instance = $this->create_instance_node( $this->create_component_with_params( [ self::COUNT_PARAM ] ) );
		$instance[ State_Params::VALUES_DATA_KEY ] = [ 'count' => 3 ];
		$index = [ 'section' => &$container, 'counter' => &$instance ];

		// Act
		$warnings = ( new State_Applier() )->apply_state_values( $index, [
			'section' => [ 'count' => 1 ],
			'counter' => null,
		] );

		// Assert
		$this->assertArrayNotHasKey( State_Params::VALUES_DATA_KEY, $container );
		$this->assertArrayNotHasKey( State_Params::VALUES_DATA_KEY, $instance );
		$this->assertSame( [ 'state_target_not_component' ], $warnings->codes() );
	}

	private function create_component_with_params( array $params ): int {
		return ( new Components_Repository() )->create( 'Counter', [
			[
				'id' => 'root',
				'elType' => 'e-flexbox',
				'settings' => [],
				'elements' => [],
				State_Params::DATA_KEY => $params,
			],
		], 'publish', uniqid( 'uid-', true ) );
	}

	private function create_instance_node( int $component_id ): array {
		return [
			'id' => 'inst',
			'elType' => 'widget',
			'widgetType' => Component_Instance_Prop_Type::WIDGET_TYPE,
			'settings' => Component_Instance_Prop_Type::set_component_id( [], $component_id ),
		];
	}
}
