<?php

namespace Elementor\Testing\Modules\Components\Utils;

use Elementor\Modules\AtomicWidgets\ChildrenDependencies\Child_Dependency;
use Elementor\Modules\AtomicWidgets\Elements\Base\Element_Builder;
use Elementor\Modules\AtomicWidgets\Elements\Div_Block\Div_Block;
use Elementor\Modules\AtomicWidgets\PropDependencies\Manager as Dependency_Manager;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\Utils\Element_Position;
use Elementor\Modules\AtomicWidgets\Utils\Format_Element_Ids;
use Elementor\Modules\Components\Utils\Reconcile_Component_Instance_Elements;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Reconcile_Test_Parent extends Div_Block {
	public static function get_type() {
		return 'e-reconcile-test-parent';
	}

	public static function get_element_type(): string {
		return 'e-reconcile-test-parent';
	}

	public function get_name() {
		return 'e-reconcile-test-parent';
	}

	protected static function define_props_schema(): array {
		return array_merge(
			parent::define_props_schema(),
			[ 'show_child' => Boolean_Prop_Type::make()->default( true ) ]
		);
	}

	protected function define_children_dependencies(): array {
		return [
			Child_Dependency::for( Reconcile_Test_Child::get_element_type() )
				->when(
					Dependency_Manager::make()->where( [
						'operator' => 'ne',
						'path' => [ 'show_child' ],
						'value' => false,
					] )
				)
				->position( Element_Position::last() )
				->default_model(
					Element_Builder::make( Reconcile_Test_Child::get_element_type() )
						->is_locked( true )
						->children( [
							Element_Builder::make( Reconcile_Test_Leaf::get_element_type() )->build(),
							Element_Builder::make( Reconcile_Test_Leaf::get_element_type() )->build(),
						] )
						->build()
				),
		];
	}
}

class Reconcile_Test_Child extends Div_Block {
	public static function get_type() {
		return 'e-reconcile-test-child';
	}

	public static function get_element_type(): string {
		return 'e-reconcile-test-child';
	}

	public function get_name() {
		return 'e-reconcile-test-child';
	}
}

class Reconcile_Test_Leaf extends Div_Block {
	public static function get_type() {
		return 'e-reconcile-test-leaf';
	}

	public static function get_element_type(): string {
		return 'e-reconcile-test-leaf';
	}

	public function get_name() {
		return 'e-reconcile-test-leaf';
	}
}

class Test_Reconcile_Component_Instance_Elements extends Elementor_Test_Base {

	const TEST_TYPES = [
		Reconcile_Test_Parent::class,
		Reconcile_Test_Child::class,
		Reconcile_Test_Leaf::class,
	];

	public function setUp(): void {
		parent::setUp();

		foreach ( self::TEST_TYPES as $class ) {
			Plugin::$instance->elements_manager->register_element_type( new $class() );
		}
	}

	public function tearDown(): void {
		foreach ( self::TEST_TYPES as $class ) {
			Plugin::$instance->elements_manager->unregister_element_type( $class::get_element_type() );
		}

		parent::tearDown();
	}

	private function make_parent( array $settings = [], array $children = [] ): array {
		return [
			'id' => 'parent1',
			'elType' => Reconcile_Test_Parent::get_element_type(),
			'settings' => $settings,
			'elements' => $children,
		];
	}

	private function boolean( bool $value ): array {
		return [
			'$$type' => 'boolean',
			'value' => $value,
		];
	}

	private function child_types( array $elements ): array {
		return array_map( fn( $element ) => $element['elType'], $elements );
	}

	public function test_apply__adds_the_child_when_the_condition_is_met() {
		// Arrange.
		$elements = [ $this->make_parent( [ 'show_child' => $this->boolean( true ) ] ) ];

		// Act.
		$result = Reconcile_Component_Instance_Elements::apply( $elements );

		// Assert.
		$this->assertSame(
			[ Reconcile_Test_Child::get_element_type() ],
			$this->child_types( $result[0]['elements'] )
		);
	}

	public function test_apply__adds_the_child_when_the_setting_falls_back_to_its_default() {
		// Arrange: `show_child` defaults to true, mirroring `show_controls` on the background video.
		$elements = [ $this->make_parent() ];

		// Act.
		$result = Reconcile_Component_Instance_Elements::apply( $elements );

		// Assert.
		$this->assertCount( 1, $result[0]['elements'] );
	}

	public function test_apply__removes_the_child_when_the_condition_fails() {
		// Arrange.
		$elements = [
			$this->make_parent(
				[ 'show_child' => $this->boolean( false ) ],
				[
					[
						'id' => 'child1',
						'elType' => Reconcile_Test_Child::get_element_type(),
						'settings' => [],
						'elements' => [],
					],
				]
			),
		];

		// Act.
		$result = Reconcile_Component_Instance_Elements::apply( $elements );

		// Assert.
		$this->assertSame( [], $result[0]['elements'] );
	}

	public function test_apply__keeps_an_existing_child_untouched_when_the_condition_is_met() {
		// Arrange.
		$existing = [
			'id' => 'child1',
			'elType' => Reconcile_Test_Child::get_element_type(),
			'settings' => [],
			'elements' => [],
		];
		$elements = [ $this->make_parent( [ 'show_child' => $this->boolean( true ) ], [ $existing ] ) ];

		// Act.
		$result = Reconcile_Component_Instance_Elements::apply( $elements );

		// Assert.
		$this->assertCount( 1, $result[0]['elements'] );
		$this->assertSame( 'child1', $result[0]['elements'][0]['id'] );
	}

	public function test_apply__leaves_elements_without_dependencies_untouched() {
		// Arrange.
		$elements = [
			[
				'id' => 'leaf1',
				'elType' => Reconcile_Test_Leaf::get_element_type(),
				'settings' => [],
				'elements' => [],
			],
		];

		// Act.
		$result = Reconcile_Component_Instance_Elements::apply( $elements );

		// Assert.
		$this->assertSame( $elements, $result );
	}

	public function test_apply__leaves_unknown_element_types_untouched() {
		// Arrange.
		$elements = [
			[
				'id' => 'unknown1',
				'elType' => 'e-not-registered',
				'settings' => [],
				'elements' => [],
			],
		];

		// Act.
		$result = Reconcile_Component_Instance_Elements::apply( $elements );

		// Assert.
		$this->assertSame( $elements, $result );
	}

	public function test_apply__reconciles_nested_elements() {
		// Arrange: the parent that owns the rule is nested inside another element.
		$elements = [
			[
				'id' => 'outer1',
				'elType' => Reconcile_Test_Child::get_element_type(),
				'settings' => [],
				'elements' => [ $this->make_parent( [ 'show_child' => $this->boolean( true ) ] ) ],
			],
		];

		// Act.
		$result = Reconcile_Component_Instance_Elements::apply( $elements );

		// Assert.
		$nested_parent = $result[0]['elements'][0];
		$this->assertSame(
			[ Reconcile_Test_Child::get_element_type() ],
			$this->child_types( $nested_parent['elements'] )
		);
	}

	public function test_apply__derives_ids_for_the_whole_inserted_subtree() {
		// Arrange.
		$elements = [ $this->make_parent( [ 'show_child' => $this->boolean( true ) ] ) ];

		// Act.
		$inserted = Reconcile_Component_Instance_Elements::apply( $elements )[0]['elements'][0];

		// Assert.
		$expected_id = Format_Element_Ids::hash_string(
			'parent1_' . Reconcile_Test_Child::get_element_type(),
			7
		);

		$this->assertSame( $expected_id, $inserted['id'] );
		$this->assertCount( 2, $inserted['elements'] );
		$this->assertSame( Format_Element_Ids::hash_string( $expected_id . '_0', 7 ), $inserted['elements'][0]['id'] );
		$this->assertSame( Format_Element_Ids::hash_string( $expected_id . '_1', 7 ), $inserted['elements'][1]['id'] );
	}

	public function test_apply__derives_stable_ids_across_runs() {
		// Arrange.
		$elements = [ $this->make_parent( [ 'show_child' => $this->boolean( true ) ] ) ];

		// Act.
		$first = Reconcile_Component_Instance_Elements::apply( $elements );
		$second = Reconcile_Component_Instance_Elements::apply( $elements );

		// Assert.
		$this->assertSame( $first, $second );
	}

	public function test_apply__derives_distinct_ids_for_siblings_of_the_inserted_subtree() {
		// Arrange.
		$elements = [ $this->make_parent( [ 'show_child' => $this->boolean( true ) ] ) ];

		// Act.
		$inserted = Reconcile_Component_Instance_Elements::apply( $elements )[0]['elements'][0];

		// Assert: both leaves come from the same `default_model` entry, so only the index
		// keeps them apart. Without it they would collide once ids get hashed.
		$this->assertNotSame( $inserted['elements'][0]['id'], $inserted['elements'][1]['id'] );
	}

	public function test_apply__derives_distinct_ids_for_different_parents() {
		// Arrange.
		$first_parent = $this->make_parent( [ 'show_child' => $this->boolean( true ) ] );
		$second_parent = array_merge( $first_parent, [ 'id' => 'parent2' ] );

		// Act.
		$result = Reconcile_Component_Instance_Elements::apply( [ $first_parent, $second_parent ] );

		// Assert.
		$this->assertNotSame( $result[0]['elements'][0]['id'], $result[1]['elements'][0]['id'] );
	}

	public function test_apply__preserves_the_default_model_payload() {
		// Arrange.
		$elements = [ $this->make_parent( [ 'show_child' => $this->boolean( true ) ] ) ];

		// Act.
		$inserted = Reconcile_Component_Instance_Elements::apply( $elements )[0]['elements'][0];

		// Assert.
		$this->assertTrue( $inserted['isLocked'] );
		$this->assertSame( Reconcile_Test_Child::get_element_type(), $inserted['elType'] );
	}
}
