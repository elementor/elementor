<?php

use Elementor\Modules\DataFlow\Snippet_References;
use PHPUnit\Framework\TestCase;

/**
 * @group Elementor\Modules
 * @group Elementor\Modules\DataFlow
 */
class Test_Snippet_References extends TestCase {

	public function test_sanitize__keeps_only_valid_references() {
		// Arrange
		$references = [
			[ 'snippet' => 'counter', 'event' => 'click', 'extra' => 'dropped' ],
			[ 'snippet' => 'Bad Name', 'event' => 'click' ],
			[ 'snippet' => 'counter', 'event' => 'scroll' ],
			[ 'snippet' => 'counter' ],
			'not-an-array',
		];

		// Act
		$result = Snippet_References::sanitize( $references );

		// Assert
		$this->assertSame( [ [ 'snippet' => 'counter', 'event' => 'click' ] ], $result );
	}

	public function test_sanitize__limits_references_per_element() {
		// Arrange
		$references = array_fill( 0, Snippet_References::MAX_PER_ELEMENT + 3, [ 'snippet' => 'a', 'event' => 'click' ] );

		// Act
		$result = Snippet_References::sanitize( $references );

		// Assert
		$this->assertCount( Snippet_References::MAX_PER_ELEMENT, $result );
	}

	public function test_collect__walks_nested_elements() {
		// Arrange
		$elements = [ [
			'id' => 'parent',
			'snippets' => [ [ 'snippet' => 'a', 'event' => 'init' ] ],
			'elements' => [ [ 'id' => 'child', 'snippets' => [ [ 'snippet' => 'b', 'event' => 'click' ] ] ] ],
		] ];

		// Act
		$result = Snippet_References::collect( $elements );

		// Assert
		$this->assertSame( [ 'parent', 'child' ], array_column( $result, 'elementId' ) );
	}

	public function test_strip__removes_references_recursively() {
		// Arrange
		$elements = [ [
			'id' => 'parent',
			'snippets' => [ [ 'snippet' => 'a', 'event' => 'init' ] ],
			'elements' => [ [ 'id' => 'child', 'snippets' => [ [ 'snippet' => 'b', 'event' => 'click' ] ] ] ],
		] ];

		// Act
		$result = Snippet_References::strip( $elements );

		// Assert
		$this->assertArrayNotHasKey( 'snippets', $result[0] );
		$this->assertArrayNotHasKey( 'snippets', $result[0]['elements'][0] );
	}
}
