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

		$this->assertSame( [], $manager->get() );
	}

	public function test_get_single_valid_dependency() {
		$manager = Manager::make()
			->where( [
				'operator' => 'equals',
				'path' => [ 'a' ],
				'value' => 1,
			] );

		$this->assertCount( 1, $manager->get() );
	}

	public function test_get_multiple_valid_dependencies() {
		$manager = Manager::make()
			->where( [
				'operator' => 'equals',
				'path' => [ 'a' ],
				'value' => 1,
			] )
			->new_dependency( [ 'relation' => Manager::RELATION_AND, 'effect' => Manager::EFFECT_HIDE ] )
			->where( [
				'operator' => 'not_equals',
				'path' => [ 'b' ],
				'value' => 2,
			] );

		$this->assertCount( 2, $manager->get() );
	}

	public function test_get_throws_on_direct_cycle() {
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Circular prop dependencies detected' );

		Manager::get_source_to_dependents( [
			'a' => new Mock_Prop_Type( [
				'dependencies' => Manager::make()->where( [ 'operator' => 'equals', 'path' => [ 'b' ] ] )->get(),
			] ),
			'b' => new Mock_Prop_Type( [
				'dependencies' => Manager::make()->where( [ 'operator' => 'equals', 'path' => [ 'a' ] ] )->get(),
			] ),
		] );
	}

	public function test_get_throws_on_indirect_cycle() {
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Circular prop dependencies detected' );

		Manager::get_source_to_dependents( [
			'a' => new Mock_Prop_Type( [
				'dependencies' => Manager::make()->where( [ 'operator' => 'equals', 'path' => [ 'b' ] ] )->get(),
			] ),
			'b' => new Mock_Prop_Type( [
				'dependencies' => Manager::make()->where( [ 'operator' => 'equals', 'path' => [ 'c' ] ] )->get(),
			] ),
			'c' => new Mock_Prop_Type( [
				'dependencies' => Manager::make()->where( [ 'operator' => 'equals', 'path' => [ 'a' ] ] )->get(),
			] ),
		] );
	}

	public function test_get_throws_on_self_reference() {
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Circular prop dependencies detected' );

		Manager::get_source_to_dependents( [
			'a' => new Mock_Prop_Type( [
				'dependencies' => Manager::make()->where( [ 'operator' => 'equals', 'path' => [ 'a' ] ] )->get(),
			] ),
		] );
	}

	public function test_get_multiple_independent_groups() {
		$manager = Manager::make()
			->where( [
				'operator' => 'equals',
				'path' => [ 'a' ],
				'value' => 1,
			] )
			->new_dependency( [ 'relation' => Manager::RELATION_AND, 'effect' => Manager::EFFECT_HIDE ] )
			->where( [
				'operator' => 'equals',
				'path' => [ 'b' ],
				'value' => 2,
			] );

		$this->assertCount( 2, $manager->get() );
	}

	public function test_get_valid_complex_nested_dependencies() {
		$manager = Manager::make()
			->where( [
				'operator' => 'equals',
				'path' => [ 'a', 'b', 'c' ],
				'value' => 1,
			] )
			->new_dependency( [ 'relation' => Manager::RELATION_AND, 'effect' => Manager::EFFECT_HIDE ] )
			->where( [
				'operator' => 'not_equals',
				'path' => [ 'd', 'e' ],
				'value' => 2,
			] );

		$this->assertCount( 2, $manager->get() );
	}

	public function test_get_throws_on_cycle_within_nested_paths() {
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Circular prop dependencies detected' );

		Manager::get_source_to_dependents( [
			'a.b' => new Mock_Prop_Type( [
				'dependencies' => Manager::make()->where( [ 'operator' => 'equals', 'path' => [ 'b', 'a' ] ] )->get(),
			] ),
			'b.a' => new Mock_Prop_Type( [
				'dependencies' => Manager::make()->where( [ 'operator' => 'equals', 'path' => [ 'a', 'b' ] ] )->get(),
			] ),
		] );
	}

	public function test_get_source_to_dependents_builds_correct_graph() {
		$schema = [
			'a' => new Mock_Prop_Type( [
				'dependencies' => Manager::make()->where( [ 'operator' => 'equals', 'path' => [ 'b' ] ] )->get(),
			] ),
			'b' => new Mock_Prop_Type(), // No dependencies
			'c' => new Mock_Prop_Type( [
				'dependencies' => Manager::make()->where( [ 'operator' => 'equals', 'path' => [ 'b' ] ] )->get(),
			] ),
		];

		$expected_graph = [
			'b' => [ 'a', 'c' ],
		];

		$this->assertEquals( $expected_graph, Manager::get_source_to_dependents( $schema ) );
	}

	public function test_get_source_to_dependents_with_nested_dependency_term() {
		$nested_dependency = Manager::make()
			->where( [ 'operator' => 'equals', 'path' => [ 'c' ] ] )
			->get();

		$schema = [
			'a' => new Mock_Prop_Type( [
				'dependencies' => [
					[
						'terms' => [
							[ 'operator' => 'equals', 'path' => [ 'b' ] ],
							$nested_dependency[0],
						],
					],
				],
			] ),
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
			'list' => new Mock_Array_Prop_Type(
				new Mock_Prop_Type( [
					'dependencies' => Manager::make()->where( [ 'operator' => 'equals', 'path' => [ 'a' ] ] )->get(),
				] )
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
				'header' => new Mock_Prop_Type( [
					'dependencies' => Manager::make()->where( [ 'operator' => 'equals', 'path' => [ 'form', 'footer' ] ] )->get(),
				] ),
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

	public function test_new_dependency_throws_on_duplicate_effect() {
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Dependency with effect of hide already exists' );

		Manager::make()
			->new_dependency( [ 'effect' => Manager::EFFECT_HIDE ] )
			->new_dependency( [ 'effect' => Manager::EFFECT_HIDE ] );
	}

	public function test_new_dependency_throws_on_invalid_relation() {
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Invalid relation: invalid_relation' );

		Manager::make()->new_dependency( [ 'relation' => 'invalid_relation' ] );
	}

	public function test_get_filters_out_empty_dependency_groups() {
		$manager = Manager::make()
			->new_dependency( [ 'effect' => Manager::EFFECT_HIDE ] )
			->where( [ 'operator' => 'equals', 'path' => [ 'a' ] ] );

		$this->assertCount( 1, $manager->get() );
	}
}
