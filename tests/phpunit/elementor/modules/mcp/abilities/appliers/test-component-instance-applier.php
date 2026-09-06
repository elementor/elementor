<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Core\Utils\Document\Document_Mutator;
use Elementor\Modules\AtomicWidgets\Module as AtomicWidgetsModule;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Values_Resolver;
use Elementor\Modules\Components\Components_Repository;
use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Modules\Mcp\Abilities\Appliers\Component_Instance_Applier;
use Elementor\Modules\Mcp\Abilities\Build_Composition_Ability;
use Elementor\Plugin;
use Elementor\Testing\Modules\Components\Mocks\Component_Overrides_Mocks;
use ElementorEditorTesting\Elementor_Test_Base;
use Mock_Pro_License_API;
use WP_Http;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/../../../components/mocks/component-overrides-mocks.php';
require_once __DIR__ . '/../../../components/mocks/mock-pro-license-api.php';

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

		Mock_Pro_License_API::reset();
	}

	public function tearDown(): void {
		Plugin::$instance->documents = $this->original_documents;

		$this->delete_all_components();
		Mock_Pro_License_API::reset();
		parent::tearDown();
	}

	public function test_apply__returns_null_when_no_component_instances_given() {
		// Arrange
		$this->act_as_admin();
		$document = Plugin::$instance->documents->get( $this->create_real_document() );
		$applier = $this->make_applier();

		$index = [ 'h1' => [ 'elType' => 'widget', 'widgetType' => 'e-heading', 'settings' => [] ] ];

		// Act
		$error = $applier->apply( $index, [], $document );

		// Assert
		$this->assertNull( $error );
		$this->assertArrayNotHasKey( 'component_instance', $index['h1']['settings'] );
	}

	public function test_apply__returns_error_for_nonexistent_config_id() {
		// Arrange
		$this->act_as_admin();
		$document = Plugin::$instance->documents->get( $this->create_real_document() );
		$applier = $this->make_applier();

		$index = [ 'hero' => [ 'elType' => 'widget', 'widgetType' => 'e-component', 'settings' => [] ] ];
		$component_instances = [ 'missing' => [ 'component_id' => 1 ] ];

		// Act
		$error = $applier->apply( $index, $component_instances, $document );

		// Assert
		$this->assertWPError( $error );
		$this->assertStringContainsString( 'not found in xml_structure', $error->get_error_message() );
	}

	public function test_apply__returns_error_when_config_id_is_not_an_e_component() {
		// Arrange
		$this->act_as_admin();
		$component_id = $this->create_component( 'Hero' );
		$document = Plugin::$instance->documents->get( $this->create_real_document() );
		$applier = $this->make_applier();

		$index = [ 'h1' => [ 'elType' => 'widget', 'widgetType' => 'e-heading', 'settings' => [] ] ];
		$component_instances = [ 'h1' => [ 'component_id' => $component_id ] ];

		// Act
		$error = $applier->apply( $index, $component_instances, $document );

		// Assert
		$this->assertWPError( $error );
		$this->assertStringContainsString( 'only valid for <e-component>', $error->get_error_message() );
	}

	public function test_apply__returns_error_when_component_id_is_missing_or_zero() {
		// Arrange
		$this->act_as_admin();
		$document = Plugin::$instance->documents->get( $this->create_real_document() );
		$applier = $this->make_applier();

		$index = [
			'hero' => [ 'elType' => 'widget', 'widgetType' => 'e-component', 'settings' => [] ],
			'card' => [ 'elType' => 'widget', 'widgetType' => 'e-component', 'settings' => [] ],
		];
		$component_instances = [
			'hero' => [],
			'card' => [ 'component_id' => 0 ],
		];

		// Act
		$error = $applier->apply( $index, $component_instances, $document );

		// Assert
		$this->assertWPError( $error );
		$this->assertSame( 'elementor_invalid_component_instance', $error->get_error_code() );
		$this->assertStringContainsString( '[hero] component_id must be a non-zero integer', $error->get_error_message() );
		$this->assertStringContainsString( '[card] component_id must be a non-zero integer', $error->get_error_message() );
		$this->assertSame( [], $index['hero']['settings'] );
		$this->assertSame( [], $index['card']['settings'] );
	}

	public function test_apply__returns_error_for_nonexistent_component_id() {
		// Arrange
		$this->act_as_admin();
		$document = Plugin::$instance->documents->get( $this->create_real_document() );
		$applier = $this->make_applier();

		$index = [ 'hero' => [ 'elType' => 'widget', 'widgetType' => 'e-component', 'settings' => [] ] ];
		$component_instances = [ 'hero' => [ 'component_id' => 999999 ] ];

		// Act
		$error = $applier->apply( $index, $component_instances, $document );

		// Assert
		$this->assertWPError( $error );
		$this->assertSame( 'elementor_invalid_component_instance', $error->get_error_code() );
		$this->assertStringContainsString( '999999', $error->get_error_message() );
	}

	public function test_apply__returns_error_for_archived_component() {
		// Arrange
		$this->act_as_admin();
		$component_id = $this->create_component( 'Hero' );
		$repository = new Components_Repository();
		$repository->get( $component_id, false )->archive();

		$document = Plugin::$instance->documents->get( $this->create_real_document() );
		$applier = $this->make_applier();

		$index = [ 'hero' => [ 'elType' => 'widget', 'widgetType' => 'e-component', 'settings' => [] ] ];
		$component_instances = [ 'hero' => [ 'component_id' => $component_id ] ];

		// Act
		$error = $applier->apply( $index, $component_instances, $document );

		// Assert
		$this->assertWPError( $error );
		$this->assertStringContainsString( 'archived', $error->get_error_message() );
	}

	public function test_apply__returns_error_for_unknown_override_key() {
		// Arrange
		$this->act_as_admin();
		$component_id = $this->create_component( 'Hero' );
		$document = Plugin::$instance->documents->get( $this->create_real_document() );
		$applier = $this->make_applier();

		$index = [ 'hero' => [ 'elType' => 'widget', 'widgetType' => 'e-component', 'settings' => [] ] ];
		$component_instances = [ 'hero' => [ 'component_id' => $component_id, 'overrides' => [ 'nonexistent-key' => 'value' ] ] ];

		// Act
		$error = $applier->apply( $index, $component_instances, $document );

		// Assert
		$this->assertWPError( $error );
		$this->assertStringContainsString( 'nonexistent-key', $error->get_error_message() );
		$this->assertStringContainsString( 'Valid keys', $error->get_error_message() );
	}

	public function test_apply__writes_full_component_instance_propvalue_into_node_settings() {
		// Arrange
		$this->act_as_admin();
		$component_id = $this->create_component_with_heading_title_prop();
		$document = Plugin::$instance->documents->get( $this->create_real_document() );
		$applier = $this->make_applier();

		$index = [ 'hero' => [ 'elType' => 'widget', 'widgetType' => 'e-component', 'settings' => [] ] ];
		$component_instances = [
			'hero' => [
				'component_id' => $component_id,
				'overrides' => [
					'prop-uuid-1' => [ '$$type' => 'escaped-html', 'value' => 'New Title' ],
				],
			],
		];

		// Act
		$error = $applier->apply( $index, $component_instances, $document );

		// Assert
		$this->assertNull( $error );

		$envelope = $index['hero']['settings']['component_instance'];
		$this->assertSame( 'component-instance', $envelope['$$type'] );
		$this->assertSame( $component_id, $envelope['value']['component_id']['value'] );

		$overrides = $envelope['value']['overrides']['value'];
		$this->assertCount( 1, $overrides );
		$this->assertSame( 'override', $overrides[0]['$$type'] );
		$this->assertSame( 'prop-uuid-1', $overrides[0]['value']['override_key'] );
		$this->assertSame( $component_id, $overrides[0]['value']['schema_source']['id'] );
		$this->assertSame( 'component', $overrides[0]['value']['schema_source']['type'] );
	}

	public function test_apply__allows_empty_overrides() {
		// Arrange
		$this->act_as_admin();
		$component_id = $this->create_component( 'Simple Card' );
		$document = Plugin::$instance->documents->get( $this->create_real_document() );
		$applier = $this->make_applier();

		$index = [ 'card' => [ 'elType' => 'widget', 'widgetType' => 'e-component', 'settings' => [] ] ];
		$component_instances = [ 'card' => [ 'component_id' => $component_id ] ];

		// Act
		$error = $applier->apply( $index, $component_instances, $document );

		// Assert
		$this->assertNull( $error );
		$envelope = $index['card']['settings']['component_instance'];
		$this->assertSame( 'component-instance', $envelope['$$type'] );
		$this->assertEmpty( $envelope['value']['overrides']['value'] );
	}

	public function test_build_composition__persists_component_instance_via_element_config() {
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
						'prop-uuid-1' => [ '$$type' => 'escaped-html', 'value' => 'Override Title' ],
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

	/**
	 * @dataProvider restricted_placement_tiers
	 */
	public function test_build_composition__rejects_component_placement_without_pro_access( bool $expired, string $expected_tier ) {
		// Arrange
		$this->act_as_admin();
		Mock_Pro_License_API::set_license_state( false, $expired );
		$component_id = $this->create_component( 'Restricted Component' );
		$post_id = $this->create_real_document();
		$ability = new Build_Composition_Ability( Document_Mutator::instance() );

		// Act
		$result = $ability->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-flexbox configuration-id="section"><e-component configuration-id="restricted"></e-component></e-flexbox>',
			'element_config' => [
				'restricted' => [
					'component_id' => $component_id,
				],
			],
		] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'insufficient_permissions', $result->get_error_code() );
		$this->assertSame( WP_Http::FORBIDDEN, $result->get_error_data()['status'] );
		$this->assertSame( 'add_to_page', $result->get_error_data()['action'] );
		$this->assertSame( $expected_tier, $result->get_error_data()['tier'] );
	}

	public function restricted_placement_tiers(): array {
		return [
			'core' => [ false, 'core' ],
			'expired' => [ true, 'expired' ],
		];
	}

	public function test_build_composition__allows_raw_widgets_without_pro_access() {
		// Arrange
		$this->act_as_admin();
		Mock_Pro_License_API::set_license_state( false );
		$post_id = $this->create_real_document();
		$ability = new Build_Composition_Ability( Document_Mutator::instance() );

		// Act
		$result = $ability->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-flexbox configuration-id="section"><e-heading configuration-id="heading"></e-heading></e-flexbox>',
			'element_config' => [
				'heading' => [
					'title' => 'Raw heading',
				],
			],
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertTrue( $result['success'] );

		$elements = Plugin::$instance->documents->get( $post_id )->get_elements_data();
		$this->assertSame( 'e-heading', $elements[0]['elements'][0]['widgetType'] );
	}

	public function test_build_composition__rejects_component_instance_as_direct_document_child() {
		// Arrange
		$this->act_as_admin();
		$component_id = $this->create_component( 'Hero Component' );
		$post_id = $this->create_real_document();
		$ability = new Build_Composition_Ability( Document_Mutator::instance() );

		// Act
		$result = $ability->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-component configuration-id="hero-instance"/>',
			'element_config' => [
				'hero-instance' => [
					'component_id' => $component_id,
				],
			],
		] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'elementor_invalid_parent', $result->get_error_code() );
		$this->assertStringContainsString( 'e-component', $result->get_error_message() );
		$this->assertEmpty( Plugin::$instance->documents->get( $post_id )->get_elements_data() );
	}

	public function test_apply__allows_expired_tier_to_edit_a_component_document() {
		// Arrange
		$this->act_as_admin();
		$nested_component_id = $this->create_component( 'Nested Component' );
		$host_component_id = $this->create_component( 'Host Component' );
		$host_component = ( new Components_Repository() )->get( $host_component_id, false );
		Mock_Pro_License_API::set_license_state( false, true );
		$applier = $this->make_applier();
		$index = [ 'nested' => [ 'elType' => 'widget', 'widgetType' => 'e-component', 'settings' => [] ] ];

		// Act
		$error = $applier->apply(
			$index,
			[ 'nested' => [ 'component_id' => $nested_component_id ] ],
			$host_component
		);

		// Assert
		$this->assertNull( $error );
		$this->assertSame(
			$nested_component_id,
			$index['nested']['settings']['component_instance']['value']['component_id']['value']
		);
	}

	public function test_apply_partial__preserves_untouched_overrides_and_replaces_specified_key() {
		// Arrange: build an existing envelope with two overrides via apply().
		$this->act_as_admin();
		$component_id = $this->create_component_with_heading_title_prop();
		$document = Plugin::$instance->documents->get( $this->create_real_document() );
		$applier = $this->make_applier();

		$index = [ 'hero' => [ 'elType' => 'widget', 'widgetType' => 'e-component', 'settings' => [] ] ];

		$initial = [
			'hero' => [
				'component_id' => $component_id,
				'overrides' => [
					'prop-uuid-1' => [ '$$type' => 'escaped-html', 'value' => 'Original' ],
					'prop-uuid-2' => [ '$$type' => 'string', 'value' => 'h2' ],
				],
			],
		];
		$this->assertNull( $applier->apply( $index, $initial, $document ) );

		// Act: partial-update only prop-uuid-1.
		$partial = [
			'hero' => [
				'component_id' => $component_id,
				'overrides' => [
					'prop-uuid-1' => [ '$$type' => 'escaped-html', 'value' => 'Updated' ],
				],
			],
		];
		$error = $applier->apply_partial( $index, $partial, $document );

		// Assert
		$this->assertNull( $error );

		$overrides = $index['hero']['settings']['component_instance']['value']['overrides']['value'];
		$this->assertCount( 2, $overrides, 'Both override keys should be preserved after partial update.' );

		$by_key = $this->overrides_by_key( $overrides );
		$this->assertArrayHasKey( 'prop-uuid-1', $by_key );
		$this->assertArrayHasKey( 'prop-uuid-2', $by_key );
		$this->assertSame( 'Updated', $by_key['prop-uuid-1']['value']['override_value']['value'] );
		$this->assertSame( 'h2', $by_key['prop-uuid-2']['value']['override_value']['value'] );
	}

	public function test_apply_partial__removes_override_when_value_is_null() {
		// Arrange: existing envelope with two overrides.
		$this->act_as_admin();
		$component_id = $this->create_component_with_heading_title_prop();
		$document = Plugin::$instance->documents->get( $this->create_real_document() );
		$applier = $this->make_applier();

		$index = [ 'hero' => [ 'elType' => 'widget', 'widgetType' => 'e-component', 'settings' => [] ] ];
		$initial = [
			'hero' => [
				'component_id' => $component_id,
				'overrides' => [
					'prop-uuid-1' => [ '$$type' => 'escaped-html', 'value' => 'Kept' ],
					'prop-uuid-2' => [ '$$type' => 'string', 'value' => 'h4' ],
				],
			],
		];
		$this->assertNull( $applier->apply( $index, $initial, $document ) );

		// Act: null out prop-uuid-2.
		$partial = [
			'hero' => [ 'overrides' => [ 'prop-uuid-2' => null ] ],
		];
		$error = $applier->apply_partial( $index, $partial, $document );

		// Assert
		$this->assertNull( $error );

		$overrides = $index['hero']['settings']['component_instance']['value']['overrides']['value'];
		$this->assertCount( 1, $overrides );
		$this->assertSame( 'prop-uuid-1', $overrides[0]['value']['override_key'] );
	}

	public function test_apply_partial__appends_new_override_key_not_present_before() {
		// Arrange: existing envelope with only prop-uuid-1.
		$this->act_as_admin();
		$component_id = $this->create_component_with_heading_title_prop();
		$document = Plugin::$instance->documents->get( $this->create_real_document() );
		$applier = $this->make_applier();

		$index = [ 'hero' => [ 'elType' => 'widget', 'widgetType' => 'e-component', 'settings' => [] ] ];
		$initial = [
			'hero' => [
				'component_id' => $component_id,
				'overrides' => [
					'prop-uuid-1' => [ '$$type' => 'escaped-html', 'value' => 'Kept' ],
				],
			],
		];
		$this->assertNull( $applier->apply( $index, $initial, $document ) );

		// Act: add prop-uuid-2 via partial.
		$partial = [
			'hero' => [ 'overrides' => [ 'prop-uuid-2' => [ '$$type' => 'string', 'value' => 'h1' ] ] ],
		];
		$this->assertNull( $applier->apply_partial( $index, $partial, $document ) );

		// Assert
		$by_key = $this->overrides_by_key( $index['hero']['settings']['component_instance']['value']['overrides']['value'] );
		$this->assertArrayHasKey( 'prop-uuid-1', $by_key );
		$this->assertArrayHasKey( 'prop-uuid-2', $by_key );
	}

	public function test_apply_partial__infers_component_id_from_existing_envelope() {
		// Arrange: build existing envelope, then partial without component_id.
		$this->act_as_admin();
		$component_id = $this->create_component_with_heading_title_prop();
		$document = Plugin::$instance->documents->get( $this->create_real_document() );
		$applier = $this->make_applier();

		$index = [ 'hero' => [ 'elType' => 'widget', 'widgetType' => 'e-component', 'settings' => [] ] ];
		$initial = [
			'hero' => [
				'component_id' => $component_id,
				'overrides' => [
					'prop-uuid-2' => [ '$$type' => 'string', 'value' => 'h5' ],
				],
			],
		];
		$this->assertNull( $applier->apply( $index, $initial, $document ) );

		// Act: no component_id in the partial payload.
		$partial = [
			'hero' => [ 'overrides' => [ 'prop-uuid-2' => [ '$$type' => 'string', 'value' => 'h6' ] ] ],
		];
		$error = $applier->apply_partial( $index, $partial, $document );

		// Assert
		$this->assertNull( $error );
		$envelope = $index['hero']['settings']['component_instance'];
		$this->assertSame( $component_id, $envelope['value']['component_id']['value'] );
	}

	public function test_apply_partial__errors_when_component_id_missing_and_no_existing_envelope() {
		// Arrange: fresh e-component node with empty settings, partial without component_id.
		$this->act_as_admin();
		$document = Plugin::$instance->documents->get( $this->create_real_document() );
		$applier = $this->make_applier();

		$index = [ 'hero' => [ 'elType' => 'widget', 'widgetType' => 'e-component', 'settings' => [] ] ];
		$partial = [ 'hero' => [ 'overrides' => [ 'prop-uuid-1' => [ '$$type' => 'string', 'value' => 'X' ] ] ] ];

		// Act
		$error = $applier->apply_partial( $index, $partial, $document );

		// Assert
		$this->assertWPError( $error );
		$this->assertSame( 'elementor_invalid_component_instance', $error->get_error_code() );
		$this->assertStringContainsString( 'component_id could not be resolved', $error->get_error_message() );
	}

	public function test_apply_partial__errors_for_unknown_override_key() {
		// Arrange: existing envelope, then partial with an unknown key.
		$this->act_as_admin();
		$component_id = $this->create_component_with_heading_title_prop();
		$document = Plugin::$instance->documents->get( $this->create_real_document() );
		$applier = $this->make_applier();

		$index = [ 'hero' => [ 'elType' => 'widget', 'widgetType' => 'e-component', 'settings' => [] ] ];
		$initial = [ 'hero' => [ 'component_id' => $component_id, 'overrides' => [ 'prop-uuid-1' => [ '$$type' => 'escaped-html', 'value' => 'A' ] ] ] ];
		$this->assertNull( $applier->apply( $index, $initial, $document ) );

		// Act
		$partial = [ 'hero' => [ 'overrides' => [ 'nonexistent-key' => 'value' ] ] ];
		$error = $applier->apply_partial( $index, $partial, $document );

		// Assert
		$this->assertWPError( $error );
		$this->assertStringContainsString( 'nonexistent-key', $error->get_error_message() );
	}

	private function overrides_by_key( array $overrides_list ): array {
		$by_key = [];
		foreach ( $overrides_list as $item ) {
			$key = $item['value']['override_key'] ?? null;
			if ( is_string( $key ) && '' !== $key ) {
				$by_key[ $key ] = $item;
			}
		}
		return $by_key;
	}

	private function make_applier(): Component_Instance_Applier {
		return new Component_Instance_Applier( new Components_Repository(), $this->plain_values_resolver() );
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
