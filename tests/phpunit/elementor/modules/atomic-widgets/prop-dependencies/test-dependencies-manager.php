<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropDependencies;

use Elementor\Modules\AtomicWidgets\PropDependencies\Manager;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Dependencies_Manager extends Elementor_Test_Base {

	public function test_get_no_dependencies() {
		$manager = Manager::make();

		$this->assertEmpty( $manager->get() );
	}

	public function test_get_single_valid_dependency() {
		$manager = Manager::make()
			->where( [
				'operator' => 'eq',
				'path' => [ 'a' ],
				'value' => 1,
			] );

		$result = $manager->get();

		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'relation', $result );
		$this->assertArrayHasKey( 'terms', $result );
		$this->assertCount( 1, $result['terms'] );
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

		$result = $manager->get();

		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'relation', $result );
		$this->assertArrayHasKey( 'terms', $result );
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

	public function test_get_filters_out_empty_dependency_groups() {
		$manager = Manager::make()
			->where( [ 'operator' => 'eq', 'path' => [ 'a' ] ] );

		$result = $manager->get();

		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'relation', $result );
		$this->assertArrayHasKey( 'terms', $result );
		$this->assertCount( 1, $result['terms'] );
	}
}
