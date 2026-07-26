<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Core\Utils\Document\Document_Mutator;
use Elementor\Modules\AtomicWidgets\Module as AtomicWidgetsModule;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Values_Resolver;
use Elementor\Modules\Components\Components_Repository;
use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Modules\Mcp\Abilities\Build_Composition\Component_Instance_Applier;
use Elementor\Modules\Mcp\Abilities\Build_Composition_Ability;
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
class Test_Component_Instance_Applier extends Elementor_Test_Base {

	private \Elementor\Core\Documents_Manager $original_documents;

	public function setUp(): void {
		parent::setUp();

		$this->original_documents = Plugin::$instance->documents;

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
		Plugin::$instance->documents = $this->original_documents;

		$this->delete_all_components();
		parent::tearDown();
	}

	public function test_rewrite__returns_null_when_no_component_entries_present() {
		// Arrange
		$this->act_as_admin();
		$document = Plugin::$instance->documents->get( $this->create_real_document() );
		$repository = new Components_Repository();
		$applier = new Component_Instance_Applier( $repository, $this->plain_values_resolver() );

		$index = [ 'h1' => [ 'elType' => 'widget', 'widgetType' => 'e-heading', 'settings' => [] ] ];
		$element_config = [ 'h1' => [ 'title' => [ '$$type' => 'string', 'value' => 'Hello' ] ] ];

		// Act
		$error = $applier->rewrite( $index, $element_config, $document );

		// Assert
		$this->assertNull( $error );
		$this->assertArrayHasKey( 'title', $element_config['h1'] );
	}

	public function test_rewrite__returns_error_for_nonexistent_component_id() {
		// Arrange
		$this->act_as_admin();
		$document = Plugin::$instance->documents->get( $this->create_real_document() );
		$repository = new Components_Repository();
		$applier = new Component_Instance_Applier( $repository, $this->plain_values_resolver() );

		$index = [ 'hero' => [ 'elType' => 'widget', 'widgetType' => 'e-component', 'settings' => [] ] ];
		$element_config = [ 'hero' => [ 'component_id' => 999999 ] ];

		// Act
		$error = $applier->rewrite( $index, $element_config, $document );

		// Assert
		$this->assertWPError( $error );
		$this->assertSame( 'elementor_invalid_component_instance', $error->get_error_code() );
		$this->assertStringContainsString( '999999', $error->get_error_message() );
	}

	public function test_rewrite__returns_error_for_archived_component() {
		// Arrange
		$this->act_as_admin();
		$component_id = $this->create_component( 'Hero' );
		$repository = new Components_Repository();
		$component = $repository->get( $component_id, false );
		$component->archive();

		$document = Plugin::$instance->documents->get( $this->create_real_document() );
		$applier = new Component_Instance_Applier( $repository, $this->plain_values_resolver() );

		$index = [ 'hero' => [ 'elType' => 'widget', 'widgetType' => 'e-component', 'settings' => [] ] ];
		$element_config = [ 'hero' => [ 'component_id' => $component_id ] ];

		// Act
		$error = $applier->rewrite( $index, $element_config, $document );

		// Assert
		$this->assertWPError( $error );
		$this->assertStringContainsString( 'archived', $error->get_error_message() );
	}

	public function test_rewrite__returns_error_for_unknown_override_key() {
		// Arrange
		$this->act_as_admin();
		$component_id = $this->create_component( 'Hero' );

		$document = Plugin::$instance->documents->get( $this->create_real_document() );
		$repository = new Components_Repository();
		$applier = new Component_Instance_Applier( $repository, $this->plain_values_resolver() );

		$index = [ 'hero' => [ 'elType' => 'widget', 'widgetType' => 'e-component', 'settings' => [] ] ];
		$element_config = [ 'hero' => [ 'component_id' => $component_id, 'overrides' => [ 'nonexistent-key' => 'value' ] ] ];

		// Act
		$error = $applier->rewrite( $index, $element_config, $document );

		// Assert
		$this->assertWPError( $error );
		$this->assertStringContainsString( 'nonexistent-key', $error->get_error_message() );
		$this->assertStringContainsString( 'Valid keys', $error->get_error_message() );
	}

	public function test_rewrite__builds_full_component_instance_propvalue_for_valid_shorthand() {
		// Arrange
		$this->act_as_admin();
		$component_id = $this->create_component_with_heading_title_prop();

		$document = Plugin::$instance->documents->get( $this->create_real_document() );
		$repository = new Components_Repository();
		$applier = new Component_Instance_Applier( $repository, $this->plain_values_resolver() );

		$index = [ 'hero' => [ 'elType' => 'widget', 'widgetType' => 'e-component', 'settings' => [] ] ];
		$element_config = [
			'hero' => [
				'component_id' => $component_id,
				'overrides' => [
					'prop-uuid-1' => [ '$$type' => 'html-v3', 'value' => [ 'content' => [ '$$type' => 'string', 'value' => 'New Title' ], 'children' => [] ] ],
				],
			],
		];

		// Act
		$error = $applier->rewrite( $index, $element_config, $document );

		// Assert
		$this->assertNull( $error );

		$rewritten = $element_config['hero'];
		$this->assertArrayHasKey( 'component_instance', $rewritten );

		$envelope = $rewritten['component_instance'];
		$this->assertSame( 'component-instance', $envelope['$$type'] );
		$this->assertSame( $component_id, $envelope['value']['component_id']['value'] );

		$overrides = $envelope['value']['overrides']['value'];
		$this->assertCount( 1, $overrides );
		$this->assertSame( 'override', $overrides[0]['$$type'] );
		$this->assertSame( 'prop-uuid-1', $overrides[0]['value']['override_key'] );
		$this->assertSame( $component_id, $overrides[0]['value']['schema_source']['id'] );
		$this->assertSame( 'component', $overrides[0]['value']['schema_source']['type'] );
	}

	public function test_rewrite__allows_empty_overrides() {
		// Arrange
		$this->act_as_admin();
		$component_id = $this->create_component( 'Simple Card' );

		$document = Plugin::$instance->documents->get( $this->create_real_document() );
		$repository = new Components_Repository();
		$applier = new Component_Instance_Applier( $repository, $this->plain_values_resolver() );

		$index = [ 'card' => [ 'elType' => 'widget', 'widgetType' => 'e-component', 'settings' => [] ] ];
		$element_config = [ 'card' => [ 'component_id' => $component_id ] ];

		// Act
		$error = $applier->rewrite( $index, $element_config, $document );

		// Assert
		$this->assertNull( $error );
		$envelope = $element_config['card']['component_instance'];
		$this->assertSame( 'component-instance', $envelope['$$type'] );
		$this->assertEmpty( $envelope['value']['overrides']['value'] );
	}

	public function test_build_composition__persists_component_instance_with_correct_settings() {
		// Arrange
		$this->act_as_admin();
		$component_id = $this->create_component_with_heading_title_prop();
		$post_id = $this->create_real_document();

		$ability = new Build_Composition_Ability( Document_Mutator::instance() );

		// Act
		$result = $ability->execute( [
			'post_id'        => $post_id,
			'xml_structure'  => '<e-flexbox configuration-id="section"><e-component configuration-id="hero-instance"></e-component></e-flexbox>',
			'element_config' => [
				'hero-instance' => [
					'component_id' => $component_id,
					'overrides'    => [
						'prop-uuid-1' => [ '$$type' => 'html-v3', 'value' => [ 'content' => [ '$$type' => 'string', 'value' => 'Override Title' ], 'children' => [] ] ],
					],
				],
			],
		] );

		// Assert
		$this->assertIsArray( $result, 'Expected success array, got: ' . ( is_wp_error( $result ) ? $result->get_error_message() : 'unknown' ) );
		$this->assertTrue( $result['success'] );

		$document = Plugin::$instance->documents->get( $post_id );
		$elements = $document->get_elements_data();
		$section = $elements[0] ?? null;
		$this->assertNotNull( $section );

		$instance_data = $section['elements'][0] ?? null;
		$this->assertNotNull( $instance_data );
		$this->assertSame( 'e-component', $instance_data['widgetType'] );

		$ci = $instance_data['settings']['component_instance'] ?? null;
		$this->assertNotNull( $ci );
		$this->assertSame( 'component-instance', $ci['$$type'] );
		$this->assertSame( $component_id, $ci['value']['component_id']['value'] );
	}

	private function plain_values_resolver(): Plain_Values_Resolver {
		return AtomicWidgetsModule::instance()->get_settings_plain_values_resolver();
	}

	private function create_real_document(): int {
		return $this->factory()->create_and_get_default_post()->ID;
	}

	private function create_component( string $title ): int {
		$repository = new Components_Repository();
		return $repository->create( $title, [], 'publish', uniqid( 'uid-', true ) );
	}

	private function create_component_with_heading_title_prop(): int {
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
