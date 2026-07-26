<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Components\Components_Repository;
use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Modules\Mcp\Abilities\List_Components_Ability;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

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
	}

	public function tearDown(): void {
		$this->delete_all_components();
		parent::tearDown();
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
		$this->assertFalse( $component['is_archived'] );
	}

	public function test_execute__returns_archived_flag_for_archived_components() {
		// Arrange
		$this->act_as_admin();
		$component_id = $this->create_component( 'Old Header', 'publish' );
		$repository = new Components_Repository();
		$component = $repository->get( $component_id, false );
		$component->archive();
		$ability = new List_Components_Ability();

		// Act
		$result = $ability->execute();

		// Assert
		$this->assertCount( 1, $result['components'] );
		$this->assertTrue( $result['components'][0]['is_archived'] );
	}

	private function create_component( string $title, string $status ): int {
		$repository = new Components_Repository();
		return $repository->create( $title, [], $status, uniqid( 'uid-', true ) );
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
