<?php

namespace Elementor\Testing\Modules\Components\Utils;

use Elementor\Modules\Components\Utils\Resolve_Detached_Instance;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Components
 */
class Test_Resolve_Detached_Instance extends TestCase {

	public function test_apply__replaces_top_level_overridable_with_matching_override_value() {
		// Arrange
		$element = [
			'id' => 'btn',
			'elType' => 'widget',
			'widgetType' => 'e-button',
			'settings' => [
				'text' => $this->overridable( 'prop-0', $this->string_value( 'origin' ) ),
			],
		];
		$overrides = [
			$this->override_item( 'prop-0', $this->string_value( 'override' ), 42 ),
		];

		// Act
		$result = Resolve_Detached_Instance::apply( $element, $overrides );

		// Assert
		$this->assertSame( $this->string_value( 'override' ), $result['settings']['text'] );
	}

	public function test_apply__uses_origin_value_when_no_matching_override() {
		// Arrange
		$element = [
			'id' => 'btn',
			'elType' => 'widget',
			'widgetType' => 'e-button',
			'settings' => [
				'text' => $this->overridable( 'prop-0', $this->string_value( 'origin' ) ),
			],
		];

		// Act
		$result = Resolve_Detached_Instance::apply( $element, [] );

		// Assert
		$this->assertSame( $this->string_value( 'origin' ), $result['settings']['text'] );
	}

	public function test_apply__normalizes_empty_origin_value_to_null() {
		// Arrange
		$element = [
			'id' => 'btn',
			'elType' => 'widget',
			'widgetType' => 'e-button',
			'settings' => [
				'text' => $this->overridable( 'prop-0', [] ),
			],
		];

		// Act
		$result = Resolve_Detached_Instance::apply( $element, [] );

		// Assert
		$this->assertNull( $result['settings']['text'] );
	}

	public function test_apply__recurses_into_children_and_nested_prop_shapes() {
		// Arrange
		$element = [
			'id' => 'container',
			'elType' => 'container',
			'settings' => [
				'link' => [
					'$$type' => 'link',
					'value' => [
						'url' => $this->overridable( 'prop-url', $this->string_value( 'default' ) ),
					],
				],
			],
			'elements' => [
				[
					'id' => 'child',
					'elType' => 'widget',
					'widgetType' => 'e-heading',
					'settings' => [
						'title' => $this->overridable( 'prop-title', $this->string_value( 'default' ) ),
					],
				],
			],
		];
		$overrides = [
			$this->override_item( 'prop-url', $this->string_value( 'https://x' ), 42 ),
			$this->override_item( 'prop-title', $this->string_value( 'Hello' ), 42 ),
		];

		// Act
		$result = Resolve_Detached_Instance::apply( $element, $overrides );

		// Assert
		$this->assertSame( $this->string_value( 'https://x' ), $result['settings']['link']['value']['url'] );
		$this->assertSame( $this->string_value( 'Hello' ), $result['elements'][0]['settings']['title'] );
	}

	public function test_apply__nested_instance_pushes_outer_override_onto_inner_override_key() {
		// Arrange: an inner e-component whose overrides array holds one `overridable` item.
		// That overridable wraps an inner override targeting the nested component's own prop-0.
		// The outer instance exposes it as prop-outer, and provides a matching outer override.
		$inner_override = $this->override_item( 'prop-0', $this->string_value( 'inner-default' ), 99 );
		$element = [
			'id' => 'outer-child',
			'elType' => 'widget',
			'widgetType' => 'e-component',
			'settings' => [
				'component_instance' => [
					'$$type' => 'component-instance',
					'value' => [
						'component_id' => [ '$$type' => 'number', 'value' => 99 ],
						'overrides' => [
							'$$type' => 'overrides',
							'value' => [
								[
									'$$type' => 'overridable',
									'value' => [
										'override_key' => 'prop-outer',
										'origin_value' => $inner_override,
									],
								],
							],
						],
					],
				],
			],
		];
		$outer_overrides = [
			$this->override_item( 'prop-outer', $this->string_value( 'outer-value' ), 42 ),
		];

		// Act
		$result = Resolve_Detached_Instance::apply( $element, $outer_overrides );

		// Assert
		$updated = $result['settings']['component_instance']['value']['overrides']['value'];
		$this->assertCount( 1, $updated );
		$this->assertSame( 'override', $updated[0]['$$type'] );
		$this->assertSame( 'prop-0', $updated[0]['value']['override_key'] );
		$this->assertSame( $this->string_value( 'outer-value' ), $updated[0]['value']['override_value'] );
		$this->assertSame( [ 'type' => 'component', 'id' => 99 ], $updated[0]['value']['schema_source'] );
	}

	public function test_apply__nested_instance_without_matching_override_keeps_inner_override_intact() {
		// Arrange
		$inner_override = $this->override_item( 'prop-0', $this->string_value( 'inner' ), 99 );
		$element = [
			'id' => 'outer-child',
			'elType' => 'widget',
			'widgetType' => 'e-component',
			'settings' => [
				'component_instance' => [
					'$$type' => 'component-instance',
					'value' => [
						'component_id' => [ '$$type' => 'number', 'value' => 99 ],
						'overrides' => [
							'$$type' => 'overrides',
							'value' => [
								[
									'$$type' => 'overridable',
									'value' => [
										'override_key' => 'prop-outer',
										'origin_value' => $inner_override,
									],
								],
							],
						],
					],
				],
			],
		];

		// Act
		$result = Resolve_Detached_Instance::apply( $element, [] );

		// Assert
		$updated = $result['settings']['component_instance']['value']['overrides']['value'];
		$this->assertCount( 1, $updated );
		$this->assertSame( $inner_override, $updated[0] );
	}

	private function overridable( string $override_key, $origin_value ): array {
		return [
			'$$type' => 'overridable',
			'value' => [
				'override_key' => $override_key,
				'origin_value' => $origin_value,
			],
		];
	}

	private function override_item( string $override_key, $override_value, int $component_id ): array {
		return [
			'$$type' => 'override',
			'value' => [
				'override_key' => $override_key,
				'override_value' => $override_value,
				'schema_source' => [ 'type' => 'component', 'id' => $component_id ],
			],
		];
	}

	private function string_value( string $value ): array {
		return [ '$$type' => 'string', 'value' => $value ];
	}
}
