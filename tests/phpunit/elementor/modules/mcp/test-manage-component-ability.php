<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Core\Documents_Manager;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Elements_Manager;
use Elementor\Modules\Components\Components_Repository;
use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Modules\Components\Non_Atomic_Widget_Validator;
use Elementor\Modules\Interactions\Module as Interactions_Module;
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

	public function test_execute__returns_invalid_input_for_unknown_action() {
		// Arrange
		$this->act_as_admin();
		$ability = new Manage_Component_Ability();

		// Act
		$result = $ability->execute( [ 'action' => 'delete_everything' ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'invalid_input', $result->get_error_code() );
	}

	/**
	 * @dataProvider invalid_action_input_cases
	 */

	public function test_execute__validates_action_specific_required_fields( array $input ) {
		// Arrange
		$this->act_as_admin();
		Mock_Pro_License_API::set_license_state( true );
		$ability = new Manage_Component_Ability();

		// Act
		$result = $ability->execute( $input );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'invalid_input', $result->get_error_code() );
	}

	public function invalid_action_input_cases(): array {
		return [
			'create requires a valid title' => [ [ 'action' => 'create', 'title' => 'X' ] ],
			'update requires component_id' => [ [ 'action' => 'update' ] ],
			'rename requires component_id and a valid title' => [ [ 'action' => 'rename', 'component_id' => 1, 'title' => 'X' ] ],
			'archive requires component_ids' => [ [ 'action' => 'archive', 'component_ids' => [] ] ],
			'publish requires component_id' => [ [ 'action' => 'publish' ] ],
		];
	}

	/**
	 * @dataProvider unknown_component_action_cases
	 */

	public function test_execute__returns_not_found_for_unknown_component( array $input ) {
		// Arrange
		$this->act_as_admin();
		Mock_Pro_License_API::set_license_state( true );
		$ability = new Manage_Component_Ability();

		// Act
		$result = $ability->execute( $input );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'elementor_not_found', $result->get_error_code() );
	}

	public function unknown_component_action_cases(): array {
		return [
			'update' => [ [ 'action' => 'update', 'component_id' => 999999 ] ],
			'rename' => [ [ 'action' => 'rename', 'component_id' => 999999, 'title' => 'New Title' ] ],
			'publish' => [ [ 'action' => 'publish', 'component_id' => 999999 ] ],
		];
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

	public function test_create__compiles_elements_from_xml_structure_with_generated_ids() {
		// Arrange
		$this->act_as_admin();
		Mock_Pro_License_API::set_license_state( true );
		$ability = new Manage_Component_Ability();

		// Act
		$result = $ability->execute( [
			'action' => 'create',
			'title' => 'Hero From Xml',
			'xml_structure' => '<e-flexbox configuration-id="Hero Wrap"><e-heading configuration-id="Hero Title"/></e-flexbox>',
		] );

		// Assert
		$this->assertIsArray( $result, 'Expected success array but got: ' . $this->error_message( $result ) );
		$elements = ( new Components_Repository() )->get( $result['component_id'], false )->get_elements_data();
		$this->assertSame( 'e-flexbox', $elements[0]['elType'] );
		$heading = $elements[0]['elements'][0];
		$this->assertSame( 'e-heading', $heading['widgetType'] );
		$this->assertSame( 'Hero Title', $heading['editor_settings']['title'] );
		$this->assertNotSame( 'Hero Title', $heading['id'] );
		$this->assertSame( $heading['id'], sanitize_key( $heading['id'] ) );
	}

	public function test_create__rejects_xml_structure_with_multiple_root_elements() {
		// Arrange
		$this->act_as_admin();
		Mock_Pro_License_API::set_license_state( true );
		$ability = new Manage_Component_Ability();

		// Act
		$result = $ability->execute( [
			'action' => 'create',
			'title' => 'Multiple Roots',
			'xml_structure' => '<e-heading configuration-id="heading"/><e-paragraph configuration-id="paragraph"/>',
		] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'component_requires_single_root', $result->get_error_code() );
		$this->assertSame( \WP_Http::UNPROCESSABLE_ENTITY, $result->get_error_data()['status'] );
	}

	public function test_create__applies_interactions_from_xml() {
		// Arrange
		$this->act_as_admin();
		Mock_Pro_License_API::set_license_state( true );
		$ability = new Manage_Component_Ability();

		// Act
		$result = $this->with_interactions_active(
			fn() => $ability->execute( [
				'action' => 'create',
				'title' => 'Interactive Heading',
				'xml_structure' => '<e-heading configuration-id="heading"/>',
				'interactions' => [ 'heading' => [ $this->valid_interaction() ] ],
			] )
		);

		// Assert
		$this->assertIsArray( $result, 'Expected success array but got: ' . $this->error_message( $result ) );
		$elements = ( new Components_Repository() )->get( $result['component_id'], false )->get_elements_data();
		$this->assertArrayHasKey( 'interactions', $elements[0], wp_json_encode( $elements[0] ) );
		$this->assertCount( 1, $elements[0]['interactions']['items'] );
		$interaction = $elements[0]['interactions']['items'][0];
		$this->assertSame( 'interaction-item', $interaction['$$type'] );
		$this->assertSame( 'load', $interaction['value']['trigger']['value'] );
		$this->assertSame( 'fade', $interaction['value']['animation']['value']['effect']['value'] );
	}

	public function test_create__copies_an_existing_element_subtree_and_regenerates_ids() {
		// Arrange
		$this->act_as_admin();
		Mock_Pro_License_API::set_license_state( true );
		$post_id = $this->create_real_document();
		$this->given_document_with_elements( $post_id, [
			[
				'id' => 'source-container-id',
				'elType' => 'e-flexbox',
				'settings' => [],
				'elements' => [
					[ 'id' => 'source-heading-id', 'elType' => 'widget', 'widgetType' => 'e-heading', 'settings' => [], 'elements' => [] ],
				],
			],
		] );

		$ability = new Manage_Component_Ability();

		// Act
		$result = $ability->execute( [
			'action' => 'create',
			'title' => 'Hero From Source',
			'source_post_id' => $post_id,
			'element_id' => 'source-container-id',
		] );

		// Assert
		$this->assertIsArray( $result, 'Expected success array but got: ' . $this->error_message( $result ) );
		$elements = ( new Components_Repository() )->get( $result['component_id'], false )->get_elements_data();
		$this->assertSame( 'e-flexbox', $elements[0]['elType'] );
		$this->assertNotSame( 'source-container-id', $elements[0]['id'] );
		$this->assertSame( 'e-heading', $elements[0]['elements'][0]['widgetType'] );
		$this->assertNotSame( 'source-heading-id', $elements[0]['elements'][0]['id'] );
	}

	public function test_create__keeps_widget_at_component_root_unwrapped() {
		// Arrange
		$this->act_as_admin();
		Mock_Pro_License_API::set_license_state( true );
		$ability = new Manage_Component_Ability();

		// Act
		$result = $ability->execute( [
			'action' => 'create',
			'title' => 'Bare Heading Component',
			'xml_structure' => '<e-heading configuration-id="Solo Heading"/>',
		] );

		// Assert
		$this->assertIsArray( $result, 'Expected success array but got: ' . $this->error_message( $result ) );
		$this->assertEmpty( $result['warnings'] ?? [], 'A widget at root is valid and needs no warning.' );

		$elements = ( new Components_Repository() )->get( $result['component_id'], false )->get_elements_data();
		$this->assertCount( 1, $elements );
		$this->assertSame( 'widget', $elements[0]['elType'] );
		$this->assertSame( 'e-heading', $elements[0]['widgetType'] );
		$this->assertSame( 'Solo Heading', $elements[0]['editor_settings']['title'] );
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

	public function test_create__rejects_non_atomic_widget_from_xml() {
		// Arrange
		$this->act_as_admin();
		Mock_Pro_License_API::set_license_state( true );
		$ability = new Manage_Component_Ability();

		// Act
		$result = $ability->execute( [
			'action' => 'create',
			'title' => 'Legacy Heading XML',
			'xml_structure' => '<heading configuration-id="heading"/>',
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
			'xml_structure' => '<e-flexbox configuration-id="wrap"><e-paragraph configuration-id="p1"/></e-flexbox>',
		] );

		// Assert
		$this->assertIsArray( $result, 'Expected success array but got: ' . $this->error_message( $result ) );
		$elements = ( new Components_Repository() )->get( $component_id, false )->get_elements_data();
		$this->assertCount( 1, $elements );
		$this->assertSame( 'e-flexbox', $elements[0]['elType'] );
		$this->assertSame( 'e-paragraph', $elements[0]['elements'][0]['widgetType'] );
		$this->assertSame( 'p1', $elements[0]['elements'][0]['editor_settings']['title'] );
	}

	public function test_update__rejects_invalid_form_structure_and_preserves_the_element_tree() {
		// Arrange
		$this->act_as_admin();
		Mock_Pro_License_API::set_license_state( true );
		$component_id = $this->create_component_with_content( [
			[ 'id' => 'h1', 'elType' => 'widget', 'widgetType' => 'e-heading', 'settings' => [], 'elements' => [] ],
		], 'Invalid Form Update' );
		$ability = new Manage_Component_Ability();

		// Act
		$result = $ability->execute( [
			'action' => 'update',
			'component_id' => $component_id,
			'xml_structure' => '<e-flexbox configuration-id="wrapper"><e-form-input configuration-id="input"/></e-flexbox>',
		] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'elementor_invalid_form_structure', $result->get_error_code() );
		$elements = ( new Components_Repository() )->get( $component_id, false )->get_elements_data();
		$this->assertSame( 'h1', $elements[0]['id'] );
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
			'xml_structure' => '<e-flexbox configuration-id="wrap"><e-paragraph configuration-id="p1"/></e-flexbox>',
			'publish_status' => 'draft',
		] );

		// Assert
		$this->assertIsArray( $result, 'Expected success array but got: ' . $this->error_message( $result ) );

		$published = ( new Components_Repository() )->get( $component_id, false );
		$this->assertSame( 'e-heading', $published->get_elements_data()[0]['widgetType'] );

		$with_autosave = ( new Components_Repository() )->get( $component_id, true );
		$this->assertSame( 'e-flexbox', $with_autosave->get_elements_data()[0]['elType'] );
		$this->assertSame( 'e-paragraph', $with_autosave->get_elements_data()[0]['elements'][0]['widgetType'] );
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

	// ---------------------------------------------------------------------
	// archive
	// ---------------------------------------------------------------------

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
			'xml_structure' => '<e-flexbox configuration-id="wrap"><e-paragraph configuration-id="p1"/></e-flexbox>',
			'publish_status' => 'draft',
		] );
		$this->assertIsArray( $draft_result, 'Fixture setup failed: ' . $this->error_message( $draft_result ) );

		// Act
		$result = $ability->execute( [ 'action' => 'publish', 'component_id' => $component_id ] );

		// Assert
		$this->assertIsArray( $result, 'Expected success array but got: ' . $this->error_message( $result ) );
		$this->assertTrue( $result['success'] );
		$published = ( new Components_Repository() )->get( $component_id, false );
		$this->assertSame( 'e-flexbox', $published->get_elements_data()[0]['elType'] );
		$this->assertSame( 'e-paragraph', $published->get_elements_data()[0]['elements'][0]['widgetType'] );
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

	private function valid_interaction(): array {
		return [
			'trigger' => 'load',
			'animation' => [
				'effect' => 'fade',
				'type' => 'in',
				'direction' => '',
				'timing_config' => [
					'duration' => [ 'size' => 600, 'unit' => 'ms' ],
					'delay' => [ 'size' => 0, 'unit' => 'ms' ],
				],
				'config' => [
					'easing' => 'easeIn',
				],
			],
			'breakpoints' => [
				'excluded' => [],
			],
		];
	}

	private function with_interactions_active( callable $callback ) {
		$experiments = Plugin::$instance->experiments;
		$original_state = $experiments->get_features( Interactions_Module::EXPERIMENT_NAME )['state'];
		$feature_option_key = $experiments->get_feature_option_key( Interactions_Module::EXPERIMENT_NAME );
		update_option( $feature_option_key, Experiments_Manager::STATE_ACTIVE );
		new Interactions_Module();

		try {
			return $callback();
		} finally {
			update_option( $feature_option_key, $original_state );
		}
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
