<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropDependencies;

use Elementor\Tests\Phpunit\Elementor\Modules\AtomicWidgets\Utils\Mock_Prop_Type;
use Elementor\Tests\Phpunit\Elementor\Modules\AtomicWidgets\Utils\Mock_Object_Prop_Type;
use Elementor\Tests\Phpunit\Elementor\Modules\AtomicWidgets\Utils\Mock_Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropDependencies\Manager;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Dependencies_Manager extends Elementor_Test_Base {

	public function test_get_no_dependencies() {
		$manager = Manager::make();

		$this->assertSame( null, $manager->get() );
	}

	public function test_get_single_valid_dependency() {
		$manager = Manager::make()
			->where( [
				'operator' => 'eq',
				'path' => [ 'a' ],
				'value' => 1,
			] );

		$this->assertCount( 1, $manager->get()['terms'] );
	}

	public function test_get_multiple_valid_dependencies() {
		$manager = Manager::make( Manager::RELATION_AND )
			->where( [
				'operator' => 'eq',
				'path' => [ 'a' ],
				'value' => 1,
			] )
			->where( [
				'operator' => 'ne',
				'path' => [ 'b' ],
				'value' => 2,
			] );

		$this->assertCount( 2, $manager->get()['terms'] );
	}

	public function test_get_throws_on_direct_cycle() {
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Circular prop dependencies detected' );

		Manager::get_source_to_dependents( [
			'a' => Mock_Prop_Type::make()->set_dependencies(
				Manager::make()->where( [ 'operator' => 'eq', 'path' => [ 'b' ] ] )->get()
			),
			'b' => Mock_Prop_Type::make()->set_dependencies(
				Manager::make()->where( [ 'operator' => 'eq', 'path' => [ 'a' ] ] )->get()
			),
		] );
	}

	public function test_get_throws_on_indirect_cycle() {
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Circular prop dependencies detected' );

		Manager::get_source_to_dependents( [
			'a' => Mock_Prop_Type::make()->set_dependencies(
				Manager::make()->where( [ 'operator' => 'eq', 'path' => [ 'b' ] ] )->get()
			),
			'b' => Mock_Prop_Type::make()->set_dependencies(
				Manager::make()->where( [ 'operator' => 'eq', 'path' => [ 'c' ] ] )->get()
			),
			'c' => Mock_Prop_Type::make()->set_dependencies(
				Manager::make()->where( [ 'operator' => 'eq', 'path' => [ 'a' ] ] )->get()
			),
		] );
	}

	public function test_get_throws_on_self_reference() {
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Circular prop dependencies detected' );

		Manager::get_source_to_dependents( [
			'a' => Mock_Prop_Type::make()->set_dependencies(
				Manager::make()->where( [ 'operator' => 'eq', 'path' => [ 'a' ] ] )->get()
			),
		] );
	}

	public function test_get_multiple_independent_groups() {
		$manager = Manager::make( Manager::RELATION_AND )
			->where( [
				'operator' => 'eq',
				'path' => [ 'a' ],
				'value' => 1,
			] )
			->where( [
				'operator' => 'eq',
				'path' => [ 'b' ],
				'value' => 2,
			] );

		$this->assertCount( 2, $manager->get()['terms'] );
	}

	public function test_get_valid_complex_nested_dependencies() {
		$manager = Manager::make( Manager::RELATION_AND )
			->where( [
				'operator' => 'eq',
				'path' => [ 'a', 'b', 'c' ],
				'value' => 1,
			] )
			->where( [
				'operator' => 'ne',
				'path' => [ 'd', 'e' ],
				'value' => 2,
			] );

		$this->assertCount( 2, $manager->get()['terms'] );
	}

	public function test_get_throws_on_cycle_within_nested_paths() {
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Circular prop dependencies detected' );

		Manager::get_source_to_dependents( [
			'a.b' => Mock_Prop_Type::make()->set_dependencies(
				Manager::make()->where( [ 'operator' => 'eq', 'path' => [ 'b', 'a' ] ] )->get()
			),
			'b.a' => Mock_Prop_Type::make()->set_dependencies(
				Manager::make()->where( [ 'operator' => 'eq', 'path' => [ 'a', 'b' ] ] )->get()
			),
		] );
	}

	public function test_get_source_to_dependents_builds_correct_graph() {
		$schema = [
			'a' => Mock_Prop_Type::make()->set_dependencies(
				Manager::make()->where( [ 'operator' => 'eq', 'path' => [ 'b' ] ] )->get()
			),
			'b' => new Mock_Prop_Type(),
			'c' => Mock_Prop_Type::make()->set_dependencies(
				Manager::make()->where( [ 'operator' => 'eq', 'path' => [ 'b' ] ] )->get()
			),
		];

		$expected_graph = [
			'b' => [ 'a', 'c' ],
		];

		$this->assertEquals( $expected_graph, Manager::get_source_to_dependents( $schema ) );
	}

	public function test_get_source_to_dependents_with_nested_dependency_term() {
		$nested_dependency = Manager::make()
			->where( [ 'operator' => 'eq', 'path' => [ 'c' ] ] )
			->get();

		$schema = [
			'a' => Mock_Prop_Type::make()->set_dependencies(
				[
					'relation' => Manager::RELATION_OR,
					'terms' => [
						[ 'operator' => 'eq', 'path' => [ 'b' ] ],
						$nested_dependency,
					],
				]
			),
			'b' => new Mock_Prop_Type(),
			'c' => new Mock_Prop_Type(),
		];

		$expected_graph = [
			'b' => [ 'a' ],
			'c' => [ 'a' ],
		];

		$this->assertEquals( $expected_graph, Manager::get_source_to_dependents( $schema ) );
	}

	public function test_get_source_to_dependents_with_array() {
		$schema = [
			'list' => Mock_Array_Prop_Type::make(
				Mock_Prop_Type::make()->set_dependencies(
					Manager::make()->where( [ 'operator' => 'eq', 'path' => [ 'a' ] ] )->get()
				)
			),
			'a' => new Mock_Prop_Type(),
		];

		$expected_graph = [
			'a' => [ 'list' ],
		];

		$this->assertEquals( $expected_graph, Manager::get_source_to_dependents( $schema ) );
	}

	public function test_get_source_to_dependents_with_nested_object() {
		$schema = [
			'form' => new Mock_Object_Prop_Type( [
				'header' => Mock_Prop_Type::make()->set_dependencies(
					Manager::make()->where( [ 'operator' => 'eq', 'path' => [ 'form', 'footer' ] ] )->get()
				),
				'footer' => new Mock_Prop_Type(),
			] ),
		];

		$expected_graph = [
			'form.footer' => [ 'form.header' ],
		];

		$this->assertEquals( $expected_graph, Manager::get_source_to_dependents( $schema ) );
	}

	public function test_where_throws_on_missing_config() {
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Term missing mandatory configurations' );

		Manager::make()->where( [ 'value' => 1 ] );
	}

	public function test_new_dependency_throws_on_invalid_relation() {
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Invalid relation: invalid_relation' );

		Manager::make( 'invalid_relation' );
	}
}
