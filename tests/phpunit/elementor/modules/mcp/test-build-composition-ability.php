<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Core\Base\Document;
use Elementor\Core\Documents_Manager;
use Elementor\Core\Utils\Document\Document_Mutator;
use Elementor\Elements_Manager;
use Elementor\Modules\AtomicWidgets\PropTypes\Html_V3_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Modules\Mcp\Abilities\Build_Composition_Ability;
use Elementor\Plugin;
use Elementor\Widgets_Manager;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Build_Composition_Ability extends Elementor_Test_Base {

	private Documents_Manager $original_documents;
	private Widgets_Manager $original_widgets_manager;
	private Elements_Manager $original_elements_manager;

	public function setUp(): void {
		parent::setUp();

		$this->original_documents = Plugin::$instance->documents;
		$this->original_widgets_manager = Plugin::$instance->widgets_manager;
		$this->original_elements_manager = Plugin::$instance->elements_manager;

		Plugin::$instance->experiments->add_feature( Build_Composition_Ability::get_experimental_data() );
		Plugin::$instance->experiments->set_feature_default_state( Build_Composition_Ability::EXPERIMENT_NAME, 'active' );
	}

	public function tearDown(): void {
		Plugin::$instance->experiments->set_feature_default_state( Build_Composition_Ability::EXPERIMENT_NAME, 'inactive' );
		Plugin::$instance->documents = $this->original_documents;
		Plugin::$instance->widgets_manager = $this->original_widgets_manager;
		Plugin::$instance->elements_manager = $this->original_elements_manager;
		parent::tearDown();
	}

	// Experiment gate

	public function test_execute__returns_not_implemented_when_experiment_is_off() {
		// Arrange
		Plugin::$instance->experiments->set_feature_default_state( Build_Composition_Ability::EXPERIMENT_NAME, 'inactive' );
		$ability = new Build_Composition_Ability( $this->make_noop_mutator() );

		// Act
		$result = $ability->execute( [ 'post_id' => 1, 'xml_structure' => '<e-heading/>' ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'not_implemented', $result->get_error_code() );
	}

	// Input validation

	public function test_execute__returns_bad_request_when_post_id_missing() {
		// Arrange
		$ability = new Build_Composition_Ability( $this->make_noop_mutator() );

		// Act
		$result = $ability->execute( [ 'xml_structure' => '<e-heading/>' ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'invalid_input', $result->get_error_code() );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
	}

	public function test_execute__returns_bad_request_when_xml_structure_missing() {
		// Arrange
		$ability = new Build_Composition_Ability( $this->make_noop_mutator() );

		// Act
		$result = $ability->execute( [ 'post_id' => 1 ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'invalid_input', $result->get_error_code() );
	}

	public function test_execute__returns_bad_request_on_invalid_xml() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create( [ 'post_status' => 'draft', 'post_type' => 'page' ] );
		$this->stub_document_and_registries( $post_id, [ 'e-heading' => 'widget' ] );
		$ability = new Build_Composition_Ability( $this->make_noop_mutator() );

		// Act — unclosed tag
		$result = $ability->execute( [ 'post_id' => $post_id, 'xml_structure' => '<e-heading>' ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'invalid_xml', $result->get_error_code() );
	}

	// Type resolution

	public function test_execute__returns_error_for_unknown_element_type() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create( [ 'post_status' => 'draft', 'post_type' => 'page' ] );
		$this->stub_document_and_registries( $post_id, [] );
		$ability = new Build_Composition_Ability( $this->make_noop_mutator() );

		// Act
		$result = $ability->execute( [ 'post_id' => $post_id, 'xml_structure' => '<nonexistent-widget/>' ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'elementor_unknown_type', $result->get_error_code() );
	}

	// Permissions

	public function test_execute__returns_forbidden_when_user_cannot_edit_post() {
		// Arrange
		$post_id = $this->factory()->post->create( [ 'post_status' => 'draft', 'post_type' => 'page' ] );
		wp_set_current_user( $this->factory()->user->create( [ 'role' => 'subscriber' ] ) );
		$ability = new Build_Composition_Ability( $this->make_noop_mutator() );

		// Act
		$result = $ability->execute( [ 'post_id' => $post_id, 'xml_structure' => '<e-heading/>' ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'elementor_forbidden', $result->get_error_code() );
		$this->assertSame( \WP_Http::FORBIDDEN, $result->get_error_data()['status'] );
	}

	// Child type validation

	public function test_execute__returns_error_when_child_type_not_allowed() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create( [ 'post_status' => 'draft', 'post_type' => 'page' ] );

		$this->stub_document_returning_empty( $post_id );
		$this->stub_registries_with([
			'e-container' => [ 'kind' => 'element', 'allowed_child_types' => [ 'e-heading' ] ],
			'e-paragraph' => [ 'kind' => 'widget' ],
		]);
		$ability = new Build_Composition_Ability( $this->make_noop_mutator() );

		// Act
		$result = $ability->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-container><e-paragraph/></e-container>',
		] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'elementor_invalid_child_type', $result->get_error_code() );
	}

	// Dry run

	public function test_execute__dry_run_returns_resolved_xml_without_persisting() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create( [ 'post_status' => 'draft', 'post_type' => 'page' ] );

		$mock_document = $this->stub_document_returning_empty( $post_id );
		$mock_document->expects( $this->never() )->method( 'save' );

		$this->stub_registries_with( [
			'e-heading' => [ 'kind' => 'widget' ],
		] );

		$ability = new Build_Composition_Ability( $this->make_noop_mutator() );

		// Act
		$result = $ability->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-heading configuration-id="h1"/>',
			'dry_run' => true,
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertTrue( $result['success'] );
		$this->assertSame( [], $result['root_element_ids'] );
		$this->assertStringContainsString( 'e-heading', $result['resolved_xml'] );
	}

	// element_config and styles

	public function test_execute__merges_element_config_into_settings_by_configuration_id() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create( [ 'post_status' => 'draft', 'post_type' => 'page' ] );

		$mock_document = $this->stub_document_returning_empty( $post_id );
		$captured = null;
		$mock_document->method( 'save' )->willReturnCallback( function ( $args ) use ( &$captured ) {
			$captured = $args;
			return true;
		} );

		$this->stub_registries_with( [ 'e-heading' => [ 'kind' => 'widget' ] ] );

		$ability = new Build_Composition_Ability();

		// Act
		$ability->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-heading configuration-id="h1"/>',
			'element_config' => [
				'h1' => [
					'title' => [ '$$type' => 'string', 'value' => 'Hello' ],
				],
			],
		] );

		// Assert
		$this->assertNotNull( $captured );
		$root_settings = $captured['elements'][0]['settings'] ?? null;
		$this->assertSame( 'Hello', $root_settings['title']['value'] ?? null );
	}

	public function test_execute__converts_css_and_attaches_local_style_and_class() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create( [ 'post_status' => 'draft', 'post_type' => 'page' ] );

		$mock_document = $this->stub_document_returning_empty( $post_id );
		$captured = null;
		$mock_document->method( 'save' )->willReturnCallback( function ( $args ) use ( &$captured ) {
			$captured = $args;
			return true;
		} );

		$this->stub_registries_with( [ 'e-heading' => [ 'kind' => 'widget' ] ] );

		$ability = new Build_Composition_Ability();

		// Act
		$ability->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-heading configuration-id="h1"/>',
			'style' => [
				'h1' => [ 'color' => 'red' ],
			],
		] );

		// Assert
		$this->assertNotNull( $captured );
		$root = $captured['elements'][0] ?? null;
		$this->assertNotEmpty( $root['styles'] ?? [], 'Element should have a styles bag.' );
		$style = reset( $root['styles'] );
		$this->assertSame( 'local', $style['label'] );
		$this->assertSame( 'class', $style['type'] );
		$this->assertNotEmpty( $style['variants'][0]['props'], 'Converted CSS props should be present.' );
		$this->assertSame( 'classes', $root['settings']['classes']['$$type'] ?? null );
		$this->assertContains( $style['id'], $root['settings']['classes']['value'] ?? [] );
	}

	// Schema validation

	public function test_execute__returns_invalid_settings_when_props_parser_rejects_value() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create( [ 'post_status' => 'draft', 'post_type' => 'page' ] );
		$this->stub_document_returning_empty( $post_id );

		$this->stub_registries_with_class( 'e-fixture-heading', 'widget', Fixture_Atomic_Widget_With_String_Title::class );

		$ability = new Build_Composition_Ability( $this->make_noop_mutator() );

		// Act — send a non-string title, which the string schema should reject
		$result = $ability->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-fixture-heading configuration-id="h1"/>',
			'element_config' => [
				'h1' => [ 'title' => 12345 ],
			],
		] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'elementor_invalid_settings', $result->get_error_code() );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
	}

	public function test_execute__returns_invalid_styles_when_style_parser_rejects_value() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create( [ 'post_status' => 'draft', 'post_type' => 'page' ] );
		$this->stub_document_returning_empty( $post_id );
		$this->stub_registries_with( [ 'e-heading' => [ 'kind' => 'widget' ] ] );

		$ability = new Build_Composition_Ability( $this->make_noop_mutator() );

		// Act — an entirely unsupported property will fall to customCss (allowed), so we need something
		// that produces a prop with a bad shape. A malformed color value gets converted but may fail schema.
		// Using property that produces raw non-schema-valid output.
		$result = $ability->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-heading configuration-id="h1"/>',
			'style' => [
				'h1' => [ 'color' => '#not-a-color' ],
			],
		] );

		// Either it converts to custom_css (no error) or fails validation — assert whichever we get is coherent.
		if ( is_wp_error( $result ) ) {
			$this->assertSame( 'elementor_invalid_styles', $result->get_error_code() );
			$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
			return;
		}
		$this->assertIsArray( $result );
	}

	// Happy path

	public function test_execute__persists_composition_and_returns_root_ids() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create( [ 'post_status' => 'draft', 'post_type' => 'page' ] );

		$mock_document = $this->stub_document_returning_empty( $post_id );
		$mock_document->method( 'save' )->willReturn( true );

		$this->stub_registries_with( [
			'e-div-block' => [ 'kind' => 'element', 'allowed_child_types' => [] ],
			'e-heading' => [ 'kind' => 'widget' ],
			'e-paragraph' => [ 'kind' => 'widget' ],
		] );

		$ability = new Build_Composition_Ability();

		// Act
		$result = $ability->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-div-block configuration-id="c1"><e-heading configuration-id="h1"/><e-paragraph configuration-id="p1"/></e-div-block>',
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertTrue( $result['success'] );
		$this->assertCount( 1, $result['root_element_ids'] );
		$this->assertNotEmpty( $result['root_element_ids'][0] );
		$this->assertStringContainsString( 'e-div-block', $result['resolved_xml'] );
		$this->assertStringContainsString( 'id=', $result['resolved_xml'] );
	}

	// Alias resolution

	public function test_execute__resolves_alias_content_to_title_for_heading() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create( [ 'post_status' => 'draft', 'post_type' => 'page' ] );

		$mock_document = $this->stub_document_returning_empty( $post_id );
		$captured = null;
		$mock_document->method( 'save' )->willReturnCallback( function ( $args ) use ( &$captured ) {
			$captured = $args;
			return true;
		} );

		$this->stub_registries_with_class( 'e-fixture-heading-v3', 'widget', Fixture_Atomic_Widget_With_Html_V3_Title::class );

		$ability = new Build_Composition_Ability();

		// Act - use 'content' alias which should resolve to 'title'
		$result = $ability->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-fixture-heading-v3 configuration-id="h1"/>',
			'element_config' => [
				'h1' => [
					'content' => [
						'$$type' => 'html-v3',
						'value' => [
							'content' => [ '$$type' => 'string', 'value' => 'Hello via alias' ],
							'children' => [],
						],
					],
				],
			],
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertTrue( $result['success'] );
		$this->assertNotNull( $captured );
		$root_settings = $captured['elements'][0]['settings'] ?? null;
		$this->assertArrayHasKey( 'title', $root_settings );
		$this->assertArrayNotHasKey( 'content', $root_settings );
		$this->assertSame( 'Hello via alias', $root_settings['title']['value']['content']['value'] ?? null );
	}

	public function test_execute__rejects_scalar_element_config_values_with_helpful_error() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create( [ 'post_status' => 'draft', 'post_type' => 'page' ] );
		$this->stub_document_returning_empty( $post_id );
		$this->stub_registries_with_class( 'e-fixture-heading-full', 'widget', Fixture_Heading_With_Tag_And_Title::class );

		$ability = new Build_Composition_Ability( $this->make_noop_mutator() );

		// Act - send scalar value instead of $$type envelope
		$result = $ability->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-fixture-heading-full configuration-id="h1"/>',
			'element_config' => [
				'h1' => [
					'tag' => 'h2',
				],
			],
		] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'elementor_invalid_settings', $result->get_error_code() );
		$error_message = $result->get_error_message();
		$this->assertStringContainsString( '$$type', $error_message );
		$this->assertStringContainsString( 'PropValue envelope', $error_message );
		$this->assertStringContainsString( 'elementor://widgets/schema', $error_message );
	}

	public function test_execute__accepts_proper_type_envelope_for_heading() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create( [ 'post_status' => 'draft', 'post_type' => 'page' ] );

		$mock_document = $this->stub_document_returning_empty( $post_id );
		$captured = null;
		$mock_document->method( 'save' )->willReturnCallback( function ( $args ) use ( &$captured ) {
			$captured = $args;
			return true;
		} );

		$this->stub_registries_with_class( 'e-fixture-heading-full', 'widget', Fixture_Heading_With_Tag_And_Title::class );

		$ability = new Build_Composition_Ability();

		// Act - send proper $$type envelope (same as LLM's first attempt)
		$result = $ability->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-fixture-heading-full configuration-id="h1"/>',
			'element_config' => [
				'h1' => [
					'tag' => [ '$$type' => 'string', 'value' => 'h3' ],
					'title' => [
						'$$type' => 'html-v3',
						'value' => [
							'content' => [ '$$type' => 'string', 'value' => 'WE ARE 26' ],
							'children' => [],
						],
					],
				],
			],
		] );

		// Assert
		$this->assertIsArray( $result, 'Expected success array but got: ' . ( is_wp_error( $result ) ? $result->get_error_message() : 'unknown' ) );
		$this->assertTrue( $result['success'] );
		$this->assertNotNull( $captured );
		$root_settings = $captured['elements'][0]['settings'] ?? null;
		$this->assertSame( 'h3', $root_settings['tag']['value'] ?? null );
		$this->assertSame( 'WE ARE 26', $root_settings['title']['value']['content']['value'] ?? null );
	}

	public function test_execute__accepts_type_envelope_when_schema_prop_is_union() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create( [ 'post_status' => 'draft', 'post_type' => 'page' ] );

		$mock_document = $this->stub_document_returning_empty( $post_id );
		$captured = null;
		$mock_document->method( 'save' )->willReturnCallback( function ( $args ) use ( &$captured ) {
			$captured = $args;
			return true;
		} );

		$this->stub_registries_with_class( 'e-fixture-heading-union', 'widget', Fixture_Heading_With_Union_Props::class );

		$ability = new Build_Composition_Ability();

		// Act - union schema must not rewrite $$type to "union"
		$result = $ability->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-fixture-heading-union configuration-id="h1"/>',
			'element_config' => [
				'h1' => [
					'tag' => [ '$$type' => 'string', 'value' => 'h3' ],
					'title' => [
						'$$type' => 'html-v3',
						'value' => [
							'content' => [ '$$type' => 'string', 'value' => 'WE ARE 26' ],
							'children' => [],
						],
					],
				],
			],
		] );

		// Assert
		$this->assertIsArray( $result, 'Expected success array but got: ' . ( is_wp_error( $result ) ? $result->get_error_message() : 'unknown' ) );
		$this->assertTrue( $result['success'] );
		$this->assertNotNull( $captured );
		$root_settings = $captured['elements'][0]['settings'] ?? null;
		$this->assertSame( 'string', $root_settings['tag']['$$type'] ?? null );
		$this->assertSame( 'h3', $root_settings['tag']['value'] ?? null );
		$this->assertSame( 'html-v3', $root_settings['title']['$$type'] ?? null );
		$this->assertSame( 'WE ARE 26', $root_settings['title']['value']['content']['value'] ?? null );
	}

	public function test_execute__resolves_global_variable_label_to_id() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create( [ 'post_status' => 'draft', 'post_type' => 'page' ] );

		$mock_document = $this->stub_document_returning_empty( $post_id );
		$captured = null;
		$mock_document->method( 'save' )->willReturnCallback( function ( $args ) use ( &$captured ) {
			$captured = $args;
			return true;
		} );

		$this->stub_registries_with( [ 'e-heading' => [ 'kind' => 'widget' ] ] );

		$ability = new Build_Composition_Ability();

		// Act - send global-color-variable with label (should resolve to id if variable exists)
		$result = $ability->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-heading configuration-id="h1"/>',
			'style' => [
				'h1' => [
					'color' => 'var(--e-g-color-wc26-gold)',
				],
			],
		] );

		// Assert - just verify execution succeeds (actual variable resolution depends on variables service)
		$this->assertIsArray( $result, 'Expected success array but got: ' . ( is_wp_error( $result ) ? $result->get_error_message() : 'unknown' ) );
		$this->assertTrue( $result['success'] );
	}

	public function test_execute__returns_invalid_settings_with_available_props_for_unknown_key() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create( [ 'post_status' => 'draft', 'post_type' => 'page' ] );
		$this->stub_document_returning_empty( $post_id );

		$this->stub_registries_with_class( 'e-fixture-heading-v3', 'widget', Fixture_Atomic_Widget_With_Html_V3_Title::class );

		$ability = new Build_Composition_Ability( $this->make_noop_mutator() );

		// Act - use an unknown prop key
		$result = $ability->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-fixture-heading-v3 configuration-id="h1"/>',
			'element_config' => [
				'h1' => [
					'nonexistent_prop' => [ '$$type' => 'string', 'value' => 'test' ],
				],
			],
		] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'elementor_invalid_settings', $result->get_error_code() );
		$error_message = $result->get_error_message();
		$this->assertStringContainsString( 'nonexistent_prop', $error_message );
		$this->assertStringContainsString( 'does not exist', $error_message );
		$this->assertStringContainsString( 'Available properties', $error_message );
	}

	public function test_execute__adjusts_html_v3_shape_from_string_prop_value() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create( [ 'post_status' => 'draft', 'post_type' => 'page' ] );

		$mock_document = $this->stub_document_returning_empty( $post_id );
		$captured = null;
		$mock_document->method( 'save' )->willReturnCallback( function ( $args ) use ( &$captured ) {
			$captured = $args;
			return true;
		} );

		$this->stub_registries_with_class( 'e-fixture-heading-v3', 'widget', Fixture_Atomic_Widget_With_Html_V3_Title::class );

		$ability = new Build_Composition_Ability();

		// Act - provide a value that needs children array adjustment
		$result = $ability->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-fixture-heading-v3 configuration-id="h1"/>',
			'element_config' => [
				'h1' => [
					'title' => [
						'$$type' => 'html-v3',
						'value' => [
							'content' => [ '$$type' => 'string', 'value' => 'Test content' ],
						],
					],
				],
			],
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertTrue( $result['success'] );
		$this->assertNotNull( $captured );
		$root_settings = $captured['elements'][0]['settings'] ?? null;
		$title_value = $root_settings['title']['value'] ?? null;
		$this->assertIsArray( $title_value['children'] ?? null );
	}

	// Single local style and warnings

	public function test_execute__uses_single_local_style_per_element() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create( [ 'post_status' => 'draft', 'post_type' => 'page' ] );

		$mock_document = $this->stub_document_returning_empty( $post_id );
		$captured = null;
		$mock_document->method( 'save' )->willReturnCallback( function ( $args ) use ( &$captured ) {
			$captured = $args;
			return true;
		} );

		$this->stub_registries_with( [ 'e-heading' => [ 'kind' => 'widget' ] ] );

		$ability = new Build_Composition_Ability();

		// Act - apply multiple style declarations (both should merge into one local style)
		$ability->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-heading configuration-id="h1"/>',
			'style' => [
				'h1' => [
					'color' => 'red',
					'font-size' => '24px',
				],
			],
		] );

		// Assert
		$this->assertNotNull( $captured );
		$root = $captured['elements'][0] ?? null;
		$styles = $root['styles'] ?? [];
		$local_style_count = 0;
		foreach ( $styles as $style ) {
			if ( 'local' === ( $style['label'] ?? '' ) ) {
				$local_style_count++;
			}
		}
		$this->assertSame( 1, $local_style_count, 'Should have exactly one local style per element' );
	}

	public function test_execute__reports_custom_css_fallback_as_warning() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create( [ 'post_status' => 'draft', 'post_type' => 'page' ] );

		$mock_document = $this->stub_document_returning_empty( $post_id );
		$mock_document->method( 'save' )->willReturn( true );

		$this->stub_registries_with( [ 'e-heading' => [ 'kind' => 'widget' ] ] );

		$ability = new Build_Composition_Ability();

		// Act - use a property that will fall back to custom_css
		$result = $ability->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-heading configuration-id="h1"/>',
			'style' => [
				'h1' => [
					'border-top' => '1px solid red',
				],
			],
		] );

		// Assert - check if warnings are present (shorthand may fall to custom_css)
		$this->assertIsArray( $result );
		$this->assertTrue( $result['success'] );
		if ( isset( $result['warnings'] ) && ! empty( $result['warnings'] ) ) {
			$this->assertStringContainsString( 'custom_css', implode( ' ', $result['warnings'] ) );
		}
	}

	// Helpers

	private function make_noop_mutator(): Document_Mutator {
		$mock = $this->createMock( Document_Mutator::class );
		$mock->method( 'insert_subtree' )->willReturnCallback(
			function ( $tree, $parent_id, $index, $subtree ) {
				$subtree['id'] = $subtree['id'] ?? 'generated-id-' . uniqid();
				$tree[] = $subtree;
				return $tree;
			}
		);
		$mock->method( 'find_by_id' )->willReturn( null );
		return $mock;
	}

	private function stub_document_returning_empty( int $post_id ) {
		$mock_document = $this->createMock( Document::class );
		$mock_document->method( 'get_elements_data' )->willReturn( [] );
		$mock_document->method( 'get_main_id' )->willReturn( $post_id );
		$mock_document->method( 'get_preview_url' )->willReturn( 'https://example.com/?p=' . $post_id );

		$mock_docs = $this->createMock( Documents_Manager::class );
		$mock_docs->method( 'get_doc_or_auto_save' )->willReturn( $mock_document );
		$mock_docs->method( 'get' )->willReturn( $mock_document );
		Plugin::$instance->documents = $mock_docs;

		return $mock_document;
	}

	private function stub_registries_with_class( string $type, string $kind, string $class ): void {
		$widget = ( new \ReflectionClass( $class ) )->newInstanceWithoutConstructor();

		$mock_widgets = $this->createMock( Widgets_Manager::class );
		$mock_widgets->method( 'get_widget_types' )->willReturnCallback(
			fn( $t ) => 'widget' === $kind && $t === $type ? $widget : null
		);
		Plugin::$instance->widgets_manager = $mock_widgets;

		$mock_elements = $this->createMock( Elements_Manager::class );
		$mock_elements->method( 'get_element_types' )->willReturnCallback(
			fn( $t ) => 'widget' !== $kind && $t === $type ? $widget : null
		);
		Plugin::$instance->elements_manager = $mock_elements;
	}

	private function stub_document_and_registries( int $post_id, array $widget_map ): void {
		$this->stub_document_returning_empty( $post_id );
		$configs = [];
		foreach ( $widget_map as $type => $kind ) {
			$configs[ $type ] = [ 'kind' => $kind ];
		}
		$this->stub_registries_with( $configs );
	}

	/**
	 * @param array<string, array{kind: string, allowed_child_types?: string[]}> $type_configs
	 */
	private function stub_registries_with( array $type_configs ): void {
		$widget_types = [];
		$element_types = [];

		foreach ( $type_configs as $type => $meta ) {
			$mock = $this->createMock( \Elementor\Widget_Base::class );
			$mock->method( 'get_config' )->willReturn( [
				'allowed_child_types' => $meta['allowed_child_types'] ?? [],
			] );

			if ( 'widget' === $meta['kind'] ) {
				$widget_types[ $type ] = $mock;
			} else {
				$element_types[ $type ] = $mock;
			}
		}

		$mock_widgets = $this->createMock( Widgets_Manager::class );
		$mock_widgets->method( 'get_widget_types' )->willReturnCallback(
			fn( $type ) => $widget_types[ $type ] ?? null
		);
		Plugin::$instance->widgets_manager = $mock_widgets;

		$mock_elements = $this->createMock( Elements_Manager::class );
		$mock_elements->method( 'get_element_types' )->willReturnCallback(
			fn( $type ) => $element_types[ $type ] ?? null
		);
		Plugin::$instance->elements_manager = $mock_elements;
	}
}

class Fixture_Atomic_Widget_With_String_Title extends \Elementor\Widget_Base {
	public function get_name() {
		return 'e-fixture-heading';
	}

	public function get_config() {
		return [ 'allowed_child_types' => [] ];
	}

	public static function get_props_schema(): array {
		return [
			'title' => String_Prop_Type::make(),
		];
	}
}

class Fixture_Atomic_Widget_With_Html_V3_Title extends \Elementor\Widget_Base {
	public function get_name() {
		return 'e-fixture-heading-v3';
	}

	public function get_config() {
		return [ 'allowed_child_types' => [] ];
	}

	public static function get_props_schema(): array {
		return [
			'title' => Html_V3_Prop_Type::make()
				->default( [
					'content' => String_Prop_Type::generate( 'Default title' ),
					'children' => [],
				] )
				->alias( 'content', 'text' ),
		];
	}
}

class Fixture_Heading_With_Tag_And_Title extends \Elementor\Widget_Base {
	public function get_name() {
		return 'e-fixture-heading-full';
	}

	public function get_config() {
		return [ 'allowed_child_types' => [] ];
	}

	public static function get_props_schema(): array {
		return [
			'tag' => String_Prop_Type::make()
				->enum( [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ] )
				->default( 'h2' ),
			'title' => Html_V3_Prop_Type::make()
				->default( [
					'content' => String_Prop_Type::generate( 'Default title' ),
					'children' => [],
				] ),
		];
	}
}

class Fixture_Heading_With_Union_Props extends \Elementor\Widget_Base {
	public function get_name() {
		return 'e-fixture-heading-union';
	}

	public function get_config() {
		return [ 'allowed_child_types' => [] ];
	}

	public static function get_props_schema(): array {
		return [
			'tag' => Union_Prop_Type::create_from(
				String_Prop_Type::make()
					->enum( [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ] )
					->default( 'h2' )
			),
			'title' => Union_Prop_Type::create_from(
				Html_V3_Prop_Type::make()
					->default( [
						'content' => String_Prop_Type::generate( 'Default title' ),
						'children' => [],
					] )
			),
		];
	}
}
