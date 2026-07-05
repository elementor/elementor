<?php

namespace Elementor\Testing\Modules\AtomicWidgets\ChildrenDependencies;

use Elementor\Modules\AtomicWidgets\ChildrenDependencies\Child_Dependency;
use Elementor\Modules\AtomicWidgets\ChildrenDependencies\Child_Position;
use Elementor\Modules\AtomicWidgets\PropDependencies\Manager as Dependency_Manager;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Child_Dependency extends TestCase {

	public function test_build_returns_full_config() {
		// Arrange.
		$when = Dependency_Manager::make()->where( [
			'operator' => 'eq',
			'path' => [ 'pagination' ],
			'value' => true,
		] );

		// Act.
		$rule = Child_Dependency::for( 'e-pagination' )
			->when( $when )
			->position( Child_Position::after_type( 'e-collection-loop-layout' ) )
			->stash()
			->default_model( [ 'elType' => 'e-pagination', 'isLocked' => true ] )
			->build();

		// Assert.
		$this->assertSame( 'e-pagination', $rule['child_type'] );
		$this->assertSame( 'after_type', $rule['position']['kind'] );
		$this->assertSame( 'e-collection-loop-layout', $rule['position']['value'] );
		$this->assertTrue( $rule['stash'] );
		$this->assertSame( [ 'elType' => 'e-pagination', 'isLocked' => true ], $rule['default_model'] );
		$this->assertIsArray( $rule['when'] );
		$this->assertCount( 1, $rule['when']['terms'] );
		$this->assertSame( 'eq', $rule['when']['terms'][0]['operator'] );
		$this->assertSame( [ 'pagination' ], $rule['when']['terms'][0]['path'] );
		$this->assertTrue( $rule['when']['terms'][0]['value'] );
	}

	public function test_position_defaults_to_last() {
		// Arrange.
		$when = Dependency_Manager::make()->where( [
			'operator' => 'eq',
			'path' => [ 'flag' ],
			'value' => true,
		] );

		// Act.
		$rule = Child_Dependency::for( 'e-child' )->when( $when )->build();

		// Assert.
		$this->assertSame( 'last', $rule['position']['kind'] );
		$this->assertNull( $rule['position']['value'] );
	}

	public function test_stash_defaults_to_true_and_can_be_disabled() {
		// Arrange.
		$when = Dependency_Manager::make()->where( [
			'operator' => 'eq',
			'path' => [ 'flag' ],
			'value' => true,
		] );

		// Act.
		$default_rule = Child_Dependency::for( 'e-child' )->when( $when )->build();
		$no_stash_rule = Child_Dependency::for( 'e-child' )->when( $when )->stash( false )->build();

		// Assert.
		$this->assertTrue( $default_rule['stash'] );
		$this->assertFalse( $no_stash_rule['stash'] );
	}

	public function test_default_model_defaults_to_null() {
		// Arrange.
		$when = Dependency_Manager::make()->where( [
			'operator' => 'eq',
			'path' => [ 'flag' ],
			'value' => true,
		] );

		// Act.
		$rule = Child_Dependency::for( 'e-child' )->when( $when )->build();

		// Assert.
		$this->assertNull( $rule['default_model'] );
	}

	public function test_build_throws_when_when_is_missing() {
		$this->expectException( \InvalidArgumentException::class );
		$this->expectExceptionMessageMatches( '/`when` clause is required/' );

		Child_Dependency::for( 'e-child' )->build();
	}

	public function test_build_throws_when_when_has_no_terms() {
		$this->expectException( \InvalidArgumentException::class );
		$this->expectExceptionMessageMatches( '/must contain at least one term/' );

		Child_Dependency::for( 'e-child' )->when( Dependency_Manager::make() )->build();
	}

	/**
	 * @dataProvider position_constructors_provider
	 */
	public function test_position_constructors( callable $factory, string $expected_kind, $expected_value ) {
		// Act.
		$position = $factory();

		// Assert.
		$this->assertSame( $expected_kind, $position->to_array()['kind'] );
		$this->assertSame( $expected_value, $position->to_array()['value'] );
	}

	public function test_at_index_rejects_negative_index() {
		$this->expectException( \InvalidArgumentException::class );
		$this->expectExceptionMessageMatches( '/index must be >= 0/' );

		Child_Position::at_index( -1 );
	}

	public function test_after_type_rejects_empty_element_type() {
		$this->expectException( \InvalidArgumentException::class );
		$this->expectExceptionMessageMatches( '/element_type must be a non-empty string/' );

		Child_Position::after_type( '   ' );
	}

	public function test_before_type_rejects_empty_element_type() {
		$this->expectException( \InvalidArgumentException::class );
		$this->expectExceptionMessageMatches( '/element_type must be a non-empty string/' );

		Child_Position::before_type( '' );
	}

	public function position_constructors_provider(): array {
		return [
			'last' => [ fn() => Child_Position::last(), 'last', null ],
			'first' => [ fn() => Child_Position::first(), 'first', null ],
			'at_index' => [ fn() => Child_Position::at_index( 3 ), 'index', 3 ],
			'after_type' => [ fn() => Child_Position::after_type( 'e-layout' ), 'after_type', 'e-layout' ],
			'before_type' => [ fn() => Child_Position::before_type( 'e-layout' ), 'before_type', 'e-layout' ],
		];
	}
}
