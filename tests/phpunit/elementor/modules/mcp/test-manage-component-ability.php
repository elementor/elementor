<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Core\Documents_Manager;
use Elementor\Elements_Manager;
use Elementor\Modules\Components\Components_Repository;
use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Modules\Components\Non_Atomic_Widget_Validator;
use Elementor\Modules\Mcp\Abilities\Manage_Component_Ability;
use Elementor\Plugin;
use Elementor\Widgets_Manager;
use ElementorEditorTesting\Elementor_Test_Base;
use Mock_Pro_License_API;
use WP_Http;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/../components/mocks/mock-pro-license-api.php';

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Manage_Component_Ability extends Elementor_Test_Base {

	private Documents_Manager $original_documents;
	private Widgets_Manager $original_widgets_manager;
	private Elements_Manager $original_elements_manager;

	public function setUp(): void {
		parent::setUp();

		global $wp_scripts, $wp_styles;
		$wp_scripts = new \WP_Scripts();
		$wp_styles = new \WP_Styles();

		$this->original_documents = Plugin::$instance->documents;
		$this->original_widgets_manager = Plugin::$instance->widgets_manager;
		$this->original_elements_manager = Plugin::$instance->elements_manager;

		Plugin::$instance->documents->register_document_type(
			Component_Document::TYPE,
			Component_Document::get_class_full_name()
		);

		register_post_type( Component_Document::TYPE, [
			'label' => Component_Document::get_title(),
			'labels' => Component_Document::get_labels(),
			'public' => false,
			'supports' => Component_Document::get_supported_features(),
		] );

		Mock_Pro_License_API::reset();
	}

	public function tearDown(): void {
		Plugin::$instance->documents = $this->original_documents;
		Plugin::$instance->widgets_manager = $this->original_widgets_manager;
		Plugin::$instance->elements_manager = $this->original_elements_manager;

		global $wp_scripts, $wp_styles;
		$wp_scripts = new \WP_Scripts();
		$wp_styles = new \WP_Styles();

		$this->delete_all_components();
		Mock_Pro_License_API::reset();

		parent::tearDown();
	}

	// ---------------------------------------------------------------------
	// action routing
	// ---------------------------------------------------------------------

	public function test_execute__returns_invalid_input_for_missing_or_unknown_action() {
		// Arrange
		$this->act_as_admin();
		$ability = new Manage_Component_Ability();

		// Act
		$result = $ability->execute( [ 'action' => 'delete_everything' ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'invalid_input', $result->get_error_code() );
	}

	// ---------------------------------------------------------------------
	// access gating (shared across all actions)
	// ---------------------------------------------------------------------

	/**
	 * @dataProvider access_gate_cases
	 */
	public function test_execute__blocked_by_access_tier( array $input, bool $license_active, bool $license_expired ) {
		// Arrange
		$this->act_as_admin();
		Mock_Pro_License_API::set_license_state( $license_active, $license_expired );
		$ability = new Manage_Component_Ability();

		// Act
		$result = $ability->execute( $input );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'insufficient_permissions', $result->get_error_code() );
		$this->assertSame( WP_Http::FORBIDDEN, $result->get_error_data()['status'] );
		$this->assertSame( $input['action'], $result->get_error_data()['action'] );
	}

	public function access_gate_cases(): array {
		return [
			'create requires pro tier' => [ [ 'action' => 'create', 'title' => 'Hero' ], false, false ],
			'create blocked even when expired' => [ [ 'action' => 'create', 'title' => 'Hero' ], false, true ],
			'update requires pro or expired tier' => [ [ 'action' => 'update', 'component_id' => 1 ], false, false ],
			'rename requires pro tier' => [ [ 'action' => 'rename', 'component_id' => 1, 'title' => 'Hero' ], false, false ],
			'rename blocked even when expired' => [ [ 'action' => 'rename', 'component_id' => 1, 'title' => 'Hero' ], false, true ],
			'archive requires pro tier' => [ [ 'action' => 'archive', 'component_ids' => [ 1 ] ], false, false ],
			'archive blocked even when expired' => [ [ 'action' => 'archive', 'component_ids' => [ 1 ] ], false, true ],
			'publish requires pro or expired tier' => [ [ 'action' => 'publish', 'component_id' => 1 ], false, false ],
		];
	}

	// ---------------------------------------------------------------------
	// create
	// ---------------------------------------------------------------------

	public function test_create__requires_a_title_of_at_least_two_characters() {
		// Arrange
		$this->act_as_admin();
		Mock_Pro_License_API::set_license_state( true );
		$ability = new Manage_Component_Ability();

		// Act
		$result = $ability->execute( [ 'action' => 'create', 'title' => 'X' ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'invalid_input', $result->get_error_code() );
	}

	public function test_create__creates_an_empty_component_when_no_source_is_given() {
		// Arrange
		$this->act_as_admin();
		Mock_Pro_License_API::set_license_state( true );
		$ability = new Manage_Component_Ability();

		// Act
		$result = $ability->execute( [ 'action' => 'create', 'title' => 'Empty Hero' ] );

		// Assert
		$this->assertIsArray( $result, 'Expected success array but got: ' . $this->error_message( $result ) );
		$this->assertTrue( $result['success'] );
		$this->assertArrayHasKey( 'component_id', $result );
		$this->assertArrayHasKey( 'uid', $result );
		$this->assertArrayHasKey( 'editor_url', $result );

		$component = ( new Components_Repository() )->get( $result['component_id'], false );
		$this->assertSame( [], $component->get_elements_data() );
	}

	public function test_create__compiles_elements_from_xml_structure_and_stamps_configuration_ids() {
		// Arrange
		$this->act_as_admin();
		Mock_Pro_License_API::set_license_state( true );
		$ability = new Manage_Component_Ability();

		// Act
		$result = $ability->execute( [
			'action' => 'create',
			'title' => 'Hero From Xml',
			'xml_structure' => '<e-heading configuration-id="h1"/>',
		] );

		// Assert
		$this->assertIsArray( $result, 'Expected success array but got: ' . $this->error_message( $result ) );
		$elements = ( new Components_Repository() )->get( $result['component_id'], false )->get_elements_data();
		$this->assertSame( 'h1', $elements[0]['id'] );
		$this->assertSame( 'e-heading', $elements[0]['widgetType'] );
	}

	public function test_create__copies_an_existing_element_subtree_and_regenerates_ids() {
		// Arrange
		$this->act_as_admin();
		Mock_Pro_License_API::set_license_state( true );
		$post_id = $this->create_real_document();
		$this->given_document_with_elements( $post_id, [
			[ 'id' => 'source-heading-id', 'elType' => 'widget', 'widgetType' => 'e-heading', 'settings' => [], 'elements' => [] ],
		] );

		$ability = new Manage_Component_Ability();

		// Act
		$result = $ability->execute( [
			'action' => 'create',
			'title' => 'Hero From Source',
			'source_post_id' => $post_id,
			'element_id' => 'source-heading-id',
		] );

		// Assert
		$this->assertIsArray( $result, 'Expected success array but got: ' . $this->error_message( $result ) );
		$elements = ( new Components_Repository() )->get( $result['component_id'], false )->get_elements_data();
		$this->assertSame( 'e-heading', $elements[0]['widgetType'] );
		$this->assertNotSame( 'source-heading-id', $elements[0]['id'] );
	}

	public function test_create__rejects_xml_structure_and_source_element_together() {
		// Arrange
		$this->act_as_admin();
		Mock_Pro_License_API::set_license_state( true );
		$ability = new Manage_Component_Ability();

		// Act
		$result = $ability->execute( [
			'action' => 'create',
			'title' => 'Conflicting Source',
			'xml_structure' => '<e-heading configuration-id="h1"/>',
			'source_post_id' => 1,
			'element_id' => 'whatever',
		] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'invalid_input', $result->get_error_code() );
	}

	public function test_create__forbids_copying_from_a_post_the_user_cannot_edit() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		$this->given_document_with_elements( $post_id, [
			[ 'id' => 'source-heading-id', 'elType' => 'widget', 'widgetType' => 'e-heading', 'settings' => [], 'elements' => [] ],
		] );

		Mock_Pro_License_API::set_license_state( true );
		wp_set_current_user( $this->factory()->user->create( [ 'role' => 'contributor' ] ) );

		$ability = new Manage_Component_Ability();

		// Act
		$result = $ability->execute( [
			'action' => 'create',
			'title' => 'Forbidden Source',
			'source_post_id' => $post_id,
			'element_id' => 'source-heading-id',
		] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'elementor_forbidden', $result->get_error_code() );
	}

	public function test_create__returns_not_found_when_element_id_does_not_exist_on_source() {
		// Arrange
		$this->act_as_admin();
		Mock_Pro_License_API::set_license_state( true );
		$post_id = $this->create_real_document();

		$ability = new Manage_Component_Ability();

		// Act
		$result = $ability->execute( [
			'action' => 'create',
			'title' => 'Missing Source Element',
			'source_post_id' => $post_id,
			'element_id' => 'does-not-exist',
		] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'elementor_not_found', $result->get_error_code() );
	}

	public function test_create__rejects_components_containing_non_atomic_widgets() {
		// Arrange
		$this->act_as_admin();
		Mock_Pro_License_API::set_license_state( true );
		$post_id = $this->create_real_document();
		$this->given_document_with_elements( $post_id, [
			[ 'id' => 'legacy-heading-id', 'elType' => 'widget', 'widgetType' => 'heading', 'settings' => [], 'elements' => [] ],
		] );

		$ability = new Manage_Component_Ability();

		// Act
		$result = $ability->execute( [
			'action' => 'create',
			'title' => 'Legacy Widget Component',
			'source_post_id' => $post_id,
			'element_id' => 'legacy-heading-id',
		] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( Non_Atomic_Widget_Validator::ERROR_CODE, $result->get_error_code() );
	}

	public function test_create__rejects_a_duplicate_title() {
		// Arrange
		$this->act_as_admin();
		Mock_Pro_License_API::set_license_state( true );
		$this->create_component_with_content( [], 'Existing Hero' );

		$ability = new Manage_Component_Ability();

		// Act
		$result = $ability->execute( [ 'action' => 'create', 'title' => 'Existing Hero' ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'components_validation_failed', $result->get_error_code() );
	}

	public function test_create__applies_overridable_props_to_the_referenced_element() {
		// Arrange
		$this->act_as_admin();
		Mock_Pro_License_API::set_license_state( true );
		$ability = new Manage_Component_Ability();

		// Act
		$result = $ability->execute( [
			'action' => 'create',
			'title' => 'Overridable Hero',
			'xml_structure' => '<e-heading configuration-id="h1"/>',
			'overridable_props' => [
				'heading_tag' => [
					'target' => 'h1',
					'prop_key' => 'tag',
					'label' => 'Heading Tag',
				],
			],
		] );

		// Assert
		$this->assertIsArray( $result, 'Expected success array but got: ' . $this->error_message( $result ) );
		$component = ( new Components_Repository() )->get( $result['component_id'], false );

		$elements = $component->get_elements_data();
		$this->assertSame( 'overridable', $elements[0]['settings']['tag']['$$type'] );
		$this->assertArrayHasKey( 'heading_tag', $component->get_overridable_props()->props );
	}

	public function test_create__returns_error_for_an_invalid_overridable_props_target() {
		// Arrange
		$this->act_as_admin();
		Mock_Pro_License_API::set_license_state( true );
		$ability = new Manage_Component_Ability();

		// Act
		$result = $ability->execute( [
			'action' => 'create',
			'title' => 'Bad Overridable Target',
			'xml_structure' => '<e-heading configuration-id="h1"/>',
			'overridable_props' => [
				'heading_tag' => [
					'target' => 'does-not-exist',
					'prop_key' => 'tag',
					'label' => 'Heading Tag',
				],
			],
		] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'invalid_overridable_props', $result->get_error_code() );
	}

	// ---------------------------------------------------------------------
	// update
	// ---------------------------------------------------------------------

	public function test_update__requires_component_id() {
		// Arrange
		$this->act_as_admin();
		Mock_Pro_License_API::set_license_state( true );
		$ability = new Manage_Component_Ability();

		// Act
		$result = $ability->execute( [ 'action' => 'update' ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'invalid_input', $result->get_error_code() );
	}

	public function test_update__returns_not_found_for_unknown_component() {
		// Arrange
		$this->act_as_admin();
		Mock_Pro_License_API::set_license_state( true );
		$ability = new Manage_Component_Ability();

		// Act
		$result = $ability->execute( [ 'action' => 'update', 'component_id' => 999999 ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'elementor_not_found', $result->get_error_code() );
	}

	public function test_update__requires_overridable_props_or_xml_structure() {
		// Arrange
		$this->act_as_admin();
		Mock_Pro_License_API::set_license_state( true );
		$component_id = $this->create_component_with_content( [
			[ 'id' => 'h1', 'elType' => 'widget', 'widgetType' => 'e-heading', 'settings' => [], 'elements' => [] ],
		], 'Editable Hero' );

		$ability = new Manage_Component_Ability();

		// Act
		$result = $ability->execute( [ 'action' => 'update', 'component_id' => $component_id ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'invalid_input', $result->get_error_code() );
	}

	public function test_update__overridable_props_only_updates_the_component_without_touching_elements() {
		// Arrange
		$this->act_as_admin();
		Mock_Pro_License_API::set_license_state( true );
		$component_id = $this->create_component_with_content( [
			[ 'id' => 'h1', 'elType' => 'widget', 'widgetType' => 'e-heading', 'settings' => [], 'elements' => [] ],
		], 'Editable Hero' );

		$ability = new Manage_Component_Ability();

		// Act
		$result = $ability->execute( [
			'action' => 'update',
			'component_id' => $component_id,
			'overridable_props' => [
				'heading_tag' => [ 'target' => 'h1', 'prop_key' => 'tag', 'label' => 'Tag' ],
			],
		] );

		// Assert
		$this->assertIsArray( $result, 'Expected success array but got: ' . $this->error_message( $result ) );
		$component = ( new Components_Repository() )->get( $component_id, false );
		$this->assertArrayHasKey( 'heading_tag', $component->get_overridable_props()->props );
		$this->assertSame( 'h1', $component->get_elements_data()[0]['id'] );
	}

	public function test_update__with_xml_structure_replaces_the_element_tree() {
		// Arrange
		$this->act_as_admin();
		Mock_Pro_License_API::set_license_state( true );
		$component_id = $this->create_component_with_content( [
			[ 'id' => 'h1', 'elType' => 'widget', 'widgetType' => 'e-heading', 'settings' => [], 'elements' => [] ],
		], 'Replaceable Hero' );

		$ability = new Manage_Component_Ability();

		// Act
		$result = $ability->execute( [
			'action' => 'update',
			'component_id' => $component_id,
			'xml_structure' => '<e-paragraph configuration-id="p1"/>',
		] );

		// Assert
		$this->assertIsArray( $result, 'Expected success array but got: ' . $this->error_message( $result ) );
		$elements = ( new Components_Repository() )->get( $component_id, false )->get_elements_data();
		$this->assertCount( 1, $elements );
		$this->assertSame( 'p1', $elements[0]['id'] );
		$this->assertSame( 'e-paragraph', $elements[0]['widgetType'] );
	}

	public function test_update__with_draft_publish_status_creates_an_autosave_and_leaves_the_published_document_untouched() {
		// Arrange
		$this->act_as_admin();
		Mock_Pro_License_API::set_license_state( true );
		$component_id = $this->create_component_with_content( [
			[ 'id' => 'h1', 'elType' => 'widget', 'widgetType' => 'e-heading', 'settings' => [], 'elements' => [] ],
		], 'Draftable Hero' );
		$this->set_main_doc_as_older_than_autosave( $component_id );

		$ability = new Manage_Component_Ability();

		// Act
		$result = $ability->execute( [
			'action' => 'update',
			'component_id' => $component_id,
			'xml_structure' => '<e-paragraph configuration-id="p1"/>',
			'publish_status' => 'draft',
		] );

		// Assert
		$this->assertIsArray( $result, 'Expected success array but got: ' . $this->error_message( $result ) );

		$published = ( new Components_Repository() )->get( $component_id, false );
		$this->assertSame( 'h1', $published->get_elements_data()[0]['id'] );

		$with_autosave = ( new Components_Repository() )->get( $component_id, true );
		$this->assertSame( 'p1', $with_autosave->get_elements_data()[0]['id'] );
	}

	public function test_update__succeeds_when_license_is_expired() {
		// Arrange
		$this->act_as_admin();
		Mock_Pro_License_API::set_license_state( true );
		$component_id = $this->create_component_with_content( [], 'Expired License Hero' );
		Mock_Pro_License_API::set_license_state( false, true );

		$ability = new Manage_Component_Ability();

		// Act
		$result = $ability->execute( [
			'action' => 'update',
			'component_id' => $component_id,
			'xml_structure' => '<e-heading configuration-id="h1"/>',
		] );

		// Assert
		$this->assertIsArray( $result, 'Expected success array but got: ' . $this->error_message( $result ) );
		$this->assertTrue( $result['success'] );
	}

	// ---------------------------------------------------------------------
	// rename
	// ---------------------------------------------------------------------

	public function test_rename__requires_component_id_and_a_title_of_at_least_two_characters() {
		// Arrange
		$this->act_as_admin();
		Mock_Pro_License_API::set_license_state( true );
		$ability = new Manage_Component_Ability();

		// Act
		$result = $ability->execute( [ 'action' => 'rename', 'component_id' => 1, 'title' => 'X' ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'invalid_input', $result->get_error_code() );
	}

	public function test_rename__updates_the_component_title() {
		// Arrange
		$this->act_as_admin();
		Mock_Pro_License_API::set_license_state( true );
		$component_id = $this->create_component_with_content( [], 'Old Title' );

		$ability = new Manage_Component_Ability();

		// Act
		$result = $ability->execute( [ 'action' => 'rename', 'component_id' => $component_id, 'title' => 'New Title' ] );

		// Assert
		$this->assertIsArray( $result, 'Expected success array but got: ' . $this->error_message( $result ) );
		$this->assertTrue( $result['success'] );
		$component = ( new Components_Repository() )->get( $component_id, false );
		$this->assertSame( 'New Title', $component->get_post()->post_title );
	}

	public function test_rename__returns_not_found_for_unknown_component() {
		// Arrange
		$this->act_as_admin();
		Mock_Pro_License_API::set_license_state( true );
		$ability = new Manage_Component_Ability();

		// Act
		$result = $ability->execute( [ 'action' => 'rename', 'component_id' => 999999, 'title' => 'New Title' ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'elementor_not_found', $result->get_error_code() );
	}

	// ---------------------------------------------------------------------
	// archive
	// ---------------------------------------------------------------------

	public function test_archive__requires_a_non_empty_component_ids_array() {
		// Arrange
		$this->act_as_admin();
		Mock_Pro_License_API::set_license_state( true );
		$ability = new Manage_Component_Ability();

		// Act
		$result = $ability->execute( [ 'action' => 'archive', 'component_ids' => [] ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'invalid_input', $result->get_error_code() );
	}

	public function test_archive__archives_valid_ids_and_reports_failures_for_invalid_ones() {
		// Arrange
		$this->act_as_admin();
		Mock_Pro_License_API::set_license_state( true );
		$component_id = $this->create_component_with_content( [], 'Archivable Hero' );

		$ability = new Manage_Component_Ability();

		// Act
		$result = $ability->execute( [ 'action' => 'archive', 'component_ids' => [ $component_id, 999999 ] ] );

		// Assert
		$this->assertIsArray( $result, 'Expected success array but got: ' . $this->error_message( $result ) );
		$this->assertFalse( $result['success'] );
		$this->assertSame( [ $component_id ], $result['success_ids'] );
		$this->assertSame( [ 999999 ], $result['failed_ids'] );

		$component = ( new Components_Repository() )->get( $component_id, false );
		$this->assertTrue( $component->get_is_archived() );
	}

	// ---------------------------------------------------------------------
	// publish
	// ---------------------------------------------------------------------

	public function test_publish__requires_component_id() {
		// Arrange
		$this->act_as_admin();
		Mock_Pro_License_API::set_license_state( true );
		$ability = new Manage_Component_Ability();

		// Act
		$result = $ability->execute( [ 'action' => 'publish' ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'invalid_input', $result->get_error_code() );
	}

	public function test_publish__returns_not_found_for_unknown_component() {
		// Arrange
		$this->act_as_admin();
		Mock_Pro_License_API::set_license_state( true );
		$ability = new Manage_Component_Ability();

		// Act
		$result = $ability->execute( [ 'action' => 'publish', 'component_id' => 999999 ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'elementor_not_found', $result->get_error_code() );
	}

	public function test_publish__promotes_a_draft_autosave_to_the_published_document() {
		// Arrange
		$this->act_as_admin();
		Mock_Pro_License_API::set_license_state( true );
		$component_id = $this->create_component_with_content( [
			[ 'id' => 'h1', 'elType' => 'widget', 'widgetType' => 'e-heading', 'settings' => [], 'elements' => [] ],
		], 'Publishable Hero' );
		$this->set_main_doc_as_older_than_autosave( $component_id );

		$ability = new Manage_Component_Ability();
		$draft_result = $ability->execute( [
			'action' => 'update',
			'component_id' => $component_id,
			'xml_structure' => '<e-paragraph configuration-id="p1"/>',
			'publish_status' => 'draft',
		] );
		$this->assertIsArray( $draft_result, 'Fixture setup failed: ' . $this->error_message( $draft_result ) );

		// Act
		$result = $ability->execute( [ 'action' => 'publish', 'component_id' => $component_id ] );

		// Assert
		$this->assertIsArray( $result, 'Expected success array but got: ' . $this->error_message( $result ) );
		$this->assertTrue( $result['success'] );
		$published = ( new Components_Repository() )->get( $component_id, false );
		$this->assertSame( 'p1', $published->get_elements_data()[0]['id'] );
	}

	public function test_publish__succeeds_when_license_is_expired() {
		// Arrange
		$this->act_as_admin();
		Mock_Pro_License_API::set_license_state( true );
		$component_id = $this->create_component_with_content( [], 'Expired Publish Hero', 'draft' );
		Mock_Pro_License_API::set_license_state( false, true );

		$ability = new Manage_Component_Ability();

		// Act
		$result = $ability->execute( [ 'action' => 'publish', 'component_id' => $component_id ] );

		// Assert
		$this->assertIsArray( $result, 'Expected success array but got: ' . $this->error_message( $result ) );
		$this->assertTrue( $result['success'] );
	}

	// ---------------------------------------------------------------------
	// helpers
	// ---------------------------------------------------------------------

	private function create_component_with_content( array $elements, string $title, string $status = 'publish', array $settings = [] ): int {
		return ( new Components_Repository() )->create( $title, $elements, $status, uniqid( 'uid-', true ), $settings );
	}

	/**
	 * Autosave detection requires the autosave's `post_modified_gmt` to be strictly newer than the
	 * main document's, which second-precision MySQL timestamps can't guarantee within a single test run.
	 */
	private function set_main_doc_as_older_than_autosave( int $main_doc_id ): void {
		global $wpdb;
		$past_time = gmdate( 'Y-m-d H:i:s', strtotime( '-1 day' ) );
		$wpdb->update( $wpdb->posts, [ 'post_modified_gmt' => $past_time ], [ 'ID' => $main_doc_id ] );
		clean_post_cache( $main_doc_id );
		$this->clear_document_cache( $main_doc_id );
	}

	private function create_real_document(): int {
		return $this->factory()->create_and_get_default_post()->ID;
	}

	private function given_document_with_elements( int $post_id, array $elements ): void {
		$document = Plugin::$instance->documents->get( $post_id );
		$document->save( [ 'elements' => $elements ] );

		$this->clear_document_cache( $post_id );
	}

	private function clear_document_cache( int $post_id ): void {
		$reflection = new \ReflectionProperty( Plugin::$instance->documents, 'documents' );
		$reflection->setAccessible( true );
		$documents = $reflection->getValue( Plugin::$instance->documents );
		unset( $documents[ $post_id ] );
		$reflection->setValue( Plugin::$instance->documents, $documents );
	}

	private function delete_all_components(): void {
		$posts = get_posts( [
			'post_type' => Component_Document::TYPE,
			'post_status' => 'any',
			'posts_per_page' => -1,
		] );

		foreach ( $posts as $post ) {
			wp_delete_post( $post->ID, true );
		}
	}

	private function error_message( $result ): string {
		return is_wp_error( $result ) ? $result->get_error_message() : 'unknown';
	}
}
