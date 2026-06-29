<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypeMigrations;

use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Migration_Interpreter;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group prop-type-migrations
 */
class Test_Wildcard_Correlation extends Elementor_Test_Base {

	public function test_wildcards_in_operation_and_condition_correlate_correctly() {
		// Arrange
		$data = [
			'settings' => [
				'link1' => [ '$$type' => 'link', 'value' => [ 'url' => 'a.com' ] ],
				'link2' => [ '$$type' => 'link', 'value' => [ 'url' => 'b.com' ] ],
				'text1' => [ '$$type' => 'string', 'value' => 'Hello' ],
			],
		];

		$migration = [
			'up' => [
				[
					'op' => [ 'fn' => 'set', 'path' => 'settings.*.modified', 'value' => true ],
					'condition' => [ 'fn' => 'equals', 'path' => 'settings.*.$$type', 'value' => 'link' ],
				],
			],
		];

		// Act
		$result = Migration_Interpreter::run( $migration, $data );

		// Assert
		$this->assertTrue( $result['settings']['link1']['modified'] );
		$this->assertTrue( $result['settings']['link2']['modified'] );
		$this->assertArrayNotHasKey( 'modified', $result['settings']['text1'] );
	}

	public function test_multiple_nested_wildcards_correlate() {
		// Arrange
		$data = [
			'styles' => [
				'style1' => [
					'variants' => [
						[ 'props' => [ 'width' => [ '$$type' => 'size', 'value' => 100 ] ] ],
						[ 'props' => [ 'height' => [ '$$type' => 'size', 'value' => 200 ] ] ],
					],
				],
				'style2' => [
					'variants' => [
						[ 'props' => [ 'padding' => [ '$$type' => 'size', 'value' => 20 ] ] ],
					],
				],
			],
		];

		$migration = [
			'up' => [
				[
					'op' => [ 'fn' => 'set', 'path' => 'styles.*.variants[*].props.*.unit', 'value' => 'px' ],
					'condition' => [ 'fn' => 'equals', 'path' => 'styles.*.variants[*].props.*.$$type', 'value' => 'size' ],
				],
			],
		];

		// Act
		$result = Migration_Interpreter::run( $migration, $data );

		// Assert
		$this->assertSame( 'px', $result['styles']['style1']['variants'][0]['props']['width']['unit'] );
		$this->assertSame( 'px', $result['styles']['style1']['variants'][1]['props']['height']['unit'] );
		$this->assertSame( 'px', $result['styles']['style2']['variants'][0]['props']['padding']['unit'] );
	}

	public function test_wildcard_correlation_with_compound_conditions() {
		// Arrange
		$data = [
			'settings' => [
				'prop1' => [ '$$type' => 'size', 'value' => 100 ],
				'prop2' => [ '$$type' => 'size', 'value' => [ 'size' => 200, 'unit' => 'px' ] ],
				'prop3' => [ '$$type' => 'color', 'value' => 'red' ],
			],
		];

		$migration = [
			'up' => [
				[
					'op' => [
						'fn' => 'set',
						'path' => 'settings.*.value',
						'value' => [ 'size' => '$$current', 'unit' => 'px' ],
					],
					'condition' => [
						'fn' => 'and',
						'conditions' => [
							[ 'fn' => 'equals', 'path' => 'settings.*.$$type', 'value' => 'size' ],
							[ 'fn' => 'is_primitive', 'path' => 'settings.*.value' ],
						],
					],
				],
			],
		];

		// Act
		$result = Migration_Interpreter::run( $migration, $data );

		// Assert
		$this->assertSame( [ 'size' => 100, 'unit' => 'px' ], $result['settings']['prop1']['value'] );
		$this->assertSame( [ 'size' => 200, 'unit' => 'px' ], $result['settings']['prop2']['value'] );
		$this->assertSame( 'red', $result['settings']['prop3']['value'] );
	}

	public function test_wildcard_correlation_with_or_condition() {
		// Arrange
		$data = [
			'settings' => [
				'prop1' => [ '$$type' => 'string', 'value' => 'text' ],
				'prop2' => [ '$$type' => 'html', 'value' => '<p>html</p>' ],
				'prop3' => [ '$$type' => 'number', 'value' => 123 ],
			],
		];

		$migration = [
			'up' => [
				[
					'op' => [ 'fn' => 'set', 'path' => 'settings.*.isText', 'value' => true ],
					'condition' => [
						'fn' => 'or',
						'conditions' => [
							[ 'fn' => 'equals', 'path' => 'settings.*.$$type', 'value' => 'string' ],
							[ 'fn' => 'equals', 'path' => 'settings.*.$$type', 'value' => 'html' ],
						],
					],
				],
			],
		];

		// Act
		$result = Migration_Interpreter::run( $migration, $data );

		// Assert
		$this->assertTrue( $result['settings']['prop1']['isText'] );
		$this->assertTrue( $result['settings']['prop2']['isText'] );
		$this->assertArrayNotHasKey( 'isText', $result['settings']['prop3'] );
	}

	public function test_array_wildcard_correlation() {
		// Arrange
		$data = [
			'items' => [
				[ 'id' => '1', 'type' => 'widget', 'active' => false ],
				[ 'id' => '2', 'type' => 'section', 'active' => false ],
				[ 'id' => '3', 'type' => 'widget', 'active' => false ],
			],
		];

		$migration = [
			'up' => [
				[
					'op' => [ 'fn' => 'set', 'path' => 'items[*].active', 'value' => true ],
					'condition' => [ 'fn' => 'equals', 'path' => 'items[*].type', 'value' => 'widget' ],
				],
			],
		];

		// Act
		$result = Migration_Interpreter::run( $migration, $data );

		// Assert
		$this->assertTrue( $result['items'][0]['active'] );
		$this->assertFalse( $result['items'][1]['active'] );
		$this->assertTrue( $result['items'][2]['active'] );
	}

	public function test_mixed_object_and_array_wildcards() {
		// Arrange
		$data = [
			'groups' => [
				'group1' => [
					'items' => [
						[ 'value' => 10, 'type' => 'size' ],
						[ 'value' => 'red', 'type' => 'color' ],
					],
				],
				'group2' => [
					'items' => [
						[ 'value' => 20, 'type' => 'size' ],
					],
				],
			],
		];

		$migration = [
			'up' => [
				[
					'op' => [ 'fn' => 'set', 'path' => 'groups.*.items[*].unit', 'value' => 'px' ],
					'condition' => [ 'fn' => 'equals', 'path' => 'groups.*.items[*].type', 'value' => 'size' ],
				],
			],
		];

		// Act
		$result = Migration_Interpreter::run( $migration, $data );

		// Assert
		$this->assertSame( 'px', $result['groups']['group1']['items'][0]['unit'] );
		$this->assertArrayNotHasKey( 'unit', $result['groups']['group1']['items'][1] );
		$this->assertSame( 'px', $result['groups']['group2']['items'][0]['unit'] );
	}

	public function test_condition_on_different_depth_than_operation() {
		// Arrange
		$data = [
			'elements' => [
				'elem1' => [
					'type' => 'link',
					'value' => [ 'url' => 'a.com', 'label' => 'Link A' ],
				],
				'elem2' => [
					'type' => 'button',
					'value' => [ 'url' => 'b.com', 'label' => 'Button B' ],
				],
			],
		];

		$migration = [
			'up' => [
				[
					'op' => [ 'fn' => 'set', 'path' => 'elements.*.value.tag', 'value' => 'a' ],
					'condition' => [ 'fn' => 'equals', 'path' => 'elements.*.type', 'value' => 'link' ],
				],
			],
		];

		// Act
		$result = Migration_Interpreter::run( $migration, $data );

		// Assert
		$this->assertSame( 'a', $result['elements']['elem1']['value']['tag'] );
		$this->assertArrayNotHasKey( 'tag', $result['elements']['elem2']['value'] );
	}

	public function test_wildcard_with_in_condition() {
		// Arrange
		$data = [
			'settings' => [
				'tag1' => [ '$$type' => 'string', 'value' => 'h1' ],
				'tag2' => [ '$$type' => 'string', 'value' => 'h2' ],
				'tag3' => [ '$$type' => 'string', 'value' => 'h6' ],
				'tag4' => [ '$$type' => 'string', 'value' => 'p' ],
			],
		];

		$migration = [
			'up' => [
				[
					'op' => [ 'fn' => 'set', 'path' => 'settings.*.isHeading', 'value' => true ],
					'condition' => [
						'fn' => 'in',
						'path' => 'settings.*.value',
						'value' => [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ],
					],
				],
			],
		];

		// Act
		$result = Migration_Interpreter::run( $migration, $data );

		// Assert
		$this->assertTrue( $result['settings']['tag1']['isHeading'] );
		$this->assertTrue( $result['settings']['tag2']['isHeading'] );
		$this->assertTrue( $result['settings']['tag3']['isHeading'] );
		$this->assertArrayNotHasKey( 'isHeading', $result['settings']['tag4'] );
	}

	public function test_wildcard_correlation_preserves_unmatched_items() {
		// Arrange
		$data = [
			'settings' => [
				'link' => [ '$$type' => 'link', 'value' => [ 'url' => 'test.com', 'extra' => 'data' ] ],
				'text' => [ '$$type' => 'string', 'value' => ['content' => 'Hello'], 'extra' => 'data' ],
			],
		];

		$migration = [
			'up' => [
				[
					'op' => [ 'fn' => 'set', 'path' => 'settings.*.value.tag', 'value' => 'a' ],
					'condition' => [ 'fn' => 'equals', 'path' => 'settings.*.$$type', 'value' => 'link' ],
				],
			],
		];

		// Act
		$result = Migration_Interpreter::run( $migration, $data );

		// Assert
		$this->assertSame( 'a', $result['settings']['link']['value']['tag'] );
		$this->assertSame( 'data', $result['settings']['link']['value']['extra'] );
		$this->assertArrayNotHasKey( 'tag', $result['settings']['text']['value'] );
		$this->assertSame( 'data', $result['settings']['text']['extra'] );
	}
}

