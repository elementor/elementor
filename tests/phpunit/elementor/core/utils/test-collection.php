<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Utils;

use Elementor\Core\Utils\Collection;
use Elementor\Testing\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Collection extends Elementor_Test_Base {
	public function test_all() {
		// Arrange
		$collection = new Collection( $array = [ 'a' => 'a', 'b' => 'b' ] );

		// Act
		$result = $collection->all();

		// Assert
		$this->assertEqualSets( $array, $result );
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
		$result2 = $collection2->merge_recursive( $collection2 );

		// Assert
		$this->assertEqualSets( [ 'a' => [ '1', '2' ], 'b' => [ '3', '4', '5' ], 'c' => [ '6' ] ], $result->all() );
		$this->assertEqualSets( [ 'a' => [ '1', '2' ], 'b' => [ '3', '4', '5' ], 'c' => [ '6' ] ], $result->all() );
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

}
