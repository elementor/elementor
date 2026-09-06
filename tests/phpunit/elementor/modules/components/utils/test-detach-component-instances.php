<?php

namespace Elementor\Testing\Modules\Components\Utils;

use Elementor\Modules\Components\Utils\Detach_Component_Instances;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Components
 */
class Test_Detach_Component_Instances extends TestCase {

	public function test_apply_with_resolver__replaces_instance_with_resolved_elements() {
		// Arrange
		$elements = [
			$this->component_instance( 'ci-1', 42 ),
		];

		$component_elements = [
			$this->widget( 'inner-btn', 'e-button' ),
			$this->widget( 'inner-heading', 'e-heading' ),
		];

		$resolver = fn( int $id ) => 42 === $id ? $component_elements : null;

		// Act
		$result = Detach_Component_Instances::apply_with_resolver( $elements, $resolver );

		// Assert
		$this->assertCount( 2, $result );
		$this->assertSame( 'inner-btn', $result[0]['id'] );
		$this->assertSame( 'inner-heading', $result[1]['id'] );
	}

	public function test_apply_with_resolver__missing_component_keeps_original_instance_node() {
		// Arrange
		$instance = $this->component_instance( 'ci-1', 42 );
		$resolver = fn( int $id ) => null;

		// Act
		$result = Detach_Component_Instances::apply_with_resolver( [ $instance ], $resolver );

		// Assert
		$this->assertSame( [ $instance ], $result );
	}

	public function test_apply_with_resolver__circular_reference_drops_inner_instance() {
		// Arrange: component 42 renders a component-instance widget that points back at 42.
		$elements = [
			$this->component_instance( 'ci-outer', 42 ),
		];

		$resolver = function ( int $id ) {
			if ( 42 !== $id ) {
				return null;
			}

			return [
				$this->widget( 'sibling', 'e-heading' ),
				$this->component_instance( 'ci-inner', 42 ),
			];
		};

		// Act
		$result = Detach_Component_Instances::apply_with_resolver( $elements, $resolver );

		// Assert: only the non-recursive sibling survives; the recursive re-entry is stripped.
		$this->assertCount( 1, $result );
		$this->assertSame( 'sibling', $result[0]['id'] );
	}

	public function test_apply_with_resolver__resolver_throwable_keeps_original_node() {
		// Arrange
		$instance = $this->component_instance( 'ci-1', 42 );
		$resolver = function ( int $id ) {
			throw new \RuntimeException( 'reconcile blew up' );
		};

		// Act
		$result = Detach_Component_Instances::apply_with_resolver( [ $instance ], $resolver );

		// Assert
		$this->assertSame( [ $instance ], $result );
	}

	public function test_apply_with_resolver__recurses_into_nested_containers() {
		// Arrange
		$elements = [
			[
				'id' => 'container-1',
				'elType' => 'container',
				'elements' => [
					$this->component_instance( 'ci-1', 42 ),
					$this->widget( 'sibling', 'e-heading' ),
				],
			],
		];

		$resolver = fn( int $id ) => 42 === $id
			? [ $this->widget( 'inner', 'e-button' ) ]
			: null;

		// Act
		$result = Detach_Component_Instances::apply_with_resolver( $elements, $resolver );

		// Assert
		$this->assertCount( 1, $result );
		$this->assertCount( 2, $result[0]['elements'] );
		$this->assertSame( 'inner', $result[0]['elements'][0]['id'] );
		$this->assertSame( 'sibling', $result[0]['elements'][1]['id'] );
	}

	public function test_apply_with_resolver__missing_component_id_keeps_node_untouched() {
		// Arrange: component-instance node with a non-numeric component_id path.
		$instance = [
			'id' => 'ci-broken',
			'elType' => 'widget',
			'widgetType' => 'e-component',
			'settings' => [],
		];
		$resolver = fn( int $id ) => [ $this->widget( 'inner', 'e-button' ) ];

		// Act
		$result = Detach_Component_Instances::apply_with_resolver( [ $instance ], $resolver );

		// Assert
		$this->assertSame( [ $instance ], $result );
	}

	public function test_apply_with_resolver__bakes_overrides_into_resolved_elements() {
		// Arrange: the instance carries an override for `prop-0`, the component tree has an
		// overridable settings value keyed by `prop-0`. `Resolve_Detached_Instance` should
		// pick the override value.
		$elements = [
			[
				'id' => 'ci-1',
				'elType' => 'widget',
				'widgetType' => 'e-component',
				'settings' => [
					'component_instance' => [
						'$$type' => 'component-instance',
						'value' => [
							'component_id' => [ '$$type' => 'number', 'value' => 42 ],
							'overrides' => [
								'$$type' => 'overrides',
								'value' => [
									[
										'$$type' => 'override',
										'value' => [
											'override_key' => 'prop-0',
											'override_value' => [ '$$type' => 'string', 'value' => 'baked' ],
											'schema_source' => [ 'type' => 'component', 'id' => 42 ],
										],
									],
								],
							],
						],
					],
				],
			],
		];

		$resolver = fn( int $id ) => [
			[
				'id' => 'inner',
				'elType' => 'widget',
				'widgetType' => 'e-button',
				'settings' => [
					'text' => [
						'$$type' => 'overridable',
						'value' => [
							'override_key' => 'prop-0',
							'origin_value' => [ '$$type' => 'string', 'value' => 'origin' ],
						],
					],
				],
			],
		];

		// Act
		$result = Detach_Component_Instances::apply_with_resolver( $elements, $resolver );

		// Assert
		$this->assertCount( 1, $result );
		$this->assertSame(
			[ '$$type' => 'string', 'value' => 'baked' ],
			$result[0]['settings']['text']
		);
	}

	private function component_instance( string $id, int $component_id ): array {
		return [
			'id' => $id,
			'elType' => 'widget',
			'widgetType' => 'e-component',
			'settings' => [
				'component_instance' => [
					'$$type' => 'component-instance',
					'value' => [
						'component_id' => [ '$$type' => 'number', 'value' => $component_id ],
					],
				],
			],
		];
	}

	private function widget( string $id, string $widget_type ): array {
		return [
			'id' => $id,
			'elType' => 'widget',
			'widgetType' => $widget_type,
			'settings' => [],
		];
	}
}
