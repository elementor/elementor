<?php
namespace Elementor\Testing\Modules\Components;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\Components\Components_REST_API;
use Elementor\Modules\Components\Save_Components_Validator;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Save_Components_Validator extends Elementor_Test_Base {

	public function test_validate_count__passes_when_under_limit() {
		// Arrange
		$existing_components = Collection::make( $this->create_mock_components( 50 ) );
		$new_components = Collection::make( [
			[
				'uid' => 'new-component-1',
				'title' => 'New Component 1',
				'elements' => [],
			],
		] );

		// Act
		$validator = Save_Components_Validator::make( $existing_components );
		$result = $validator->validate( $new_components );

		// Assert
		$this->assertTrue( $result['success'], 'Validation should pass when total is under limit' );
		$this->assertEmpty( $result['messages'] );
	}

	public function test_validate_count__passes_when_exactly_at_limit() {
		// Arrange
		$existing_components = Collection::make( $this->create_mock_components( 99 ) );
		$new_components = Collection::make( [
			[
				'uid' => 'new-component-1',
				'title' => 'New Component 1',
				'elements' => [],
			],
		] );

		// Act
		$validator = Save_Components_Validator::make( $existing_components );
		$result = $validator->validate( $new_components );

		// Assert
		$this->assertTrue( $result['success'], 'Validation should pass when exactly at limit (100)' );
		$this->assertEmpty( $result['messages'] );
	}

	public function test_validate_count__fails_when_exceeds_limit() {
		// Arrange
		$existing_components = Collection::make( $this->create_mock_components( 100 ) );
		$new_components = Collection::make( [
			[
				'uid' => 'new-component-1',
				'title' => 'New Component 1',
				'elements' => [],
			],
		] );

		// Act
		$validator = Save_Components_Validator::make( $existing_components );
		$result = $validator->validate( $new_components );

		// Assert
		$this->assertFalse( $result['success'], 'Validation should fail when exceeding limit' );
		$this->assertCount( 1, $result['messages'] );
		$this->assertEquals( 'Maximum number of components exceeded.', $result['messages'][0] );
	}

	public function test_validate_count__fails_when_adding_multiple_components_exceeds_limit() {
		// Arrange
		$existing_components = Collection::make( $this->create_mock_components( 98 ) );
		$new_components = Collection::make( [
			[
				'uid' => 'new-component-1',
				'title' => 'New Component 1',
				'elements' => [],
			],
			[
				'uid' => 'new-component-2',
				'title' => 'New Component 2',
				'elements' => [],
			],
			[
				'uid' => 'new-component-3',
				'title' => 'New Component 3',
				'elements' => [],
			],
		] );

		// Act
		$validator = Save_Components_Validator::make( $existing_components );
		$result = $validator->validate( $new_components );

		// Assert
		$this->assertFalse( $result['success'], 'Validation should fail when adding multiple components exceeds limit' );
		$this->assertContains( 'Maximum number of components exceeded.', $result['messages'] );
	}

	public function test_validate_count__ignores_archived_components() {
		// Arrange
		$existing_components = Collection::make( array_merge(
			$this->create_mock_components( 90 ),
			$this->create_mock_components( 20, true ) // 20 archived components
		) );
		$new_components = Collection::make( [
			[
				'uid' => 'new-component-1',
				'title' => 'New Component 1',
				'elements' => [],
			],
		] );

		// Act
		$validator = Save_Components_Validator::make( $existing_components );
		$result = $validator->validate( $new_components );

		// Assert
		$this->assertTrue( $result['success'], 'Archived components should not count towards limit' );
		$this->assertEmpty( $result['messages'] );
	}

	public function test_validate_count__uses_max_components_constant() {
		// Arrange
		$existing_components = Collection::make( $this->create_mock_components( Components_REST_API::MAX_COMPONENTS ) );
		$new_components = Collection::make( [
			[
				'uid' => 'new-component-1',
				'title' => 'New Component 1',
				'elements' => [],
			],
		] );

		// Act
		$validator = Save_Components_Validator::make( $existing_components );
		$result = $validator->validate( $new_components );

		// Assert
		$this->assertFalse( $result['success'], 'Should use Components_REST_API::MAX_COMPONENTS constant' );
		$this->assertEquals( Components_REST_API::MAX_COMPONENTS, 100, 'MAX_COMPONENTS constant should be 100' );
	}

	public function test_validate_count__with_no_existing_components() {
		// Arrange
		$existing_components = Collection::make( [] );
		$new_components = Collection::make( [
			[
				'uid' => 'new-component-1',
				'title' => 'New Component 1',
				'elements' => [],
			],
		] );

		// Act
		$validator = Save_Components_Validator::make( $existing_components );
		$result = $validator->validate( $new_components );

		// Assert
		$this->assertTrue( $result['success'], 'Should pass with no existing components' );
		$this->assertEmpty( $result['messages'] );
	}

	// Helpers
	private function create_mock_components( int $count, bool $is_archived = false ): array {
		$components = [];
		for ( $i = 1; $i <= $count; $i++ ) {
			$components[] = [
				'id' => $i,
				'uid' => "component-uid-$i",
				'title' => "Component $i",
				'is_archived' => $is_archived,
			];
		}
		return $components;
	}
}
