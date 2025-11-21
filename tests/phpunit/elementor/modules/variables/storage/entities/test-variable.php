<?php

namespace Elementor\Modules\Variables\Storage\Entities;

use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @group Elementor\Modules
 * @group Elementor\Modules\Variables
 */
class Test_Variable extends TestCase {

	public function test_from_array__creates_variable_with_all_fields() {
		// Arrange
		$data = [
			'id' => 'id-4563',
			'type' => 'font',
			'label' => 'Primary Font',
			'value' => 'Roboto',
			'order' => 290,
			'updated_at' => '2024-01-01 10:00:00',
		];

		// Act
		$variable = Variable::from_array( $data );

		$result = $variable->to_array();

		// Assert
		$this->assertEquals( 'id-4563', $variable->id() );
		$this->assertEquals( 'font', $result['type'] );
		$this->assertEquals( 'Primary Font', $variable->label() );
		$this->assertEquals( 'Roboto', $result['value'] );
		$this->assertEquals( 290, $result['order'] );
		$this->assertEquals( null, $result['deleted_at'] );
		$this->assertEquals( '2024-01-01 10:00:00', $result['updated_at'] );
	}

	public function test_from_array__with_defaults() {
		// Arrange
		$data = [
			'id' => 'id-789',
			'type' => 'global-font',
		];

		// Act
		$variable = Variable::from_array( $data );

		$result = $variable->to_array();

		// Assert
		$this->assertEquals( 'id-789', $variable->id() );
		$this->assertEquals( 'global-font', $result['type'] );
		$this->assertEquals( '', $result['label'] );
		$this->assertEquals( '', $result['value'] );
		$this->assertEquals( 0, $result['order'] );
		$this->assertEquals( null, $result['deleted_at'] );
		$this->assertEquals( null, $result['updated_at'] );
	}

	public function test_soft_delete__sets_deleted_at() {
		// Arrange

		$variable = Variable::from_array( [
			'id' => 'id-123',
			'type' => 'global-color',
			'label' => 'Primary Color',
			'value' => 'Orange',
		] );

		$this->assertFalse( $variable->is_deleted() );

		// Act
		$variable->soft_delete();

		// Assert
		$this->assertTrue( $variable->is_deleted() );
		$this->assertNotEmpty( $variable->to_array()['deleted_at'] );
	}

	public function test_to_array__returns_all_properties() {
		// Arrange
		$variable = Variable::from_array( [
			'id' => 'id-123',
			'type' => 'color',
			'label' => 'Primary Color',
			'value' => '#000000',
			'order' => 5,
			'updated_at' => '2024-01-01 10:00:00'
		] );

		// Act
		$result = $variable->to_array();

		// Assert
		$this->assertIsArray( $result );
		$this->assertArrayNotHasKey( 'id', $result );
		$this->assertEquals( 'color', $result['type'] );
		$this->assertEquals( 'Primary Color', $result['label'] );
		$this->assertEquals( '#000000', $result['value'] );
		$this->assertEquals( 5, $result['order'] );
		$this->assertNull( $result['deleted_at'] );
		$this->assertEquals( '2024-01-01 10:00:00', $result['updated_at'] );
	}

	public function test_to_array__includes_soft_deleted() {
		// Arrange
		$variable = Variable::from_array( [
			'id' => 'id-123',
			'type' => 'color',
			'label' => 'Primary Color',
			'value' => '#000000',
			'order' => 1,
		] );

		// Act
		$variable->soft_delete();

		// Assert
		$this->assertNotNull( $variable->to_array()['deleted_at'] );
	}

	public function test_apply_changes__updates_fields() {
		// Arrange
		$variable = Variable::from_array( [
			'id' => 'id-123',
			'type' => 'color',
			'label' => 'Primary Color',
			'value' => '#000000',
		] );

		// Act
		$variable->apply_changes( [
			'label' => 'Updated Label',
			'value' => 'Yellow',
			'order' => 34,
		] );

		// Assert
		$this->assertEquals( 'Updated Label', $variable->label() );
		$this->assertEquals( 'Yellow', $variable->to_array()['value'] );
		$this->assertEquals( 34, $variable->to_array()['order'] );
		$this->assertNotNull( $variable->to_array()['updated_at'] );
	}

	public function test_apply_changes__updates_updated_at() {
		// Arrange
		$variable = Variable::from_array( [
			'id' => 'id-123',
			'type' => 'color',
			'label' => 'Primary Color',
			'value' => '#000000',
			'order' => 5,
			'updated_at' => '2024-01-01 10:00:00',
		] );

		// Act
		$old_updated_at = $variable->to_array()['updated_at'];

		$variable->apply_changes( [ 'label' => 'Updated Label' ] );

		$new_updated_at = $variable->to_array()['updated_at'];

		// Assert
		$this->assertNotEquals( $old_updated_at, $new_updated_at );
	}

	public function test_apply_changes__ignores_unknown_fields() {
		// Arrange
		$variable = Variable::from_array( [
			'id' => 'id-123',
			'type' => 'color',
			'label' => 'Primary Color',
			'value' => '#000000',
			'order' => 5,
		] );

		// Act
		$variable->apply_changes( [
			'label' => 'Updated Label',
			'unknown_field' => 'should be ignored',
		] );

		// Assert
		$this->assertEquals( 'Updated Label', $variable->label() );
		$this->assertArrayNotHasKey( 'unknown_field', $variable->to_array() );
	}

	public function test_apply_changes__does_not_update_timestamp_for_empty_array() {
		// Arrange
		$updated_at = '2024-01-01 10:00:00';
		$variable = Variable::from_array( [
			'id' => 'id-123',
			'type' => 'color',
			'label' => 'Primary Color',
			'value' => '#000000',
			'updated_at' => $updated_at,
		] );

		// Act
		$variable->apply_changes( [] );

		// Assert
		$this->assertEquals( $updated_at, $variable->to_array()['updated_at'] );
	}
}

