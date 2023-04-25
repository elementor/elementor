<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Utils;

use Elementor\Core\Utils\Collection;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Collection extends Elementor_Test_Base {
	public function test_make() {
		// Act
		$collection = Collection::make( [ 1, 2, 3 ] );

		// Assert
		$this->assertEquals( [ 1, 2, 3 ], $collection->all() );
	}

	public function test_all() {
		// Arrange
		$collection = new Collection( $array = [ 'a' => 'a', 'b' => 'b' ] );

		// Act
		$result = $collection->all();

		// Assert
		$this->assertEqualSets( $array, $result );
	}

	public function test_values() {
		// Arrange
		$collection = new Collection( [ 'a' => 'a', 'b' => 'b' ] );

		// Act
		$result = $collection->all();

		// Assert
		$this->assertEqualSets( [ 'a', 'b' ], $result );
	}

	public function test_is_empty() {
		// Arrange
		$collection = new Collection( [] );
		$collection2 = new Collection( [ '1' ] );

		// Act
		$result = $collection->is_empty();
		$result2 = $collection2->is_empty();

		// Assert
		$this->assertTrue( $result );
		$this->assertFalse( $result2 );
	}

	public function test_keys() {
		// Arrange
		$collection = new Collection( $array = [ 'a' => '1', 'b' => '2' ] );

		// Act
		$result = $collection->keys();

		// Assert
		$this->assertEqualSets( [ 'a', 'b' ], $result );
	}

	public function test_except() {
		// Arrange
		$collection = new Collection( $array = [ 'a' => '1', 'b' => '2', 'c' => '3' ] );

		// Act
		$result = $collection->except( [ 'a', 'c' ] );

		// Assert
		$this->assertEqualSets( [ 'b' => '2' ], $result->all() );
	}

	public function only() {
		// Arrange
		$collection = new Collection( $array = [ 'a' => '1', 'b' => '2', 'c' => '3' ] );

		// Act
		$result = $collection->except( [ 'a', 'c' ] );

		// Assert
		$this->assertEqualSets( [ 'a' => '1', 'c' => '3' ], $result->all() );
	}

	public function test_map() {
		// Arrange
		$collection = new Collection( $array = [ 'a' => '1', 'b' => '2' ] );

		// Act
		$result = $collection->map( function ( $value, $key ) {
			return $value . $key;
		} );

		// Assert
		$this->assertEqualSets( [ 'a' => '1a', 'b' => '2b' ], $result->all() );
	}

	public function test_map_with_keys() {
		// Arrange
		$collection = new Collection( $array = [ 'a' => '1', 'b' => '2' ] );

		// Act
		$result = $collection->map_with_keys( function ( $value, $key ) {
			return [
				$value => $key,
				$key . $key => $value . $value
			];
		} );

		// Assert
		$this->assertEqualSets( [ '1' => 'a', 'aa' => '11', '2' => 'b', 'bb' => '22' ], $result->all() );
	}

	public function test_merge() {
		// Arrange
		$collection = new Collection( [ 'a' => '1', 'b' => '2' ] );
		$collection2 = new Collection( [ 'c' => '3' ] );

		// Act
		$result = $collection->merge( [ 'c' => '3' ] );
		$result2 = $collection->merge( $collection2 );

		// Assert
		$this->assertEqualSets( [ 'a' => '1', 'b' => '2', 'c' => '3' ], $result->all() );
		$this->assertEqualSets( [ 'a' => '1', 'b' => '2', 'c' => '3' ], $result2->all() );
	}

	public function test_merge_recursive() {
		// Arrange
		$collection = new Collection( [ 'a' => [ '1', '2' ], 'b' => [ '3' ] ] );
		$collection2 = new Collection( [ 'b' => [ '4', '5' ], 'c' => [ '6' ] ] );

		// Act
		$result = $collection->merge_recursive( $collection2->all() );

		// Assert
		$this->assertEqualSets( [ 'a' => [ '1', '2' ], 'b' => [ '3', '4', '5' ], 'c' => [ '6' ] ], $result->all() );
	}

	public function test_replace_recursive() {
		// Arrange
		$collection = new Collection( [ 'a' => [ '1', '2' ], 'b' => [ '3' ] ] );
		$collection2 = new Collection( [ 'b' => [ '4', '5' ], 'c' => [ '6' ] ] );

		// Act
		$result = $collection->replace_recursive( $collection2->all() );

		// Assert
		$this->assertEqualSets( [ 'a' => [ '1', '2' ], 'b' => [ '4', '5' ], 'c' => [ '6' ] ], $result->all() );
	}

	public function test_implode() {
		// Arrange
		$collection = new Collection( [ '1', '2', '3' ] );

		// Act
		$result = $collection->implode(',');

		// Assert
		$this->assertEquals( '1,2,3', $result );
	}

	public function test_filter() {
		// Arrange
		$collection = new Collection( [ 'a' => '1', 'b' => '2', '', null ] );
		$collection2 = new Collection( [ 'a' => '1', 'b' => '2', 'c' => '3' ] );

		// Act
		$result = $collection->filter();
		$result2 = $collection2->filter( function ( $value, $key ) {
			return $value !== '3' && $key !== 'a';
		} );

		// Assert
		$this->assertEqualSets( [ 'a' => '1', 'b' => '2' ], $result->all() );
		$this->assertEqualSets( [ 'b' => '2' ], $result2->all() );
	}

	public function test_pluck() {
		// Arrange
		$collection = new Collection( [
			[ 'a' => 1, 'b' => 2 ],
			[ 'a' => 3, 'b' => 4 ]
		] );
		$collection2 = new Collection( [
			(object) [ 'a' => 1, 'b' => 2 ],
			(object) [ 'a' => 3, 'b' => 4 ],
		] );

		// Act
		$result = $collection->pluck('a');
		$result2 = $collection2->pluck('b');

		// Assert
		$this->assertEqualSets( [ 1, 3 ], $result->all() );
		$this->assertEqualSets( [ 2, 4 ], $result2->all() );
	}

	public function test_group_by() {
		// Arrange
		$collection = new Collection( [
			[ 'a' => 1, 'b' => 2 ],
			[ 'a' => 1, 'b' => 3 ],
			[ 'a' => 3, 'b' => 2 ],
		] );
		$collection2 = new Collection( [
			(object) [ 'a' => 1, 'b' => 2 ],
			(object) [ 'a' => 1, 'b' => 3 ],
			(object) [ 'a' => 3, 'b' => 2 ],
		] );

		// Assert
		$result = $collection->group_by( 'a' );
		$result2 = $collection2->group_by( 'b' );

		// Assert
		$this->assertEqualSets( [
			1 => [
				[ 'a' => 1, 'b' => 2 ],
				[ 'a' => 1, 'b' => 3 ]
			],
			3 => [
				[ 'a' => 3, 'b' => 2 ]
			]
		], $result->all() );

		$this->assertEqualSets( [
			2 => [
				(object) [ 'a' => 1, 'b' => 2 ],
				(object) [ 'a' => 3, 'b' => 2 ],
			],
			3 => [
				(object) [ 'a' => 1, 'b' => 3 ],
			]
		], $result2->all() );
	}

	public function test_flatten() {
		// Arrange
		$collection = new Collection( [
			'a' => 1,
			'b' => '2',
			'c' => true,
			'd' => (object) [ 'e' => 3 ],
		] );

		// Act
		$result = $collection->flatten();

		// Assert
		$this->assertEqualSets(
			[ 1, '2', true, (object) [ 'e' => 3 ] ],
			$result->all()
		);
	}

	public function test_flatten__with_objects() {
		// Arrange
		$collection = new Collection( [
			'a' => [
				(object) [ 'name' => '1' ],
				(object) [ 'name' => '2' ],
			],
			'b' => [
				(object) [ 'name' => '3' ],
				(object) [ 'name' => '4' ],
			]
		] );

		// Act
		$result = $collection->flatten();

		// Assert
		$this->assertEqualSets( [
			(object) [ 'name' => '1' ],
			(object) [ 'name' => '2' ],
			(object) [ 'name' => '3' ],
			(object) [ 'name' => '4' ],
		], $result->all() );
	}

	public function test_push() {
		// Arrange
		$collection = new Collection( [ '1', '2', '3' ] );

		// Act
		$collection->push( '4', '5', '6' );

		// Assert
		$this->assertEqualSets( [
			'1', '2', '3', '4', '5', '6'
		], $collection->all() );
	}

	public function test_get() {
		// Arrange
		$collection = new Collection( ['a' => 1, 'b' => 2] );

		// Act
		$result = $collection->get( 'a' );
		$result2 = $collection->get( 'c' );
		$result3 = $collection->get( 'c', 1 );

		// Assert
		$this->assertEquals( 1, $result );
		$this->assertEquals( null, $result2 );
		$this->assertEquals( 1, $result3 );
	}

	public function test_unique() {
		// Arrange
		$collection = new Collection( ['a', 'a', 'b', 'c', 'c'] );

		// Act
		$result = $collection->unique();

		// Assert
		$this->assertEqualSets( [ 'a', 'b', 'c' ], $result->all() );
	}

	public function test_unique__with_key_array() {
		// Arrange
		$collection = new Collection( [
			[ 'text' => 'a', 'id' => 1 ],
			[ 'text' => 'b', 'id' => 2 ],
			[ 'text' => 'b', 'id' => 3 ],
			[ 'id' => 4 ],
			[ 'text' => 'c', 'id' => 5 ],
		] );

		// Act
		$result = $collection->unique( 'text' );

		// Assert
		$this->assertEqualSets( [
			[ 'text' => 'a', 'id' => 1 ],
			[ 'text' => 'b', 'id' => 2 ],
			[ 'id' => 4 ],
			[ 'text' => 'c', 'id' => 5 ],
		], $result->all() );
	}

	public function test_unique__with_key_object() {
		// Arrange
		$collection = new Collection( [
			(object) [ 'text' => 'a', 'id' => 1 ],
			(object) [ 'text' => 'b', 'id' => 2 ],
			(object) [ 'text' => 'b', 'id' => 3 ],
			(object) [ 'id' => 4 ],
			(object) [ 'text' => 'c', 'id' => 5 ],
		] );

		// Act
		$result = $collection->unique( 'text' );

		// Assert
		$this->assertEqualSets( [
			(object) [ 'text' => 'a', 'id' => 1 ],
			(object) [ 'text' => 'b', 'id' => 2 ],
			(object) [ 'id' => 4 ],
			(object) [ 'text' => 'c', 'id' => 5 ],
		], $result->all() );
	}

	public function test_unique__with_multiple_keys() {
		// Arrange
		$collection = new Collection( [
			[ 'text' => 'a', 'id' => 1 ],
			[ 'text' => 'b', 'id' => 2 ],
			[ 'text' => 'b', 'id' => 3 ],
			[ 'text' => 'b', 'id' => 3 ],
			[ 'id' => 4 ],
			[ 'text' => 'c', 'id' => 5 ],
		] );

		// Act
		$result = $collection->unique( [ 'text', 'id' ] );

		// Assert
		$this->assertEqualSets( [
			[ 'text' => 'a', 'id' => 1 ],
			[ 'text' => 'b', 'id' => 2 ],
			[ 'text' => 'b', 'id' => 3 ],
			[ 'id' => 4 ],
			[ 'text' => 'c', 'id' => 5 ],
		], $result->all() );
	}

	public function test_first() {
		// Arrange
		$collection = new Collection( [ 20 => 'c', 21 => 'a', 30 => 'b' ] );
		$collection2 = new Collection( [] );

		// Act
		$result = $collection->first();
		$result2 = $collection2->first();
		$result3 = $collection2->first( 'a' );

		// Assert
		$this->assertEquals( 'c', $result );
		$this->assertEquals( null, $result2 );
		$this->assertEquals( 'a', $result3 );
	}

	public function test_sort_keys() {
		// Arrange
		$collection = new Collection( [ 'b' => 1, 'c' => 1, 'a' => 1 ] );

		// Act
		$result_asc = $collection->sort_keys()->all();
		$result_desc = $collection->sort_keys( true )->all();

		// Assert
		$this->assertEqualSets( [ 'a' => 1, 'b' => 1, 'c' => 1 ], $result_asc );
		$this->assertEqualSets( [ 'c' => 1, 'b' => 1, 'a' => 1 ], $result_desc );
	}

	public function test_each() {
		// Arrange
		$collection = new Collection( [ 'a' => 1, 'b' => 2, 'c' => 3 ] );

		$mock = $this->getMockBuilder( \stdClass::class )
			->setMethods( [ 'each_callback' ] )
			->getMock();

		// Expect
		$mock->expects( $this->exactly( 3 ) )
			->method( 'each_callback' )
			->withConsecutive(
				[ 1, 'a' ],
				[ 2, 'b' ],
				[ 3, 'c' ]
			);

		// Act
		$collection->each( [ $mock, 'each_callback' ] );
	}

	public function test_each__breaks_on_false() {
		// Arrange
		$collection = new Collection( [ 'a' => 1, 'b' => 2, 'c' => 3 ] );

		$mock = $this->getMockBuilder( \stdClass::class )
			->setMethods( [ 'each_callback' ] )
			->getMock();

		// Expect
		$mock->expects( $this->exactly( 1 ) )
			->method( 'each_callback' )
			->willReturn( false );

		// Act
		$collection->each( [ $mock, 'each_callback' ] );
	}
}
