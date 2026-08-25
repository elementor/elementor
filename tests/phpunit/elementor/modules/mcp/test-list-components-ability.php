<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Components\Components_Repository;
use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Modules\Mcp\Abilities\List_Components_Ability;
use Elementor\Plugin;
use Elementor\Testing\Modules\Components\Mocks\Component_Overrides_Mocks;
use ElementorEditorTesting\Elementor_Test_Base;
use Mock_Pro_License_API;
use WP_Http;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/../components/mocks/component-overrides-mocks.php';
require_once __DIR__ . '/../components/mocks/mock-pro-license-api.php';

/**
 * @group Elementor\Modules\Mcp
 */
class Test_List_Components_Ability extends Elementor_Test_Base {

	public function setUp(): void {
		parent::setUp();

		Plugin::$instance->documents->register_document_type(
			Component_Document::TYPE,
			Component_Document::get_class_full_name()
		);

		register_post_type( Component_Document::TYPE, [
			'label'    => Component_Document::get_title(),
			'labels'   => Component_Document::get_labels(),
			'public'   => false,
			'supports' => Component_Document::get_supported_features(),
		] );

		Mock_Pro_License_API::reset();
	}

	public function tearDown(): void {
		$this->delete_all_components();
		Mock_Pro_License_API::reset();
		parent::tearDown();
	}

	/**
	 * @dataProvider access_capability_cases
	 */
	public function test_execute__returns_component_access_capabilities( bool $active, bool $expired, array $expected ) {
		// Arrange
		$this->act_as_admin();
		Mock_Pro_License_API::set_license_state( $active, $expired );
		$ability = new List_Components_Ability();

		// Act
		$result = $ability->execute();

		// Assert
		$this->assertSame( $expected, $result['capabilities'] );
	}

	public function access_capability_cases(): array {
		return [
			'pro' => [
				true,
				false,
				[
					'can_create' => true,
					'can_edit' => true,
					'can_add_to_page' => true,
				],
			],
			'expired' => [
				false,
				true,
				[
					'can_create' => false,
					'can_edit' => true,
					'can_add_to_page' => false,
				],
			],
			'core' => [
				false,
				false,
				[
					'can_create' => false,
					'can_edit' => false,
					'can_add_to_page' => false,
				],
			],
		];
	}

	public function test_execute__includes_user_permissions_in_component_capabilities() {
		// Arrange
		Mock_Pro_License_API::set_license_state( true );
		wp_set_current_user( $this->factory()->user->create( [ 'role' => 'editor' ] ) );
		$ability = new List_Components_Ability();

		// Act
		$result = $ability->execute();

		// Assert
		$this->assertSame(
			[
				'can_create' => false,
				'can_edit' => false,
				'can_add_to_page' => true,
			],
			$result['capabilities']
		);
	}

	public function test_execute__returns_empty_list_when_no_components_exist() {
		// Arrange
		$this->act_as_admin();
		$ability = new List_Components_Ability();

		// Act
		$result = $ability->execute();

		// Assert
		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'components', $result );
		$this->assertEmpty( $result['components'] );
	}

	public function test_execute__returns_component_list_with_correct_shape() {
		// Arrange
		$this->act_as_admin();
		$component_id = $this->create_component( 'My Hero', 'publish' );
		$ability = new List_Components_Ability();

		// Act
		$result = $ability->execute();

		// Assert
		$this->assertCount( 1, $result['components'] );
		$component = $result['components'][0];
		$this->assertSame( $component_id, $component['id'] );
		$this->assertSame( 'My Hero', $component['name'] );
		$this->assertArrayHasKey( 'uid', $component );
		$this->assertArrayNotHasKey( 'is_archived', $component );
	}

	public function test_execute__omits_overridable_props_from_the_discovery_list() {
		// Arrange
		$this->act_as_admin();
		$this->create_component_with_overridable_props();
		$ability = new List_Components_Ability();

		// Act
		$result = $ability->execute();

		// Assert
		$this->assertCount( 1, $result['components'] );
		$this->assertArrayNotHasKey( 'overridable_props', $result['components'][0] );
	}

	public function test_execute__excludes_archived_components_from_the_discovery_list() {
		// Arrange
		$this->act_as_admin();
		$archived_id = $this->create_component( 'Old Header', 'publish' );
		$active_id = $this->create_component( 'Current Header', 'publish' );
		$repository = new Components_Repository();
		$repository->get( $archived_id, false )->archive();
		$ability = new List_Components_Ability();

		// Act
		$result = $ability->execute();

		// Assert
		$this->assertSame( [ $active_id ], array_column( $result['components'], 'id' ) );
	}

	public function test_execute__returns_archived_flag_when_an_archived_component_is_requested_by_id() {
		// Arrange
		$this->act_as_admin();
		$component_id = $this->create_component( 'Old Header', 'publish' );
		$repository = new Components_Repository();
		$repository->get( $component_id, false )->archive();
		$ability = new List_Components_Ability();

		// Act
		$result = $ability->execute( [ 'component_ids' => [ $component_id ] ] );

		// Assert
		$this->assertCount( 1, $result['components'] );
		$this->assertTrue( $result['components'][0]['is_archived'] );
	}

	public function test_execute__returns_discovery_list_when_component_ids_is_empty_array() {
		// Arrange
		$this->act_as_admin();
		$component_id = $this->create_component( 'My Hero', 'publish' );
		$ability = new List_Components_Ability();

		// Act
		$result = $ability->execute( [ 'component_ids' => [] ] );

		// Assert
		$this->assertCount( 1, $result['components'] );
		$this->assertSame( $component_id, $result['components'][0]['id'] );
		$this->assertArrayNotHasKey( 'overridable_props', $result['components'][0] );
	}

	public function test_execute__returns_400_when_component_ids_contains_only_invalid_values() {
		// Arrange
		$this->act_as_admin();
		$ability = new List_Components_Ability();

		// Act
		$result = $ability->execute( [ 'component_ids' => [ 0, -1, 'abc' ] ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'invalid_input', $result->get_error_code() );
		$this->assertSame( WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
	}

	public function test_execute__returns_404_when_any_requested_component_is_missing() {
		// Arrange
		$this->act_as_admin();
		$existing_id = $this->create_component( 'Existing', 'publish' );
		$ability = new List_Components_Ability();

		// Act
		$result = $ability->execute( [ 'component_ids' => [ $existing_id, 999999 ] ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'elementor_not_found', $result->get_error_code() );
		$this->assertSame( WP_Http::NOT_FOUND, $result->get_error_data()['status'] );
	}

	public function test_execute__returns_404_when_id_points_to_non_component_post() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create();
		$ability = new List_Components_Ability();

		// Act
		$result = $ability->execute( [ 'component_ids' => [ $post_id ] ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'elementor_not_found', $result->get_error_code() );
	}

	public function test_execute__returns_schema_with_empty_overridable_props() {
		// Arrange
		$this->act_as_admin();
		$component_id = $this->create_component( 'Card Component', 'publish' );
		$ability = new List_Components_Ability();

		// Act
		$result = $ability->execute( [ 'component_ids' => [ $component_id ] ] );

		// Assert
		$this->assertCount( 1, $result['components'] );

		$entry = $result['components'][0];
		$this->assertSame( $component_id, $entry['id'] );
		$this->assertSame( 'Card Component', $entry['name'] );
		$this->assertArrayHasKey( 'uid', $entry );
		$this->assertFalse( $entry['is_archived'] );
		$this->assertIsArray( $entry['overridable_props'] );
		$this->assertEmpty( $entry['overridable_props'] );
	}

	public function test_execute__returns_multiple_components_in_input_order() {
		// Arrange
		$this->act_as_admin();
		$first_id = $this->create_component( 'First', 'publish' );
		$second_id = $this->create_component( 'Second', 'publish' );
		$ability = new List_Components_Ability();

		// Act
		$result = $ability->execute( [ 'component_ids' => [ $second_id, $first_id ] ] );

		// Assert
		$this->assertCount( 2, $result['components'] );
		$this->assertSame( $second_id, $result['components'][0]['id'] );
		$this->assertSame( $first_id, $result['components'][1]['id'] );
	}

	public function test_execute__deduplicates_repeated_component_ids() {
		// Arrange
		$this->act_as_admin();
		$component_id = $this->create_component( 'Solo', 'publish' );
		$ability = new List_Components_Ability();

		// Act
		$result = $ability->execute( [ 'component_ids' => [ $component_id, $component_id ] ] );

		// Assert
		$this->assertCount( 1, $result['components'] );
		$this->assertSame( $component_id, $result['components'][0]['id'] );
	}

	public function test_execute__returns_overridable_props_schema_with_labels_and_groups() {
		// Arrange
		$this->act_as_admin();
		$component_id = $this->create_component_with_overridable_props();
		$ability = new List_Components_Ability();

		// Act
		$result = $ability->execute( [ 'component_ids' => [ $component_id ] ] );

		// Assert
		$this->assertIsArray( $result['components'][0]['overridable_props'] );
		$this->assertArrayHasKey( 'prop-uuid-1', $result['components'][0]['overridable_props'] );

		$title_prop = $result['components'][0]['overridable_props']['prop-uuid-1'];
		$this->assertSame( 'Heading Title', $title_prop['label'] );
		$this->assertSame( 'group-1', $title_prop['group_id'] );
		$this->assertArrayHasKey( 'origin_prop_schema', $title_prop );

		$origin_schema = $title_prop['origin_prop_schema'];
		$this->assertArrayNotHasKey( '$$type', $origin_schema['properties'] ?? [],
			'origin_prop_schema must be plain-value JSON schema (no $$type envelope), matching elementor/get-widget-schema.' );
		$this->assertStringNotContainsString( '"$$type"', wp_json_encode( $origin_schema ),
			'origin_prop_schema must not contain any $$type envelopes anywhere in the tree.' );
	}

	private function create_component( string $title, string $status ): int {
		$repository = new Components_Repository();
		return $repository->create( $title, [], $status, uniqid( 'uid-', true ) );
	}

	private function create_component_with_overridable_props(): int {
		$component_id = $this->create_component( 'Hero Component', 'publish' );

		$repository = new Components_Repository();
		$component = $repository->get( $component_id, false );

		$mocks = new Component_Overrides_Mocks();
		$component->update_overridable_props( $mocks->get_mock_component_overridable_props() );

		return $component_id;
	}

	private function delete_all_components(): void {
		$posts = get_posts( [
			'post_type'      => Component_Document::TYPE,
			'post_status'    => 'any',
			'posts_per_page' => -1,
		] );

		foreach ( $posts as $post ) {
			wp_delete_post( $post->ID, true );
		}
	}
}
