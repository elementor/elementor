<?php

namespace Elementor\Modules\Variables\Storage;

use Elementor\Modules\Variables\Storage\Entities\Variable;
use Elementor\Modules\Variables\Storage\Exceptions\DuplicatedLabel;
use Elementor\Modules\Variables\Storage\Exceptions\VariablesLimitReached;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @group Elementor\Modules
 * @group Elementor\Modules\Variables
 */
class Test_Variables_Collection extends TestCase {

	public function test_empty_variables__creates_empty_collection() {
		// Act
		$collection = Variables_Collection::default();

		// Assert
		$this->assertEmpty( $collection->all() );
		$this->assertEquals( 0, $collection->watermark() );
		$this->assertEquals( Variables_Collection::FORMAT_VERSION_V1, $collection->serialize()['version'] );
	}

	public function test_hydrate__creates_collection_from_array() {
		// Arrange
		$data = [
			'data' => [
				'id-1' => [
					'type' => 'color',
					'label' => 'Primary',
					'value' => '#000000',
					'order' => 1,
				],
				'id-2' => [
					'type' => 'font',
					'label' => 'Primary Font',
					'value' => 'Roboto',
					'order' => 2,
				],
			],
			'watermark' => 5,
			'version' => 1,
		];

		// Act
		$collection = Variables_Collection::hydrate( $data );

		// Assert
		$this->assertCount( 2, $collection->all() );
		$this->assertEquals( 5, $collection->watermark() );
		$this->assertEquals( 1, $collection->serialize()['version'] );

		$variable1 = $collection->get( 'id-1' );
		$this->assertInstanceOf( Variable::class, $variable1 );
		$this->assertEquals( 'Primary', $variable1->label() );

		$variable2 = $collection->get( 'id-2' );
		$this->assertInstanceOf( Variable::class, $variable2 );
		$this->assertEquals( 'font', $variable2->to_array()['type'] );
		$this->assertEquals( 'Roboto', $variable2->to_array()['value'] );
	}

	public function test_hydrate__with_empty_data() {
		// Arrange
		$data = [
			'data' => [],
			'watermark' => 0,
			'version' => 1,
		];

		// Act
		$collection = Variables_Collection::hydrate( $data );

		// Assert
		$this->assertEmpty( $collection->all() );
		$this->assertEquals( 0, $collection->watermark() );
	}

	public function test_serialize__returns_correct_structure() {
		// Arrange
		$data = [
			'data' => [
				'e-gtoacfcb' => [
					'type' => 'global-size',
					'label' => 'lable',
					'value' => '22px',
					'order' => 4
				],
				'e-gv-4fdi' => [
					'type' => 'global-number',
					'label' => 'number-lable',
					'value' => 27,
					'order' => 34,
				],
			],
			'watermark' => 10,
			'version' => 7,
		];


		// Act
		$collection = Variables_Collection::hydrate( $data );

		$result = $collection->serialize();

		// Assert
		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'data', $result );
		$this->assertEquals( 10, $result['watermark'] );
		$this->assertEquals( 7, $result['version'] );
		$this->assertCount( 2, $result['data'] );
	}

	public function test_watermark__returns_current_watermark() {
		// Arrange
		$collection = Variables_Collection::hydrate( [
			'data' => [],
			'watermark' => 42,
		] );

		// Act & Assert
		$this->assertEquals( 42, $collection->watermark() );
	}

	public function test_increment_watermark__increments_value() {
		// Arrange
		$collection = Variables_Collection::hydrate( [
			'data' => [],
			'watermark' => 5,
		] );

		// Act
		$collection->increment_watermark();

		// Assert
		$this->assertEquals( 6, $collection->watermark() );
	}

	public function test_increment_watermark__resets_at_max_int() {
		// Arrange
		$collection = Variables_Collection::hydrate( [
			'data' => [],
			'watermark' => PHP_INT_MAX,
		] );

		// Act
		$collection->increment_watermark();

		// Assert
		$this->assertEquals( 1, $collection->watermark() );
	}

	public function test_add_variable__adds_to_collection() {
		// Arrange
		$collection = Variables_Collection::hydrate( [
			'data' => [],
			'watermark' => 42,
		] );

		$variable = Variable::from_array( [
			'id' => 'e-gv-90tghfj',
			'type' => 'color',
			'label' => "variable label",
			'value' => '#000000',
			'order' => 0,
		] );

		// Act
		$collection->add_variable( $variable );

		// Assert
		$this->assertCount( 1, $collection->all() );
		$this->assertEquals( $variable, $collection->get( 'e-gv-90tghfj' ) );
	}

	public function test_assert_label_is_unique__passes_with_unique_label() {
		// Arrange
		$collection = Variables_Collection::hydrate( [
			'data' => [
				'e-gvfty45' => [
					'type' => 'global-size-var',
					'label' => 'Secondary',
					'value' => '22px',
					'order' => 23,
				],
				'e-gv-1111' => [
					'type' => 'global-font-var',
					'label' => 'Primary',
					'value' => 'Roboto',
					'order' => 1
				],
			],
			'watermark' => 3,
			'version' => 1,
		] );

		// Act & Assert - Should not throw
		$collection->assert_label_is_unique( 'Tertiary' );
		$this->assertTrue( true ); // If we get here, no exception was thrown
	}

	public function test_assert_label_is_unique__throws_error_with_duplicate_label() {
		// Arrange
		$collection = Variables_Collection::hydrate( [
			'data' => [
				'e-gvfty45' => [
					'type' => 'global-size-var',
					'label' => 'Secondary',
					'value' => '22px',
					'order' => 1,
				],
				'e-gv-1111' => [
					'type' => 'global-font-var',
					'label' => 'Primary',
					'value' => 'Roboto',
					'order' => 2,
				],
			],
			'watermark' => 3,
			'version' => 1,
		] );

		// Assert
		$this->expectException( DuplicatedLabel::class );
		$this->expectExceptionMessage( "Variable label &#039;Primary&#039; already exists." );

		// Act
		$collection->assert_label_is_unique( 'Primary' );
	}

	public function test_assert_label_is_unique__case_insensitive() {
		// Arrange
		$collection = Variables_Collection::hydrate( [
			'data' => [
				'e-gvfty45' => [
					'type' => 'global-size-var',
					'label' => 'Secondary',
					'value' => '22px',
					'order' => 2,
				],
				'e-gv-1111' => [
					'type' => 'global-font-var',
					'label' => 'Primary',
					'value' => 'Roboto',
					'order' => 3,
				],
			],
			'watermark' => 3,
			'version' => 1,
		] );

		// Assert
		$this->expectException( DuplicatedLabel::class );

		// Act
		$collection->assert_label_is_unique( 'PRIMARY' );
	}

	public function test_assert_label_is_unique__ignores_deleted_variables() {
		// Arrange
		$collection = Variables_Collection::hydrate( [
			'data' => [
				'e-gv-1111' => [
					'type' => 'global-font-var',
					'label' => 'Primary',
					'value' => 'Roboto',
					'deleted_at' => '2024-01-01 10:00:00',
					'order' => 23,
				],
			],
			'watermark' => 3,
			'version' => 1,
		] );

		// Act & Assert - Should not throw
		$collection->assert_label_is_unique( 'Primary' );
		$this->assertTrue( true ); // If we get here, no exception was thrown
	}

	public function test_assert_label_is_unique__with_ignore_id() {
		// Arrange
		$collection = Variables_Collection::hydrate( [
			'data' => [
				'e-gv-1111' => [
					'type' => 'global-font-var',
					'label' => 'Primary',
					'value' => 'Roboto',
					'order' => 23,
				],
			],
			'watermark' => 3,
			'version' => 1,
		] );

		// Act & Assert - Should not throw when ignoring the same ID
		$collection->assert_label_is_unique( 'Primary', 'e-gv-1111' );
		$this->assertTrue( true ); // If we get here, no exception was thrown
	}

	public function test_assert_label_is_unique_with__ignore_id_but_different_label() {
		// Arrange
		$collection = Variables_Collection::hydrate( [
			'data' => [
				'id-1' => [
					'type' => 'global-font-var',
					'label' => 'Primary',
					'value' => 'Roboto',
					'order' => 23,
				],
				'id-2' => [
					'type' => 'global-size-var',
					'label' => 'Secondary',
					'value' => '22px',
					'order' => 23,
				],
			],
			'watermark' => 3,
			'version' => 1,
		] );

		// Assert
		$this->expectException( DuplicatedLabel::class );
		$this->expectExceptionMessage( "Variable label &#039;Secondary&#039; already exists." );

		// Act - Ignoring id-1 but id-2 has the same label
		$collection->assert_label_is_unique( 'Secondary', 'id-1' );
	}

	public function test_assert_limit_not_reached__throws_when_at_limit() {
		// Arrange
		$variables = [];
		for ( $i = 0; $i < Variables_Collection::TOTAL_VARIABLES_COUNT; $i++ ) {
			$variables[ "id-{$i}" ] = [
				'type' => 'color',
				'label' => "Label {$i}",
				'value' => '#000',
				'order' => $i
			];
		}

		$collection = Variables_Collection::hydrate( [
			'data' => $variables,
			'watermark' => 30,
			'version' => 1,
		] );

		// Assert
		$this->expectException( VariablesLimitReached::class );
		$this->expectExceptionMessage( 'Total variables count limit reached' );

		// Act
		$collection->assert_limit_not_reached();
	}

	public function test_assert_limit_not_reached__throws_error_when_over_limit() {
		// Arrange
		$variables = [];

		for ( $i = 0; $i < Variables_Collection::TOTAL_VARIABLES_COUNT + 1; $i++ ) {
			$variables[ "id-{$i}" ] = [
				'type' => 'color',
				'label' => "Label {$i}",
				'value' => '#000',
				'order' => $i
			];
		}

		$collection = Variables_Collection::hydrate( [
			'data' => $variables,
			'watermark' => 30,
			'version' => 1,
		] );

		// Assert
		$this->expectException( VariablesLimitReached::class );
		$this->expectExceptionMessage( 'Total variables count limit reached' );

		// Act
		$collection->assert_limit_not_reached();
	}

	public function test_assert_limit_not_reached__ignores_deleted_variables() {
		// Arrange
		$variables = [];
		$variables = [];

		for ( $i = 0; $i < Variables_Collection::TOTAL_VARIABLES_COUNT - 5; $i++ ) {
			$variables[ "id-{$i}" ] = [
				'type' => 'color',
				'label' => "Label {$i}",
				'value' => '#000',
				'order' => $i
			];
		}

		// Add 20 (inactive) deleted variables
		for ( $i = 110; $i < 130; $i++ ) {
			$variables[ "id-{$i}" ] = [
				'type' => 'color',
				'label' => "Label {$i}",
				'value' => '#000',
				'order' => $i,
				'deleted_at' => '2024-01-01 10:00:00',
			];
		}

		$collection = Variables_Collection::hydrate( [
			'data' => $variables,
			'watermark' => 30,
			'version' => 1,
		] );

		// Act & Assert - Should not throw (only 95 active)
		$collection->assert_limit_not_reached();
		$this->assertTrue( true ); // If we get here, no exception was thrown
	}

	public function test_get_next_order__returns_next_order() {
		// Arrange
		$collection = Variables_Collection::hydrate( [
			'data' => [
				'id-1' => [
					'type' => 'global-color',
					'label' => 'Primary',
					'value' => '#000000',
					'order' => 5,
				],
				'id-2' => [
					'type' => 'global-color',
					'label' => 'Secondary',
					'value' => '#FFFFFF',
					'order' => 10,
				],
				'id-3' => [
					'type' => 'global-color',
					'label' => 'Tertiary',
					'value' => '#FF0000',
					'order' => 3,
				],
			],
			'watermark' => 5,
			'version' => 1,
		] );

		// Act
		$next_order = $collection->get_next_order();

		// Assert
		$this->assertEquals( 11, $next_order );
	}

	public function test_get_next_order__ignores_deleted_variables() {
		// Arrange
		$collection = Variables_Collection::hydrate( [
			'data' => [
				'id-1' => [
					'type' => 'global-color',
					'label' => 'Primary',
					'value' => '#000000',
					'order' => 5,
				],
				'id-2' => [
					'type' => 'global-color',
					'label' => 'Deleted',
					'value' => '#FFFFFF',
					'order' => 20,
					'deleted_at' => '2024-01-01 10:00:00',
				],
				'id-3' => [
					'type' => 'global-color',
					'label' => 'Tertiary',
					'value' => '#FF0000',
					'order' => 8,
				],
			],
			'watermark' => 5,
			'version' => 1,
		] );

		// Act
		$next_order = $collection->get_next_order();

		// Assert
		$this->assertEquals( 9, $next_order );
	}
}

