<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Components\Components_Repository;
use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Modules\Mcp\Abilities\List_Component_Schemas_Ability;
use Elementor\Plugin;
use Elementor\Testing\Modules\Components\Mocks\Component_Overrides_Mocks;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/../components/mocks/component-overrides-mocks.php';

/**
 * @group Elementor\Modules\Mcp
 */
class Test_List_Component_Schemas_Ability extends Elementor_Test_Base {

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
	}

	public function tearDown(): void {
		$this->delete_all_components();
		parent::tearDown();
	}

	public function test_execute__returns_400_when_component_ids_is_missing() {
		$this->act_as_admin();
		$ability = new List_Component_Schemas_Ability();

		$result = $ability->execute( [] );

		$this->assertWPError( $result );
		$this->assertSame( 'invalid_input', $result->get_error_code() );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
	}

	public function test_execute__returns_400_when_component_ids_is_empty_array() {
		$this->act_as_admin();
		$ability = new List_Component_Schemas_Ability();

		$result = $ability->execute( [ 'component_ids' => [] ] );

		$this->assertWPError( $result );
		$this->assertSame( 'invalid_input', $result->get_error_code() );
	}

	public function test_execute__returns_400_when_component_ids_contains_only_invalid_values() {
		$this->act_as_admin();
		$ability = new List_Component_Schemas_Ability();

		$result = $ability->execute( [ 'component_ids' => [ 0, -1, 'abc' ] ] );

		$this->assertWPError( $result );
		$this->assertSame( 'invalid_input', $result->get_error_code() );
	}

	public function test_execute__returns_404_when_any_component_is_missing() {
		$this->act_as_admin();
		$existing_id = $this->create_component( 'Existing' );
		$ability = new List_Component_Schemas_Ability();

		$result = $ability->execute( [ 'component_ids' => [ $existing_id, 999999 ] ] );

		$this->assertWPError( $result );
		$this->assertSame( 'elementor_not_found', $result->get_error_code() );
		$this->assertSame( \WP_Http::NOT_FOUND, $result->get_error_data()['status'] );
	}

	public function test_execute__returns_404_when_id_points_to_non_component_post() {
		$this->act_as_admin();
		$post_id = $this->factory()->post->create();
		$ability = new List_Component_Schemas_Ability();

		$result = $ability->execute( [ 'component_ids' => [ $post_id ] ] );

		$this->assertWPError( $result );
		$this->assertSame( 'elementor_not_found', $result->get_error_code() );
	}

	public function test_execute__returns_single_component_schema_with_empty_overridable_props() {
		$this->act_as_admin();
		$component_id = $this->create_component( 'Card Component' );
		$ability = new List_Component_Schemas_Ability();

		$result = $ability->execute( [ 'component_ids' => [ $component_id ] ] );

		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'components', $result );
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
		$this->act_as_admin();
		$first_id = $this->create_component( 'First' );
		$second_id = $this->create_component( 'Second' );
		$ability = new List_Component_Schemas_Ability();

		$result = $ability->execute( [ 'component_ids' => [ $second_id, $first_id ] ] );

		$this->assertIsArray( $result );
		$this->assertCount( 2, $result['components'] );
		$this->assertSame( $second_id, $result['components'][0]['id'] );
		$this->assertSame( $first_id, $result['components'][1]['id'] );
	}

	public function test_execute__deduplicates_repeated_component_ids() {
		$this->act_as_admin();
		$component_id = $this->create_component( 'Solo' );
		$ability = new List_Component_Schemas_Ability();

		$result = $ability->execute( [ 'component_ids' => [ $component_id, $component_id ] ] );

		$this->assertIsArray( $result );
		$this->assertCount( 1, $result['components'] );
		$this->assertSame( $component_id, $result['components'][0]['id'] );
	}

	public function test_execute__returns_overridable_props_schema_with_labels_and_groups() {
		$this->act_as_admin();
		$component_id = $this->create_component_with_overridable_props();
		$ability = new List_Component_Schemas_Ability();

		$result = $ability->execute( [ 'component_ids' => [ $component_id ] ] );

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

	private function create_component( string $title ): int {
		$repository = new Components_Repository();
		return $repository->create( $title, [], 'publish', uniqid( 'uid-', true ) );
	}

	private function create_component_with_overridable_props(): int {
		$component_id = $this->create_component( 'Hero Component' );

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
