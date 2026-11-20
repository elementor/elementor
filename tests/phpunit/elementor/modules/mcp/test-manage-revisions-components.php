<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Core\Documents_Manager;
use Elementor\Modules\Components\Components_Repository;
use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Modules\Mcp\Abilities\Manage_Component_Ability;
use Elementor\Modules\Mcp\Abilities\Manage_Revisions_Ability;
use Elementor\Plugin;
use Elementor\Tests\Phpunit\Modules\Mcp\Fixtures\Revision_Test_Helpers;
use ElementorEditorTesting\Elementor_Test_Base;
use Mock_Pro_License_API;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/../components/mocks/mock-pro-license-api.php';
require_once __DIR__ . '/fixtures/revision-test-helpers.php';

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Manage_Revisions_Components extends Elementor_Test_Base {

	use Revision_Test_Helpers;

	private Documents_Manager $original_documents;

	public function setUp(): void {
		parent::setUp();

		$this->original_documents = Plugin::$instance->documents;

		Plugin::$instance->documents->register_document_type(
			Component_Document::TYPE,
			Component_Document::get_class_full_name()
		);

		register_post_type( Component_Document::TYPE, [
			'label' => Component_Document::get_title(),
			'public' => false,
			'supports' => Component_Document::get_supported_features(),
		] );

		Mock_Pro_License_API::set_license_state( true );
		$this->act_as_admin();
		$this->register_revision_snapshots_experiment();
	}

	public function tearDown(): void {
		Plugin::$instance->documents = $this->original_documents;
		Mock_Pro_License_API::reset();

		parent::tearDown();
	}

	public function test_restore__undoes_a_staged_component_update_with_an_editor_link() {
		// Arrange
		$component_id = ( new Components_Repository() )->create( 'Hero', [
			[ 'id' => 'h1', 'elType' => 'widget', 'widgetType' => 'e-heading', 'settings' => [], 'elements' => [] ],
		], 'publish', uniqid( 'uid-', true ), [] );
		$this->move_modified_date_to_the_past( $component_id );

		$update = ( new Manage_Component_Ability() )->execute_guarded( [
			'action' => Manage_Component_Ability::ACTION_UPDATE,
			'component_id' => $component_id,
			'xml_structure' => '<e-flexbox configuration-id="wrap"><e-paragraph configuration-id="p1"/></e-flexbox>',
			'publish_status' => 'draft',
		] );

		// Act
		$result = ( new Manage_Revisions_Ability() )->execute_guarded( [
			'action' => Manage_Revisions_Ability::ACTION_RESTORE,
			'post_id' => $component_id,
			'revision_id' => $update['undo_revision_id'],
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertTrue( $result['changed'] );
		$this->assertTrue( $result['staged'] );
		$this->assertStringContainsString( 'elementor/manage-component with action=publish', $result['llm_instructions'] );
		$this->assertStringNotContainsString( 'elementor/publish-document', $result['llm_instructions'] );
		$this->assertArrayNotHasKey( 'preview_url', $result, 'Components have no preview URL; an empty one breaks strict MCP clients.' );
		$this->assertNotEmpty( $result['edit_url'] );
		$this->assertStringContainsString( $result['edit_url'], $result['llm_instructions'] );
		$this->assertSame( 'e-heading', $this->elements_of( $this->find_autosave_id( $component_id ) )[0]['widgetType'] );
	}

	public function test_restore__removes_overridable_props_from_the_live_component_after_publish() {
		// Arrange
		$repository = new Components_Repository();
		$component_id = $repository->create( 'Hero', [
			[ 'id' => 'h1', 'elType' => 'widget', 'widgetType' => 'e-heading', 'settings' => [], 'elements' => [] ],
		], 'publish', uniqid( 'uid-', true ), [] );

		$update = ( new Manage_Component_Ability() )->execute_guarded( [
			'action' => Manage_Component_Ability::ACTION_UPDATE,
			'component_id' => $component_id,
			'overridable_props' => [
				'heading_tag' => [
					'target' => 'h1',
					'prop_key' => 'tag',
					'label' => 'Heading Tag',
				],
			],
		] );
		$this->move_modified_date_to_the_past( $component_id );

		( new Manage_Revisions_Ability() )->execute_guarded( [
			'action' => Manage_Revisions_Ability::ACTION_RESTORE,
			'post_id' => $component_id,
			'revision_id' => $update['undo_revision_id'],
		] );

		// Act
		$repository->publish_component( $repository->get( $component_id ) );

		// Assert
		$this->assertEmpty( $repository->get( $component_id, false )->get_overridable_props()->props );
	}
}
