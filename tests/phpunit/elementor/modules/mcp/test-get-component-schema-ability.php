<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Components\Components_Repository;
use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Modules\Mcp\Abilities\Get_Component_Schema_Ability;
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
class Test_Get_Component_Schema_Ability extends Elementor_Test_Base {

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

	public function test_execute__returns_400_when_component_id_is_missing() {
		// Arrange
		$this->act_as_admin();
		$ability = new Get_Component_Schema_Ability();

		// Act
		$result = $ability->execute( [] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'invalid_input', $result->get_error_code() );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
	}

	public function test_execute__returns_404_for_nonexistent_component() {
		// Arrange
		$this->act_as_admin();
		$ability = new Get_Component_Schema_Ability();

		// Act
		$result = $ability->execute( [ 'component_id' => 999999 ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'elementor_not_found', $result->get_error_code() );
		$this->assertSame( \WP_Http::NOT_FOUND, $result->get_error_data()['status'] );
	}

	public function test_execute__returns_404_for_non_component_post() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create();
		$ability = new Get_Component_Schema_Ability();

		// Act
		$result = $ability->execute( [ 'component_id' => $post_id ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'elementor_not_found', $result->get_error_code() );
	}

	public function test_execute__returns_component_info_and_empty_overridable_props_for_new_component() {
		// Arrange
		$this->act_as_admin();
		$component_id = $this->create_component( 'Card Component' );
		$ability = new Get_Component_Schema_Ability();

		// Act
		$result = $ability->execute( [ 'component_id' => $component_id ] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( $component_id, $result['id'] );
		$this->assertSame( 'Card Component', $result['name'] );
		$this->assertArrayHasKey( 'uid', $result );
		$this->assertFalse( $result['is_archived'] );
		$this->assertIsArray( $result['overridable_props'] );
		$this->assertEmpty( $result['overridable_props'] );
	}

	public function test_execute__returns_overridable_props_schema_with_labels_and_groups() {
		// Arrange
		$this->act_as_admin();
		$component_id = $this->create_component_with_overridable_props();
		$ability = new Get_Component_Schema_Ability();

		// Act
		$result = $ability->execute( [ 'component_id' => $component_id ] );

		// Assert
		$this->assertIsArray( $result['overridable_props'] );
		$this->assertArrayHasKey( 'prop-uuid-1', $result['overridable_props'] );

		$title_prop = $result['overridable_props']['prop-uuid-1'];
		$this->assertSame( 'Heading Title', $title_prop['label'] );
		$this->assertSame( 'group-1', $title_prop['group_id'] );
		$this->assertArrayHasKey( 'origin_prop_schema', $title_prop );
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
