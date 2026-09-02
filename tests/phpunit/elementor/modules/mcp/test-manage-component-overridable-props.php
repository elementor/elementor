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
use Elementor\Modules\Mcp\Abilities\Utils\Overridable_Props_Builder;
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
class Test_Manage_Component_Overridable_Props extends Elementor_Test_Base {

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

	// ---------------------------------------------------------------------
	// overridable props / expose-further
	// ---------------------------------------------------------------------

	public function test_create__applies_overridable_props_to_the_referenced_element() {
		// Arrange
		$this->act_as_admin();
		Mock_Pro_License_API::set_license_state( true );
		$ability = new Manage_Component_Ability();

		// Act
		$result = $ability->execute( [
			'action' => 'create',
			'title' => 'Overridable Hero',
			'xml_structure' => '<e-flexbox configuration-id="wrap"><e-heading configuration-id="h1"/></e-flexbox>',
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
		$heading = $elements[0]['elements'][0];
		$this->assertSame( 'overridable', $heading['settings']['tag']['$$type'] );
		$this->assertArrayHasKey( 'heading_tag', $component->get_overridable_props()->props );
	}

	public function test_create__persists_widgets_cache_key_as_widget_type_for_atomic_elements() {
		// Arrange
		$this->act_as_admin();
		Mock_Pro_License_API::set_license_state( true );
		$ability = new Manage_Component_Ability();

		// Act
		$result = $ability->execute( [
			'action' => 'create',
			'title' => 'Linkable Flexbox',
			'xml_structure' => '<e-flexbox configuration-id="card"/>',
			'overridable_props' => [
				'card_link' => [
					'target' => 'card',
					'prop_key' => 'link',
					'label' => 'Card Link',
				],
			],
		] );

		// Assert - widgetType must be a real widgetsCache key (the element type), not '',
		// otherwise the editor's OverrideControl throws "Prop type not found".
		$this->assertIsArray( $result, 'Expected success array but got: ' . $this->error_message( $result ) );
		$overridable = ( new Components_Repository() )->get( $result['component_id'], false )
			->get_overridable_props()->props['card_link'];
		$this->assertSame( 'e-flexbox', $overridable->widget_type );
		$this->assertSame( 'e-flexbox', $overridable->el_type );
	}

	public function test_create__persists_an_overridable_prop_element_id_that_still_resolves_after_sanitization() {
		// Arrange
		$this->act_as_admin();
		Mock_Pro_License_API::set_license_state( true );
		$ability = new Manage_Component_Ability();

		// Act
		$result = $ability->execute( [
			'action' => 'create',
			'title' => 'Human Labelled Hero',
			'xml_structure' => '<e-flexbox configuration-id="wrap"><e-heading configuration-id="Hero Title"/></e-flexbox>',
			'overridable_props' => [
				'hero-title' => [
					'target' => 'Hero Title',
					'prop_key' => 'tag',
					'label' => 'Heading Tag',
				],
			],
		] );

		// Assert
		$this->assertIsArray( $result, 'Expected success array but got: ' . $this->error_message( $result ) );
		$component = ( new Components_Repository() )->get( $result['component_id'], false );

		$heading_id = $component->get_elements_data()[0]['elements'][0]['id'];
		$this->assertSame( $heading_id, $component->get_overridable_props()->props['hero-title']->element_id );
	}

	public function test_create__generates_group_ids_that_do_not_collide_with_the_sortable_default_group() {
		// Arrange
		$this->act_as_admin();
		Mock_Pro_License_API::set_license_state( true );
		$ability = new Manage_Component_Ability();

		// Act
		$result = $ability->execute( [
			'action' => 'create',
			'title' => 'Default Group Hero',
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
		$groups = ( new Components_Repository() )->get( $result['component_id'], false )->get_overridable_props()->groups;

		$group_id = $groups['order'][0];
		$this->assertNotSame( 'default', $group_id );
		$this->assertStringStartsWith( 'group-', $group_id );
		$this->assertSame( 'Default', $groups['items'][ $group_id ]['label'] );
	}

	/**
	 * @dataProvider invalid_overridable_props_cases
	 */

	public function test_create__rejects_invalid_overridable_props( array $overridable_props, string $expected_message ) {
		// Arrange
		$this->act_as_admin();
		Mock_Pro_License_API::set_license_state( true );
		$ability = new Manage_Component_Ability();

		// Act
		$result = $ability->execute( [
			'action' => 'create',
			'title' => 'Invalid Overridable Props',
			'xml_structure' => '<e-heading configuration-id="h1"/>',
			'overridable_props' => $overridable_props,
		] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'invalid_overridable_props', $result->get_error_code() );
		$this->assertStringContainsString( $expected_message, $result->get_error_message() );
	}

	public function invalid_overridable_props_cases(): array {
		return [
			'non-slug override key' => [
				[
					'Heading Tag' => [
						'target' => 'h1',
						'prop_key' => 'tag',
						'label' => 'Heading Tag',
					],
				],
				'override keys must be slugs',
			],
			'unknown target' => [
				[
					'heading_tag' => [
						'target' => 'does-not-exist',
						'prop_key' => 'tag',
						'label' => 'Heading Tag',
					],
				],
				'target "does-not-exist" was not found',
			],
			'duplicate target and prop key' => [
				[
					'heading_tag' => [
						'target' => 'h1',
						'prop_key' => 'tag',
						'label' => 'Heading Tag',
					],
					'heading_tag_duplicate' => [
						'target' => 'h1',
						'prop_key' => 'tag',
						'label' => 'Duplicate Heading Tag',
					],
				],
				'target "h1" and prop_key "tag" are duplicated',
			],
		];
	}

	public function test_build__does_not_mutate_elements_when_any_prop_is_invalid() {
		// Arrange
		$elements = [
			[
				'id' => 'h1',
				'elType' => 'widget',
				'widgetType' => 'e-heading',
				'settings' => [],
				'elements' => [],
			],
		];
		$original_elements = $elements;

		// Act
		$result = Overridable_Props_Builder::make()->build( $elements, [
			'heading_tag' => [
				'target' => 'h1',
				'prop_key' => 'tag',
				'label' => 'Heading Tag',
			],
			'missing_target' => [
				'target' => 'does-not-exist',
				'prop_key' => 'tag',
				'label' => 'Missing Target',
			],
		] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( $original_elements, $elements );
	}

	public function test_create__creates_nested_component_instances_and_exposes_their_props() {
		// Arrange
		$this->act_as_admin();
		Mock_Pro_License_API::set_license_state( true );
		$ability = new Manage_Component_Ability();
		$inner_component_id = $this->given_card_component( $ability );

		// Act
		$result = $ability->execute( [
			'action' => 'create',
			'title' => 'Cards Grid ' . uniqid(),
			'xml_structure' => '<e-flexbox configuration-id="grid"><e-component configuration-id="card-1"/><e-component configuration-id="card-2"/></e-flexbox>',
			'element_config' => [
				'card-1' => [ 'component_id' => $inner_component_id ],
				'card-2' => [ 'component_id' => $inner_component_id ],
			],
			'overridable_props' => [
				'card_1_caption' => [
					'target' => 'card-1',
					'prop_key' => 'caption',
					'label' => 'Card 1 Caption',
				],
				'card_2_caption' => [
					'target' => 'card-2',
					'prop_key' => 'caption',
					'label' => 'Card 2 Caption',
				],
			],
		] );

		// Assert
		$this->assertIsArray( $result, 'Expected success array but got: ' . $this->error_message( $result ) );
		$component = ( new Components_Repository() )->get( $result['component_id'], false );
		$instances = $component->get_elements_data()[0]['elements'];
		$this->assertCount( 2, $instances );
		$this->assertSame( 'e-component', $instances[0]['widgetType'] );
		$this->assertSame( 'e-component', $instances[1]['widgetType'] );
		$this->assertSame( $inner_component_id, $instances[0]['settings']['component_instance']['value']['component_id']['value'] );
		$this->assertSame( $inner_component_id, $instances[1]['settings']['component_instance']['value']['component_id']['value'] );
		$this->assertArrayHasKey( 'card_1_caption', $component->get_overridable_props()->props );
		$this->assertArrayHasKey( 'card_2_caption', $component->get_overridable_props()->props );
	}

	public function test_update__exposes_further_from_nested_e_component_instance() {
		// Arrange
		$this->act_as_admin();
		Mock_Pro_License_API::set_license_state( true );
		$ability = new Manage_Component_Ability();

		$inner_component_id = $this->given_card_component( $ability );
		$wrapper_component_id = $this->given_empty_wrapper( $ability, 'Cards Grid With Exposed Card Overrides' );

		// Act
		$result = $ability->execute( [
			'action' => 'update',
			'component_id' => $wrapper_component_id,
			'xml_structure' => '<e-flexbox configuration-id="grid"><e-component configuration-id="card-1"/></e-flexbox>',
			'element_config' => [
				'card-1' => [ 'component_id' => $inner_component_id ],
			],
			'overridable_props' => [
				'card_1_caption' => [
					'target' => 'card-1',
					'prop_key' => 'caption',
					'label' => 'Card 1 Caption',
					'group' => 'Card 1',
				],
			],
		] );

		// Assert
		$this->assertIsArray( $result, 'Expected success array but got: ' . $this->error_message( $result ) );
		$outer = ( new Components_Repository() )->get( $wrapper_component_id, false );

		$exposed = $outer->get_overridable_props()->props;
		$this->assertArrayHasKey( 'card_1_caption', $exposed );

		$prop = $exposed['card_1_caption'];
		$this->assertSame( 'e-component', $prop->widget_type );
		$this->assertSame( 'caption', $prop->prop_key );
		$this->assertSame( 'e-paragraph', $prop->origin_prop_fields['widget_type'] );
		$this->assertSame( 'paragraph', $prop->origin_prop_fields['prop_key'] );
		$this->assertNull( $prop->origin_value, 'Nothing was set per-instance, so there is no value to inherit.' );

		$nested_instance = $this->find_nested_component_instance( $outer->get_elements_data() );
		$overrides = $nested_instance['settings']['component_instance']['value']['overrides']['value'];
		$this->assertCount( 1, $overrides );
		$this->assertSame( 'overridable', $overrides[0]['$$type'] );
		$this->assertSame( 'card_1_caption', $overrides[0]['value']['override_key'] );

		$inner_override = $overrides[0]['value']['origin_value'];
		$this->assertSame( 'override', $inner_override['$$type'] );
		$this->assertSame( 'caption', $inner_override['value']['override_key'] );
		$this->assertSame( $inner_component_id, $inner_override['value']['schema_source']['id'] );
	}

	public function test_update__expose_further_absorbs_an_existing_element_config_override() {
		// Arrange
		$this->act_as_admin();
		Mock_Pro_License_API::set_license_state( true );
		$ability = new Manage_Component_Ability();

		$inner_component_id = $this->given_card_component( $ability );
		$wrapper_component_id = $this->given_empty_wrapper( $ability, 'Grid With Preset Caption' );
		// Act
		$result = $ability->execute( [
			'action' => 'update',
			'component_id' => $wrapper_component_id,
			'xml_structure' => '<e-flexbox configuration-id="grid"><e-component configuration-id="card-1"/></e-flexbox>',
			'element_config' => [
				'card-1' => [
					'component_id' => $inner_component_id,
					'overrides' => [ 'caption' => 'Preset Caption' ],
				],
			],
			'overridable_props' => [
				'card_1_caption' => [
					'target' => 'card-1',
					'prop_key' => 'caption',
					'label' => 'Card 1 Caption',
				],
			],
		] );

		// Assert
		$this->assertIsArray( $result, 'Expected success array but got: ' . $this->error_message( $result ) );
		$outer = ( new Components_Repository() )->get( $wrapper_component_id, false );

		$nested_instance = $this->find_nested_component_instance( $outer->get_elements_data() );
		$overrides = $nested_instance['settings']['component_instance']['value']['overrides']['value'];
		$this->assertCount( 1, $overrides, 'The literal override must be absorbed, not left beside the exposed envelope.' );
		$this->assertSame( 'overridable', $overrides[0]['$$type'] );

		$inner_override = $overrides[0]['value']['origin_value'];
		$this->assertSame( 'caption', $inner_override['value']['override_key'] );
		$this->assertSame( 'Preset Caption', $inner_override['value']['override_value']['value'] );

		$prop = $outer->get_overridable_props()->props['card_1_caption'];
		$this->assertSame( 'Preset Caption', $prop->origin_value['value'], 'The absorbed value becomes the exposed prop\'s inherited default.' );
	}

	public function test_update__expose_further_threads_origin_prop_fields_through_multi_hop() {
		// Arrange
		$this->act_as_admin();
		Mock_Pro_License_API::set_license_state( true );
		$ability = new Manage_Component_Ability();

		$inner_component_id = $this->given_card_component( $ability );
		$middle_component_id = $this->given_wrapper_exposing_from_inner( $ability, $inner_component_id, 'card_caption' );
		$outer_component_id = $this->given_empty_wrapper( $ability, 'Outer Wrapper' );

		// Act
		$result = $ability->execute( [
			'action' => 'update',
			'component_id' => $outer_component_id,
			'xml_structure' => '<e-flexbox configuration-id="root"><e-component configuration-id="middle"/></e-flexbox>',
			'element_config' => [
				'middle' => [ 'component_id' => $middle_component_id ],
			],
			'overridable_props' => [
				'outer_caption' => [
					'target' => 'middle',
					'prop_key' => 'card_caption',
					'label' => 'Outer Caption',
				],
			],
		] );

		// Assert
		$this->assertIsArray( $result, 'Expected success array but got: ' . $this->error_message( $result ) );
		$outer = ( new Components_Repository() )->get( $outer_component_id, false );

		$prop = $outer->get_overridable_props()->props['outer_caption'];
		$this->assertSame( 'e-paragraph', $prop->origin_prop_fields['widget_type'], 'origin_prop_fields must terminate at the raw widget, not at the middle e-component.' );
		$this->assertSame( 'paragraph', $prop->origin_prop_fields['prop_key'] );

		$this->assertSame( 'card_caption', $prop->prop_key, 'Outer must point at the middle component\'s override key, not the innermost one — the runtime resolves the chain one hop at a time.' );

		$nested_instance = $this->find_nested_component_instance( $outer->get_elements_data() );
		$inner_override = $nested_instance['settings']['component_instance']['value']['overrides']['value'][0]['value']['origin_value'];
		$this->assertSame( 'card_caption', $inner_override['value']['override_key'] );
		$this->assertSame( $middle_component_id, $inner_override['value']['schema_source']['id'] );
	}

	public function test_update__expose_further_fails_when_inner_override_key_does_not_exist() {
		// Arrange
		$this->act_as_admin();
		Mock_Pro_License_API::set_license_state( true );
		$ability = new Manage_Component_Ability();

		$inner_component_id = $this->given_card_component( $ability );
		$wrapper_component_id = $this->given_empty_wrapper( $ability, 'Bad Inner Override Key' );

		// Act
		$result = $ability->execute( [
			'action' => 'update',
			'component_id' => $wrapper_component_id,
			'xml_structure' => '<e-flexbox configuration-id="grid"><e-component configuration-id="card-1"/></e-flexbox>',
			'element_config' => [
				'card-1' => [ 'component_id' => $inner_component_id ],
			],
			'overridable_props' => [
				'card_1_missing' => [
					'target' => 'card-1',
					'prop_key' => 'does_not_exist_on_card',
					'label' => 'Missing',
				],
			],
		] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'invalid_overridable_props', $result->get_error_code() );
		$this->assertStringContainsString( 'no exposed override', $result->get_error_message() );
		$this->assertStringContainsString( 'caption', $result->get_error_message() );
	}

	public function test_create__expose_further_fails_when_e_component_has_no_component_id() {
		// Arrange
		$this->act_as_admin();
		Mock_Pro_License_API::set_license_state( true );
		$ability = new Manage_Component_Ability();

		// Act
		$result = $ability->execute( [
			'action' => 'create',
			'title' => 'No Inner Component',
			'xml_structure' => '<e-flexbox configuration-id="grid"><e-component configuration-id="card-1"/></e-flexbox>',
			'overridable_props' => [
				'card_1_caption' => [
					'target' => 'card-1',
					'prop_key' => 'caption',
					'label' => 'Card Caption',
				],
			],
		] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'invalid_overridable_props', $result->get_error_code() );
		$this->assertStringContainsString( 'no valid component_instance settings', $result->get_error_message() );
	}

	private function given_card_component( Manage_Component_Ability $ability ): int {
		$card = $ability->execute( [
			'action' => 'create',
			'title' => 'Card ' . uniqid(),
			'xml_structure' => '<e-flexbox configuration-id="card-root"><e-paragraph configuration-id="card-caption"/></e-flexbox>',
			'overridable_props' => [
				'caption' => [
					'target' => 'card-caption',
					'prop_key' => 'paragraph',
					'label' => 'Caption',
				],
			],
		] );

		$this->assertIsArray( $card, 'Card fixture create must succeed but got: ' . $this->error_message( $card ) );

		return (int) $card['component_id'];
	}

	private function given_empty_wrapper( Manage_Component_Ability $ability, string $title ): int {
		$wrapper = $ability->execute( [
			'action' => 'create',
			'title' => $title . ' ' . uniqid(),
		] );

		$this->assertIsArray( $wrapper, 'Empty wrapper create must succeed but got: ' . $this->error_message( $wrapper ) );

		return (int) $wrapper['component_id'];
	}

	private function given_wrapper_exposing_from_inner( Manage_Component_Ability $ability, int $inner_component_id, string $outer_key ): int {
		$wrapper_id = $this->given_empty_wrapper( $ability, 'Middle Wrapper' );

		$wrapper = $ability->execute( [
			'action' => 'update',
			'component_id' => $wrapper_id,
			'xml_structure' => '<e-flexbox configuration-id="wrap"><e-component configuration-id="nested"/></e-flexbox>',
			'element_config' => [
				'nested' => [ 'component_id' => $inner_component_id ],
			],
			'overridable_props' => [
				$outer_key => [
					'target' => 'nested',
					'prop_key' => 'caption',
					'label' => 'Wrapper Caption',
				],
			],
		] );

		$this->assertIsArray( $wrapper, 'Middle wrapper update must succeed but got: ' . $this->error_message( $wrapper ) );

		return $wrapper_id;
	}

	private function find_nested_component_instance( array $elements ): ?array {
		foreach ( $elements as $element ) {
			if ( ( $element['widgetType'] ?? null ) === 'e-component' ) {
				return $element;
			}

			if ( ! empty( $element['elements'] ) && is_array( $element['elements'] ) ) {
				$found = $this->find_nested_component_instance( $element['elements'] );
				if ( null !== $found ) {
					return $found;
				}
			}
		}

		return null;
	}

	// ---------------------------------------------------------------------
	// update
	// ---------------------------------------------------------------------

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

	public function test_update__rejects_empty_overridable_props_without_xml_structure() {
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
			'overridable_props' => [],
		] );

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
