<?php

namespace Elementor\Modules\Variables\Storage\Entities;

use Elementor\Modules\Variables\PropTypes\Color_Variable_Prop_Type;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Variables
 */
class Test_Variable_Sync extends TestCase {

	public function test_apply_changes__accepts_sync_to_v3_field() {
		// Arrange
		$variable = Variable::from_array( [
			'id' => 'var-123',
			'type' => Color_Variable_Prop_Type::get_key(),
			'label' => 'Primary',
			'value' => '#ff0000',
			'order' => 1,
		] );

		// Act
		$variable->apply_changes( [
			'sync_to_v3' => true,
		] );

		// Assert
		$result = $variable->to_array();
		$this->assertTrue( $result['sync_to_v3'] );
	}

	public function test_apply_changes__can_enable_and_disable_sync() {
		// Arrange
		$variable = Variable::from_array( [
			'id' => 'var-456',
			'type' => Color_Variable_Prop_Type::get_key(),
			'label' => 'Secondary',
			'value' => '#00ff00',
			'order' => 2,
			'sync_to_v3' => true,
		] );

		// Act
		$variable->apply_changes( [
			'sync_to_v3' => false,
		] );

		// Assert
		$result = $variable->to_array();
		$this->assertFalse( $result['sync_to_v3'] );
	}

	public function test_from_array__preserves_sync_to_v3_field() {
		// Arrange
		$data = [
			'id' => 'var-789',
			'type' => Color_Variable_Prop_Type::get_key(),
			'label' => 'Accent',
			'value' => '#0000ff',
			'order' => 3,
			'sync_to_v3' => true,
		];

		// Act
		$variable = Variable::from_array( $data );

		// Assert
		$result = $variable->to_array();
		$this->assertTrue( $result['sync_to_v3'] );
	}

	public function test_to_array__includes_sync_to_v3_when_present() {
		// Arrange
		$variable = Variable::from_array( [
			'id' => 'var-101',
			'type' => Color_Variable_Prop_Type::get_key(),
			'label' => 'Tertiary',
			'value' => '#ffff00',
			'order' => 4,
			'sync_to_v3' => true,
		] );

		// Act
		$result = $variable->to_array();

		// Assert
		$this->assertArrayHasKey( 'sync_to_v3', $result );
		$this->assertTrue( $result['sync_to_v3'] );
	}
}
