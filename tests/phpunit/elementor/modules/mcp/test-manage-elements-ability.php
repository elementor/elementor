<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Core\Documents_Manager;
use Elementor\Core\DynamicTags\Tag;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Elements_Manager;
use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Tags_Editor_Config;
use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Tags_Module;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\GlobalClasses\Global_Class_Post;
use Elementor\Modules\GlobalClasses\Global_Class_Post_Type;
use Elementor\Modules\GlobalClasses\Global_Classes_Labels;
use Elementor\Modules\GlobalClasses\Global_Classes_Order;
use Elementor\Modules\Interactions\Module as Interactions_Module;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Registry;
use Elementor\Modules\Mcp\Abilities\Build_Composition_Ability;
use Elementor\Modules\Mcp\Abilities\Manage_Elements_Ability;
use Elementor\Modules\Mcp\Module as Mcp_Module;
use Elementor\Plugin;
use Elementor\Widgets_Manager;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/fixtures/fake-v3-widget.php';

class Manage_Elements_V3_Heading_Dynamic_Tag extends Tag {
	public function get_name() {
		return 'mcp-v3-heading-title';
	}

	public function get_title() {
		return 'MCP V3 Heading Title';
	}

	public function get_group() {
		return 'site';
	}

	public function get_categories() {
		return [ 'text' ];
	}
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Manage_Elements_Ability extends Elementor_Test_Base {

	private Documents_Manager $original_documents;
	private Widgets_Manager $original_widgets_manager;
	private Elements_Manager $original_elements_manager;

	/**
	 * @var array<string, string>
	 */
	private array $original_experiment_states = [];

	public function setUp(): void {
		parent::setUp();

		global $wp_scripts, $wp_styles;
		$wp_scripts = new \WP_Scripts();
		$wp_styles = new \WP_Styles();

		$this->original_documents = Plugin::$instance->documents;
		$this->original_widgets_manager = Plugin::$instance->widgets_manager;
		$this->original_elements_manager = Plugin::$instance->elements_manager;
		$this->set_experiment_state( Mcp_Module::V3_STANDARDIZED_MAPS_EXPERIMENT_NAME, Experiments_Manager::STATE_INACTIVE );
	}

	public function tearDown(): void {
		foreach ( $this->original_experiment_states as $experiment_name => $default_state ) {
			Plugin::$instance->experiments->set_feature_default_state( $experiment_name, $default_state );
			delete_option( Experiments_Manager::OPTION_PREFIX . $experiment_name );
		}

		V3_Widget_Map_Registry::reset_instance();
		Plugin::$instance->dynamic_tags->unregister( 'mcp-v3-heading-title' );
		Plugin::$instance->documents = $this->original_documents;
		Plugin::$instance->widgets_manager = $this->original_widgets_manager;
		Plugin::$instance->elements_manager = $this->original_elements_manager;

		global $wp_scripts, $wp_styles;
		$wp_scripts = new \WP_Scripts();
		$wp_styles = new \WP_Styles();

		parent::tearDown();
	}

	public function test_execute__missing_post_id_returns_bad_request() {
		$this->act_as_admin();

		$result = ( new Manage_Elements_Ability() )->execute( [
			'operations' => [
				[ 'action' => 'delete', 'element_id' => 'x' ],
			],
		] );

		$this->assertWPError( $result );
		$this->assertSame( 'invalid_input', $result->get_error_code() );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
	}

	public function test_execute__missing_operations_returns_bad_request() {
		$this->act_as_admin();
		$post_id = $this->create_real_document();

		$result = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
		] );

		$this->assertWPError( $result );
		$this->assertSame( 'invalid_input', $result->get_error_code() );
	}

	public function test_execute__empty_operations_returns_bad_request() {
		$this->act_as_admin();
		$post_id = $this->create_real_document();

		$result = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => [],
		] );

		$this->assertWPError( $result );
		$this->assertSame( 'invalid_input', $result->get_error_code() );
	}

	public function test_execute__batch_size_exceeded() {
		$this->act_as_admin();
		$post_id = $this->create_real_document();

		$operations = array_fill( 0, Manage_Elements_Ability::MAX_BATCH_SIZE + 1, [
			'action' => 'delete',
			'element_id' => 'x',
		] );

		$result = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => $operations,
		] );

		$this->assertWPError( $result );
		$this->assertSame( 'batch_size_exceeded', $result->get_error_code() );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
	}

	public function test_execute__forbidden_user_returns_403_before_touching_ops() {
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		wp_set_current_user( $this->factory()->user->create( [ 'role' => 'subscriber' ] ) );

		$result = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => [
				[ 'action' => 'delete', 'element_id' => 'x' ],
			],
		] );

		$this->assertWPError( $result );
		$this->assertSame( 'elementor_forbidden', $result->get_error_code() );
		$this->assertSame( \WP_Http::FORBIDDEN, $result->get_error_data()['status'] );
	}

	public function test_execute__unknown_action_returns_per_op_error() {
		$this->act_as_admin();
		$post_id = $this->create_real_document();

		$result = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => [
				[ 'action' => 'noop', 'element_id' => 'anything' ],
			],
		] );

		$this->assertIsArray( $result );
		$this->assertSame( 'error', $result['status'] );
		$this->assertSame( 'error', $result['results'][0]['status'] );
		$this->assertSame( 'invalid_input', $result['results'][0]['code'] );
	}

	public function test_execute__unknown_element_returns_per_op_not_found() {
		$this->act_as_admin();
		$post_id = $this->create_real_document();

		$result = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => [
				[ 'action' => 'delete', 'element_id' => 'ghost' ],
			],
		] );

		$this->assertIsArray( $result );
		$this->assertSame( 'error', $result['status'] );
		$this->assertSame( 'elementor_not_found', $result['results'][0]['code'] );
	}

	public function test_delete__removes_element_from_document() {
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		$root_id = $this->given_heading_on_document( $post_id );

		$result = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => [
				[ 'action' => 'delete', 'element_id' => $root_id ],
			],
		] );

		$this->assertOkOperation( $result, 0 );
		$this->assertSame( $root_id, $result['results'][0]['element_id'] );
		$this->assertNotEmpty( $result['version'] );
		$this->assertArrayHasKey( 'edit_url', $result );
		$this->assertNotEmpty( $result['edit_url'] );
		$this->assertArrayNotHasKey( 'preview_url', $result );
		$this->assertArrayNotHasKey( 'llm_instructions', $result );
		$this->assertNull( $this->find_element_in_document( $post_id, $root_id ) );
	}

	public function test_duplicate__clones_element_after_source_with_new_ids() {
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		[ $container_id, $heading_id ] = $this->given_container_with_heading( $post_id );

		$result = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => [
				[ 'action' => 'duplicate', 'element_id' => $container_id ],
			],
		] );

		$this->assertOkOperation( $result, 0 );

		$elements = Plugin::$instance->documents->get( $post_id )->get_elements_data();
		$this->assertCount( 2, $elements );
		$this->assertSame( $container_id, $elements[0]['id'] );
		$this->assertNotSame( $container_id, $elements[1]['id'] );
		$this->assertNotSame( $heading_id, $elements[1]['elements'][0]['id'] ?? null );
	}

	public function test_move__reparents_element_to_document_root_at_index() {
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		[ , $inner_id ] = $this->given_nested_containers( $post_id );

		$result = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => [
				[
					'action' => 'move',
					'element_id' => $inner_id,
					'new_parent_id' => 'document',
					'index' => 0,
				],
			],
		] );

		$this->assertOkOperation( $result, 0 );

		$elements = Plugin::$instance->documents->get( $post_id )->get_elements_data();
		$this->assertSame( $inner_id, $elements[0]['id'] );
		$this->assertEmpty( $elements[1]['elements'] ?? [] );
	}

	public function test_move__rejects_reparenting_widget_to_document_root() {
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		[ $container_id, $heading_id ] = $this->given_container_with_heading( $post_id );

		$result = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => [
				[
					'action' => 'move',
					'element_id' => $heading_id,
					'new_parent_id' => 'document',
					'index' => 0,
				],
			],
		] );

		$this->assertIsArray( $result );
		$this->assertSame( 'error', $result['status'] );
		$this->assertSame( 'elementor_invalid_parent', $result['results'][0]['code'] );

		$container = $this->find_element_in_document( $post_id, $container_id );
		$this->assertSame( $heading_id, $container['elements'][0]['id'] ?? null );
	}

	public function test_move__missing_new_parent_id_returns_per_op_error() {
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		$heading_id = $this->given_heading_on_document( $post_id );

		$result = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => [
				[ 'action' => 'move', 'element_id' => $heading_id ],
			],
		] );

		$this->assertIsArray( $result );
		$this->assertSame( 'error', $result['status'] );
		$this->assertSame( 'invalid_input', $result['results'][0]['code'] );
	}

	public function test_update__merges_partial_settings_into_existing_element() {
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		$heading_id = $this->given_heading_on_document( $post_id );

		$result = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => [
				[
					'action' => 'update',
					'element_id' => $heading_id,
					'settings' => [
						'title' => 'New Title',
					],
				],
			],
		] );

		$this->assertOkOperation( $result, 0 );

		$node = $this->find_element_in_document( $post_id, $heading_id );
		$this->assertNotNull( $node );
		$this->assertSame( 'New Title', $node['settings']['title']['value'] );
	}

	public function test_update__skips_unknown_prop_with_warning() {
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		$heading_id = $this->given_heading_on_document( $post_id );

		$result = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => [
				[
					'action' => 'update',
					'element_id' => $heading_id,
					'settings' => [ 'nonexistent_prop' => 'x' ],
				],
			],
		] );

		$this->assertOkOperation( $result, 0 );
		$warnings = $result['results'][0]['warnings'] ?? [];
		$this->assertNotEmpty( $warnings );
		$this->assertStringContainsString( 'nonexistent_prop', $warnings[0] );
		$this->assertStringContainsString( 'skipped', $warnings[0] );
	}

	public function test_update__unknown_css_property_applies_without_error() {
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		$heading_id = $this->given_heading_on_document( $post_id );

		$result = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => [
				[
					'action' => 'update',
					'element_id' => $heading_id,
					'style' => 'background: url(https://example.com/x.png) center/cover no-repeat;',
				],
			],
		] );

		$this->assertOkOperation( $result, 0 );
	}

	public function test_update__applies_style_and_attaches_global_class_by_label() {
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		$heading_id = $this->given_heading_on_document( $post_id );
		$class_id = $this->given_kit_global_class( 'hero-heading', '#111111' );

		$result = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => [
				[
					'action' => 'update',
					'element_id' => $heading_id,
				'style' => 'font-size: 2rem;',
				'classes' => [ 'hero-heading' ],
			],
		],
	] );

	$this->assertOkOperation( $result, 0 );

	$node = $this->find_element_in_document( $post_id, $heading_id );
	$this->assertNotNull( $node );

		$class_values = $node['settings']['classes']['value'] ?? [];
		$this->assertContains( $class_id, $class_values );
		$this->assertNotEmpty( $node['styles'] ?? [] );
	}

	public function test_update__empty_classes_removes_globals_and_keeps_local_style() {
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		$heading_id = $this->given_heading_on_document( $post_id );
		$class_id = $this->given_kit_global_class( 'hero-heading', '#111111' );

		$attach = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => [
				[
			'action' => 'update',
				'element_id' => $heading_id,
				'style' => 'font-size: 2rem;',
				'classes' => [ 'hero-heading' ],
			],
		],
	] );

	$this->assertOkOperation( $attach, 0 );

		$node_before = $this->find_element_in_document( $post_id, $heading_id );
		$this->assertNotNull( $node_before );
		$class_values_before = $node_before['settings']['classes']['value'] ?? [];
		$this->assertContains( $class_id, $class_values_before );
		$local_ids = array_values( array_filter( $class_values_before, static fn( $id ) => is_string( $id ) && str_starts_with( $id, 'e-' ) ) );
		$this->assertCount( 1, $local_ids, 'Expected one local style id from applied style.' );

		$clear = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => [
				[
					'action' => 'update',
					'element_id' => $heading_id,
					'classes' => [],
				],
			],
		] );

		$this->assertOkOperation( $clear, 0 );

		$node_after = $this->find_element_in_document( $post_id, $heading_id );
		$this->assertNotNull( $node_after );
		$class_values_after = $node_after['settings']['classes']['value'] ?? [];
		$this->assertSame( $local_ids, $class_values_after, 'Expected only local style id to remain after clearing classes.' );
	}

	public function test_update__empty_classes_alone_is_a_valid_change() {
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		$heading_id = $this->given_heading_on_document( $post_id );

		$result = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => [
				[
					'action' => 'update',
					'element_id' => $heading_id,
					'classes' => [],
				],
			],
		] );

		$this->assertOkOperation( $result, 0 );
	}

	public function test_update__null_setting_removes_top_level_key() {
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		$heading_id = $this->given_heading_on_document( $post_id );

		$attach = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => [
				[
					'action' => 'update',
					'element_id' => $heading_id,
					'settings' => [
						'link' => [
							'destination' => 'https://example.com',
						],
					],
				],
			],
		] );

		$this->assertOkOperation( $attach, 0 );

		$node_before = $this->find_element_in_document( $post_id, $heading_id );
		$this->assertArrayHasKey( 'link', $node_before['settings'] ?? [] );

		$clear = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => [
				[
					'action' => 'update',
					'element_id' => $heading_id,
					'settings' => [
						'link' => null,
					],
				],
			],
		] );

		$this->assertOkOperation( $clear, 0 );

		$node_after = $this->find_element_in_document( $post_id, $heading_id );
		$this->assertNotNull( $node_after );
		$this->assertArrayNotHasKey( 'link', $node_after['settings'] ?? [] );
	}

	public function test_update__null_setting_alone_is_a_valid_change() {
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		$heading_id = $this->given_heading_on_document( $post_id );

		$result = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => [
				[
					'action' => 'update',
					'element_id' => $heading_id,
					'settings' => [
						'link' => null,
					],
				],
			],
		] );

		$this->assertOkOperation( $result, 0 );
	}

	public function test_update__null_setting_on_required_prop_returns_invalid_settings_error() {
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		$heading_id = $this->given_heading_on_document( $post_id );

		$node_before = $this->find_element_in_document( $post_id, $heading_id );
		$this->assertNotNull( $node_before );
		$title_before = $node_before['settings']['title'] ?? null;

		$result = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => [
				[
					'action' => 'update',
					'element_id' => $heading_id,
					'settings' => [
						'title' => null,
						'tag' => 'h99',
					],
				],
			],
		] );

		$this->assertIsArray( $result );
		$this->assertSame( 'error', $result['status'] );
		$this->assertSame( 'elementor_invalid_settings', $result['results'][0]['code'] );

		$node_after = $this->find_element_in_document( $post_id, $heading_id );
		$this->assertSame( $title_before, $node_after['settings']['title'] ?? null );
	}

	public function test_update__null_unknown_setting_warns_without_clearing() {
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		$heading_id = $this->given_heading_on_document( $post_id );

		$result = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => [
				[
					'action' => 'update',
					'element_id' => $heading_id,
					'settings' => [
						'nonexistent_prop' => null,
					],
				],
			],
		] );

		$this->assertOkOperation( $result, 0 );
		$warnings = $result['results'][0]['warnings'] ?? [];
		$this->assertNotEmpty( $warnings );
		$this->assertStringContainsString( 'nonexistent_prop', $warnings[0] );
		$this->assertStringContainsString( 'skipped', $warnings[0] );
	}

	public function test_update__rejects_unknown_class_label_as_per_op_error() {
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		$heading_id = $this->given_heading_on_document( $post_id );

		$result = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => [
				[
					'action' => 'update',
					'element_id' => $heading_id,
					'classes' => [ 'missing-class' ],
				],
			],
		] );

		$this->assertIsArray( $result );
		$this->assertSame( 'error', $result['status'] );
		$this->assertSame( 'elementor_unknown_global_class', $result['results'][0]['code'] );
	}

	public function test_update__applies_plain_dynamic_title() {
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		$heading_id = $this->given_heading_on_document( $post_id );

		$this->given_dynamic_tags( [
			'post-excerpt' => [
				'name' => 'post-excerpt',
				'label' => 'Post Excerpt',
				'group' => 'post',
				'categories' => [ 'text' ],
				'props_schema' => [
					'length' => String_Prop_Type::make()->default( '55' ),
				],
			],
		] );

		$result = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => [
				[
					'action' => 'update',
					'element_id' => $heading_id,
					'settings' => [
						'title' => [
							'name' => 'post-excerpt',
							'settings' => [ 'length' => '120' ],
						],
					],
				],
			],
		] );

		$this->assertOkOperation( $result, 0 );

		$node = $this->find_element_in_document( $post_id, $heading_id );
		$this->assertNotNull( $node );
		$this->assertSame( 'dynamic', $node['settings']['title']['$$type'] ?? null );
		$this->assertSame( 'post-excerpt', $node['settings']['title']['value']['name'] ?? null );
		$this->assertSame( '120', $node['settings']['title']['value']['settings']['length']['value'] ?? null );
	}

	public function test_update__rejects_invalid_title_shape_as_per_op_error() {
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		$heading_id = $this->given_heading_on_document( $post_id );

		$result = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => [
				[
					'action' => 'update',
					'element_id' => $heading_id,
					'settings' => [ 'title' => [ 'content' => 'not-a-valid-escaped-html-shape', 'children' => [] ] ],
				],
			],
		] );

		$this->assertIsArray( $result );
		$this->assertSame( 'error', $result['status'] );
		$this->assertSame( 'elementor_invalid_settings', $result['results'][0]['code'] );
	}

	public function test_update__style_merges_into_existing_local_style_from_build_composition() {
		$this->act_as_admin();
		$post_id = $this->create_real_document();

		$build_result = ( new Build_Composition_Ability() )->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-flexbox configuration-id="section"><e-heading configuration-id="h1"/></e-flexbox>',
			'parent_id' => 'document',
			'style' => [ 'h1' => 'color: #ff0000;' ],
		] );
		$this->assertIsArray( $build_result, 'build-composition failed: ' . ( is_wp_error( $build_result ) ? $build_result->get_error_message() : 'unknown' ) );
		$this->assertTrue( $build_result['success'] ?? false );
		$section_id = $build_result['root_element_ids'][0];
		$heading_id = $this->find_element_in_document( $post_id, $section_id )['elements'][0]['id'] ?? null;
		$this->assertNotNull( $heading_id );

		$update_result = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => [
				[
					'action' => 'update',
					'element_id' => $heading_id,
					'style' => 'font-size: 24px;',
				],
			],
		] );
		$this->assertOkOperation( $update_result, 0 );

		$node = $this->find_element_in_document( $post_id, $heading_id );
		$this->assertNotNull( $node );

		$this->assertCount( 1, $node['styles'] ?? [], 'Expected a single local style entry, got: ' . wp_json_encode( array_keys( $node['styles'] ?? [] ) ) );
		$this->assertCount( 1, $node['settings']['classes']['value'] ?? [], 'Expected settings.classes.value to hold a single local style id.' );

		$style = reset( $node['styles'] );
		$desktop_variant = $style['variants'][0] ?? [];
		$this->assertArrayHasKey( 'color', $desktop_variant['props'] ?? [] );
		$this->assertArrayHasKey( 'font-size', $desktop_variant['props'] ?? [] );
	}

	public function test_bulk__multiple_ops_persisted_in_single_save() {
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		[ $container_id, $heading_id ] = $this->given_container_with_heading( $post_id );

		$result = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => [
				[
					'action' => 'update',
					'element_id' => $heading_id,
					'settings' => [
						'title' => 'Bulk Title',
					],
				],
				[
					'action' => 'duplicate',
					'element_id' => $container_id,
				],
				[
					'action' => 'move',
					'element_id' => $container_id,
					'new_parent_id' => 'document',
					'index' => 1,
				],
			],
		] );

		$this->assertIsArray( $result );
		$this->assertSame( 'ok', $result['status'] );
		$this->assertCount( 3, $result['results'] );
		foreach ( $result['results'] as $row ) {
			$this->assertSame( 'ok', $row['status'] );
		}
		$this->assertNotEmpty( $result['version'] );

		$elements = Plugin::$instance->documents->get( $post_id )->get_elements_data();
		$this->assertCount( 2, $elements );
		$this->assertSame( $container_id, $elements[1]['id'] );

		$node = $this->find_element_in_document( $post_id, $heading_id );
		$this->assertSame( 'Bulk Title', $node['settings']['title']['value'] );
	}

	public function test_execute__rejects_v3_update_per_op() {
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		$v3_id = $this->given_v3_heading_on_document( $post_id );

		$result = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => [
				[
					'action' => 'update',
					'element_id' => $v3_id,
					'settings' => [ 'title' => 'x' ],
				],
			],
		] );

		$this->assertIsArray( $result );
		$this->assertSame( 'error', $result['status'] );
		$this->assertSame( 'elementor_v3_not_supported', $result['results'][0]['code'] );

		$node = $this->find_element_in_document( $post_id, $v3_id );
		$this->assertNotNull( $node );
		$this->assertArrayNotHasKey( 'title', $node['settings'] ?? [] );
	}

	public function test_update__applies_standardized_v3_heading_settings() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		$heading_id = $this->given_v3_heading_on_document( $post_id );
		$this->enable_standardized_v3_maps();

		// Act
		$result = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => [
				[
					'action' => 'update',
					'element_id' => $heading_id,
					'settings' => [
						'title' => 'Updated Heading',
						'tag' => 'h4',
					],
				],
			],
		] );

		// Assert
		$this->assertOkOperation( $result, 0 );
		$heading = $this->find_element_in_document( $post_id, $heading_id );
		$this->assertSame( 'Updated Heading', $heading['settings']['title'] ?? null );
		$this->assertSame( 'h4', $heading['settings']['header_size'] ?? null );
		$this->assertArrayNotHasKey( 'tag', $heading['settings'] );
	}

	public function test_update__rejects_invalid_standardized_v3_heading_settings_without_mutation() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		$heading_id = $this->given_v3_heading_on_document( $post_id );
		$this->enable_standardized_v3_maps();

		// Act
		$result = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => [
				[
					'action' => 'update',
					'element_id' => $heading_id,
					'settings' => [
						'title' => [ 'settings' => [] ],
						'tag' => 'h4',
					],
				],
			],
		] );

		// Assert
		$this->assertSame( 'error', $result['status'] );
		$this->assertSame( 'elementor_invalid_settings', $result['results'][0]['code'] );
		$heading = $this->find_element_in_document( $post_id, $heading_id );
		$this->assertArrayNotHasKey( 'title', $heading['settings'] ?? [] );
		$this->assertArrayNotHasKey( 'header_size', $heading['settings'] ?? [] );
	}

	public function test_update__rejects_dynamic_on_non_dynamic_mapped_heading_link() {
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		$heading_id = $this->given_v3_heading_on_document( $post_id );
		$this->enable_standardized_v3_maps();

		$result = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => [
				[
					'action' => 'update',
					'element_id' => $heading_id,
					'settings' => [
						'link' => [
							'name' => 'post-url',
							'settings' => [],
						],
					],
				],
			],
		] );

		$this->assertSame( 'error', $result['status'] );
		$this->assertSame( 'elementor_invalid_settings', $result['results'][0]['code'] );
		$this->assertStringContainsString( 'dynamic tags are not supported', $result['results'][0]['message'] );
	}

	public function test_update__applies_dynamic_standardized_v3_heading_title() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		$heading_id = $this->given_v3_heading_on_document( $post_id );
		$this->enable_standardized_v3_maps();
		$this->register_v3_heading_dynamic_tag();

		// Act
		$result = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => [
				[
					'action' => 'update',
					'element_id' => $heading_id,
					'settings' => [
						'title' => [
							'name' => 'mcp-v3-heading-title',
							'settings' => [],
						],
					],
				],
			],
		] );

		// Assert
		$this->assertOkOperation( $result, 0 );
		$heading = $this->find_element_in_document( $post_id, $heading_id );
		$dynamic_title = $heading['settings']['__dynamic__']['title'] ?? null;
		$this->assertIsString( $dynamic_title );
		$this->assertStringContainsString( 'mcp-v3-heading-title', $dynamic_title );

		$result = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => [
				[
					'action' => 'update',
					'element_id' => $heading_id,
					'settings' => [ 'title' => 'Static Heading' ],
				],
			],
		] );

		$this->assertOkOperation( $result, 0 );
		$heading = $this->find_element_in_document( $post_id, $heading_id );
		$this->assertSame( 'Static Heading', $heading['settings']['title'] ?? null );
		$this->assertArrayNotHasKey( 'title', $heading['settings']['__dynamic__'] ?? [] );
	}

	public function test_execute__rejects_v3_delete_move_duplicate_per_op() {
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		$v3_id = $this->given_v3_heading_on_document( $post_id );

		$result = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => [
				[ 'action' => 'delete', 'element_id' => $v3_id ],
				[ 'action' => 'duplicate', 'element_id' => $v3_id ],
				[ 'action' => 'move', 'element_id' => $v3_id, 'new_parent_id' => 'document', 'index' => 0 ],
			],
		] );

		$this->assertIsArray( $result );
		$this->assertSame( 'error', $result['status'] );
		foreach ( $result['results'] as $row ) {
			$this->assertSame( 'error', $row['status'] );
			$this->assertSame( 'elementor_v3_not_supported', $row['code'] );
		}
	}

	public function test_move__allows_moving_v4_element_into_v3_parent() {
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		$v4_heading_id = $this->given_heading_on_document( $post_id );
		$v3_container_id = $this->given_v3_container_on_document( $post_id );

		$result = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => [
				[
					'action' => 'move',
					'element_id' => $v4_heading_id,
					'new_parent_id' => $v3_container_id,
				],
			],
		] );

		$this->assertOkOperation( $result, 0 );

		$v3_container = $this->find_element_in_document( $post_id, $v3_container_id );
		$this->assertNotNull( $v3_container );
		$this->assertSame( $v4_heading_id, $v3_container['elements'][0]['id'] ?? null );
	}

	public function test_bulk__v3_op_fails_but_sibling_v4_op_still_applies() {
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		$v3_id = $this->given_v3_heading_on_document( $post_id );
		$v4_id = $this->given_heading_on_document( $post_id );

		$result = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => [
				[ 'action' => 'delete', 'element_id' => $v3_id ],
				[
					'action' => 'update',
					'element_id' => $v4_id,
					'settings' => [ 'title' => 'Survived' ],
				],
			],
		] );

		$this->assertIsArray( $result );
		$this->assertSame( 'partial_error', $result['status'] );
		$this->assertSame( 'elementor_v3_not_supported', $result['results'][0]['code'] );
		$this->assertSame( 'ok', $result['results'][1]['status'] );

		$this->assertNotNull( $this->find_element_in_document( $post_id, $v3_id ) );
		$node = $this->find_element_in_document( $post_id, $v4_id );
		$this->assertSame( 'Survived', $node['settings']['title']['value'] );
	}

	/**
	 * @dataProvider standardized_maps_states
	 */
	public function test_execute__allowlisted_v3_update_merges_raw_settings( bool $standardized_maps_active ) {
		$this->act_as_admin();
		$this->given_fake_v3_widget_registered( 'nav-menu' );
		$post_id = $this->create_real_document();
		$v3_id = $this->given_allowlisted_v3_widget_on_document( $post_id, 'nav-menu' );

		if ( $standardized_maps_active ) {
			$this->enable_standardized_v3_maps();
		}

		$result = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => [
				[
					'action' => 'update',
					'element_id' => $v3_id,
					'settings' => [ 'menu' => '3', 'layout' => 'horizontal' ],
				],
			],
		] );

		$this->assertOkOperation( $result, 0 );

		$node = $this->find_element_in_document( $post_id, $v3_id );
		$this->assertNotNull( $node );
		$this->assertSame( '3', $node['settings']['menu'] );
		$this->assertSame( 'horizontal', $node['settings']['layout'] );
	}

	public function standardized_maps_states(): array {
		return [
			'inactive' => [ false ],
			'active' => [ true ],
		];
	}

	public function test_execute__allowlisted_v3_static_update_preserves_dynamic_setting_when_standardized_maps_inactive() {
		$this->act_as_admin();
		$this->given_fake_v3_widget_registered( 'nav-menu' );
		$post_id = $this->create_real_document();
		$v3_id = $this->random_element_id();
		$this->register_v3_heading_dynamic_tag();
		$tag = Plugin::$instance->dynamic_tags->create_tag( 'legacy', 'mcp-v3-heading-title', [] );
		$this->assertInstanceOf( Tag::class, $tag );
		$shortcode = Plugin::$instance->dynamic_tags->tag_to_text( $tag );
		$this->append_elements_to_document( $post_id, [
			[
				'id' => $v3_id,
				'elType' => 'widget',
				'widgetType' => 'nav-menu',
				'settings' => [
					'__dynamic__' => [ 'menu' => $shortcode ],
				],
				'elements' => [],
			],
		] );

		$result = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => [
				[
					'action' => 'update',
					'element_id' => $v3_id,
					'settings' => [ 'menu' => '3' ],
				],
			],
		] );

		$this->assertOkOperation( $result, 0 );
		$node = $this->find_element_in_document( $post_id, $v3_id );
		$this->assertSame( '3', $node['settings']['menu'] );
		$this->assertArrayHasKey( 'menu', $node['settings']['__dynamic__'] ?? [] );
		$this->assertSame( $shortcode, $node['settings']['__dynamic__']['menu'] );
	}

	public function test_execute__allowlisted_v3_classes_write_to_css_classes() {
		$this->act_as_admin();
		$this->given_fake_v3_widget_registered( 'nav-menu' );
		$post_id = $this->create_real_document();
		$v3_id = $this->given_allowlisted_v3_widget_on_document( $post_id, 'nav-menu' );
		$this->given_kit_global_class( 'menu-primary', '#111111' );

		$result = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => [
				[
					'action' => 'update',
					'element_id' => $v3_id,
					'classes' => [ 'menu-primary' ],
				],
			],
		] );

		$this->assertOkOperation( $result, 0 );

		$node = $this->find_element_in_document( $post_id, $v3_id );
		$this->assertSame( 'menu-primary', $node['settings']['_css_classes'] ?? null );
		$this->assertArrayNotHasKey( 'classes', $node['settings'] );
	}

	public function test_execute__allowlisted_v3_style_bridged_to_custom_css_when_pro_active() {
		if ( ! \Elementor\Utils::has_pro() ) {
			$this->markTestSkipped( 'Requires Elementor Pro for custom_css bridge.' );
		}

		$this->act_as_admin();
		$this->given_fake_v3_widget_registered( 'nav-menu' );
		$post_id = $this->create_real_document();
		$v3_id = $this->given_allowlisted_v3_widget_on_document( $post_id, 'nav-menu' );

		$result = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => [
				[
					'action' => 'update',
					'element_id' => $v3_id,
					'style' => 'filter: blur(2px);',
				],
			],
		] );

		$this->assertOkOperation( $result, 0 );

		$node = $this->find_element_in_document( $post_id, $v3_id );
		$this->assertSame( 'selector { filter: blur(2px); }', $node['settings']['custom_css'] ?? null );
		$this->assertArrayNotHasKey( 'styles', $node );
	}

	public function test_execute__allowlisted_v3_style_warns_when_pro_missing() {
		if ( \Elementor\Utils::has_pro() ) {
			$this->markTestSkipped( 'Applies only when Pro is inactive.' );
		}

		$this->act_as_admin();
		$this->given_fake_v3_widget_registered( 'nav-menu' );
		$post_id = $this->create_real_document();
		$v3_id = $this->given_allowlisted_v3_widget_on_document( $post_id, 'nav-menu' );

		$result = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => [
				[
					'action' => 'update',
					'element_id' => $v3_id,
					'style' => 'filter: blur(2px);',
				],
			],
		] );

		$this->assertOkOperation( $result, 0 );
		$warnings = $result['results'][0]['warnings'] ?? [];
		$this->assertNotEmpty( $warnings );
		$this->assertTrue(
			(bool) array_filter(
				$warnings,
				static fn( $warning ) => false !== strpos( (string) $warning, 'Elementor Pro' )
			)
		);

		$node = $this->find_element_in_document( $post_id, $v3_id );
		$this->assertArrayNotHasKey( 'custom_css', $node['settings'] );
	}

	public function test_execute__allowlisted_v3_delete_succeeds() {
		$this->act_as_admin();
		$this->given_fake_v3_widget_registered( 'theme-post-content' );
		$post_id = $this->create_real_document();
		$v3_id = $this->given_allowlisted_v3_widget_on_document( $post_id, 'theme-post-content' );

		$result = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => [
				[ 'action' => 'delete', 'element_id' => $v3_id ],
			],
		] );

		$this->assertOkOperation( $result, 0 );
		$this->assertNull( $this->find_element_in_document( $post_id, $v3_id ) );
	}

	public function test_execute__update_persists_multiple_interactions_on_same_element() {
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		$heading_id = $this->given_heading_on_document( $post_id );

		$result = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => [
				[
					'action' => 'update',
					'element_id' => $heading_id,
					'interactions' => [
						[
							'interaction_id' => 'card-scroll',
							'trigger' => 'scrollIn',
							'animation' => [
								'effect' => 'slide',
								'type' => 'in',
								'direction' => 'bottom',
								'timing_config' => [
									'duration' => [ 'size' => 650, 'unit' => 'ms' ],
									'delay' => [ 'size' => 0, 'unit' => 'ms' ],
								],
								'config' => [ 'easing' => 'easeOut' ],
							],
						],
						[
							'interaction_id' => 'card-hover',
							'trigger' => 'hover',
							'animation' => [
								'effect' => 'scale',
								'type' => 'in',
								'timing_config' => [
									'duration' => [ 'size' => 250, 'unit' => 'ms' ],
									'delay' => [ 'size' => 0, 'unit' => 'ms' ],
								],
								'config' => [ 'easing' => 'easeOut' ],
							],
						],
					],
				],
			],
		] );

		$this->assertOkOperation( $result, 0 );

		$node = $this->find_element_in_document( $post_id, $heading_id );
		$interactions = $node['interactions'] ?? null;
		if ( is_string( $interactions ) ) {
			$interactions = json_decode( $interactions, true );
		}

		$this->assertIsArray( $interactions );
		$this->assertCount( 2, $interactions['items'] );
		$this->assertSame( 'scrollIn', $interactions['items'][0]['value']['trigger']['value'] );
		$this->assertSame( 'hover', $interactions['items'][1]['value']['trigger']['value'] );
	}

	public function test_execute__update_rejects_interactions_when_experiment_inactive() {
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		$heading_id = $this->given_heading_on_document( $post_id );

		$result = $this->with_interactions_inactive( function () use ( $post_id, $heading_id ) {
			return ( new Manage_Elements_Ability() )->execute( [
				'post_id' => $post_id,
				'operations' => [
					[
						'action' => 'update',
						'element_id' => $heading_id,
						'interactions' => [
							[
								'trigger' => 'scrollIn',
								'action' => [
									'type' => 'play',
								],
							],
						],
					],
				],
			] );
		} );

		$this->assertIsArray( $result );
		$this->assertSame( 'error', $result['results'][0]['status'] ?? null );
		$this->assertSame( 'elementor_invalid_interactions', $result['results'][0]['code'] ?? null );

		$node = $this->find_element_in_document( $post_id, $heading_id );
		$interactions = $node['interactions'] ?? null;
		if ( is_string( $interactions ) ) {
			$interactions = json_decode( $interactions, true );
		}
		$items = is_array( $interactions ) ? ( $interactions['items'] ?? $interactions ) : $interactions;
		$this->assertTrue( empty( $items ) );
	}

	public function test_bulk__failed_interactions_update_does_not_persist_settings() {
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		$heading_id = $this->given_heading_on_document( $post_id );

		$result = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => [
				[
					'action' => 'update',
					'element_id' => $heading_id,
					'settings' => [
						'title' => 'Saved',
					],
				],
				[
					'action' => 'update',
					'element_id' => $heading_id,
					'settings' => [
						'title' => 'Leaked',
					],
					'interactions' => [
						[
							'unknown_field' => 'nope',
						],
					],
				],
			],
		] );

		$this->assertIsArray( $result );
		$this->assertSame( 'partial_error', $result['status'] );
		$this->assertSame( 'ok', $result['results'][0]['status'] );
		$this->assertSame( 'error', $result['results'][1]['status'] );
		$this->assertSame( 'elementor_invalid_interactions', $result['results'][1]['code'] );

		$node = $this->find_element_in_document( $post_id, $heading_id );
		$this->assertSame( 'Saved', $node['settings']['title']['value'] );
	}

	public function test_bulk__partial_failure_still_saves_valid_ops() {
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		$heading_id = $this->given_heading_on_document( $post_id );

		$result = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => [
				[ 'action' => 'delete', 'element_id' => 'ghost' ],
				[
					'action' => 'update',
					'element_id' => $heading_id,
					'settings' => [
						'title' => 'Survived',
					],
				],
			],
		] );

		$this->assertIsArray( $result );
		$this->assertSame( 'partial_error', $result['status'] );
		$this->assertSame( 'error', $result['results'][0]['status'] );
		$this->assertSame( 'elementor_not_found', $result['results'][0]['code'] );
		$this->assertSame( 'ok', $result['results'][1]['status'] );
		$this->assertNotEmpty( $result['version'] );

		$node = $this->find_element_in_document( $post_id, $heading_id );
		$this->assertSame( 'Survived', $node['settings']['title']['value'] );
	}

	public function test_update__css_string_creates_desktop_variant_in_local_style() {
		// Arrange.
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		$heading_id = $this->given_heading_on_document( $post_id );

		// Act.
		$result = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => [
				[
					'action' => 'update',
					'element_id' => $heading_id,
					'style' => 'color: #ff0000;',
				],
			],
		] );

		// Assert.
		$this->assertOkOperation( $result, 0 );

		$node = $this->find_element_in_document( $post_id, $heading_id );
		$this->assertNotEmpty( $node['styles'] ?? [] );

		$style = reset( $node['styles'] );
		$this->assertSame( 'local', $style['label'] );
		$this->assertNotEmpty( $style['variants'] );

		$desktop_variant = $style['variants'][0] ?? [];
		$this->assertSame( 'desktop', $desktop_variant['meta']['breakpoint'] ?? null );
		$this->assertArrayHasKey( 'color', $desktop_variant['props'] ?? [] );
	}

	public function test_update__style_apply_mode_replace_wipes_existing_variants() {
		// Arrange.
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		$heading_id = $this->given_heading_on_document( $post_id );

		( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => [
				[
					'action' => 'update',
					'element_id' => $heading_id,
					'style' => 'color: #ff0000; font-size: 2rem;',
				],
			],
		] );

		// Act.
		$result = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => [
				[
					'action' => 'update',
					'element_id' => $heading_id,
					'style' => '',
					'style_apply_mode' => 'replace',
				],
			],
		] );

		// Assert.
		$this->assertOkOperation( $result, 0 );

		$node = $this->find_element_in_document( $post_id, $heading_id );
		$style = reset( $node['styles'] );
		$this->assertEmpty( $style['variants'] ?? [], 'replace + empty CSS must wipe all variants.' );
	}

	public function test_update__invalid_style_apply_mode_returns_error() {
		// Arrange.
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		$heading_id = $this->given_heading_on_document( $post_id );

		// Act.
		$result = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => [
				[
					'action' => 'update',
					'element_id' => $heading_id,
					'style' => 'color: red;',
					'style_apply_mode' => 'overwrite',
				],
			],
		] );

		// Assert.
		$this->assertIsArray( $result );
		$this->assertSame( 'error', $result['status'] );
		$this->assertSame( 'invalid_input', $result['results'][0]['code'] );
	}

	private function assertOkOperation( $result, int $index ): void {
		$this->assertIsArray( $result, 'Expected success but got: ' . ( is_wp_error( $result ) ? $result->get_error_message() : 'unknown' ) );
		$this->assertSame( 'ok', $result['status'] );
		$this->assertSame( 'ok', $result['results'][ $index ]['status'] ?? null );
	}

	private function create_real_document(): int {
		return $this->factory()->create_and_get_custom_post( [ 'post_status' => 'draft' ] )->ID;
	}

	private function given_heading_on_document( int $post_id ): string {
		[ , $heading_id ] = $this->given_container_with_heading( $post_id );

		return $heading_id;
	}

	private function given_nested_containers( int $post_id ): array {
		$this->act_as_admin();

		$result = ( new Build_Composition_Ability() )->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-flexbox configuration-id="outer"><e-flexbox configuration-id="inner"/></e-flexbox>',
			'parent_id' => 'document',
		] );

		if ( is_wp_error( $result ) ) {
			$this->fail( 'Fixture setup failed: ' . $result->get_error_message() );
		}

		$outer_id = $result['root_element_ids'][0];
		$inner_id = $this->find_element_in_document( $post_id, $outer_id )['elements'][0]['id'] ?? null;
		$this->assertNotNull( $inner_id );

		return [ $outer_id, $inner_id ];
	}

	private function given_container_with_heading( int $post_id ): array {
		$this->act_as_admin();

		$result = ( new Build_Composition_Ability() )->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-flexbox configuration-id="c1"><e-heading configuration-id="h1"/></e-flexbox>',
			'parent_id' => 'document',
		] );

		if ( is_wp_error( $result ) ) {
			$this->fail( 'Fixture setup failed: ' . $result->get_error_message() );
		}

		$container_id = $result['root_element_ids'][0];
		$elements = Plugin::$instance->documents->get( $post_id )->get_elements_data();

		foreach ( $elements as $element ) {
			if ( $element['id'] === $container_id ) {
				$heading_id = $element['elements'][0]['id'] ?? null;
				$this->assertNotNull( $heading_id );

				return [ $container_id, $heading_id ];
			}
		}

		$this->fail( 'Container not found after fixture setup.' );
	}

	private function given_v3_heading_on_document( int $post_id ): string {
		$id = $this->random_element_id();

		$this->append_elements_to_document( $post_id, [
			[
				'id' => $id,
				'elType' => 'widget',
				'widgetType' => 'heading',
				'settings' => [],
				'elements' => [],
			],
		] );

		return $id;
	}

	private function given_allowlisted_v3_widget_on_document( int $post_id, string $widget_type ): string {
		$id = $this->random_element_id();

		$this->append_elements_to_document( $post_id, [
			[
				'id' => $id,
				'elType' => 'widget',
				'widgetType' => $widget_type,
				'settings' => [],
				'elements' => [],
			],
		] );

		return $id;
	}

	private function given_fake_v3_widget_registered( string $type ): void {
		Plugin::$instance->widgets_manager->register( Fake_V3_Widget_Factory::create( $type ) );
	}

	private function enable_standardized_v3_maps(): void {
		$this->set_experiment_state( Mcp_Module::V3_STANDARDIZED_MAPS_EXPERIMENT_NAME, Experiments_Manager::STATE_ACTIVE );
		$this->set_experiment_state( Atomic_Widgets_Module::EXPERIMENT_NAME, Experiments_Manager::STATE_INACTIVE );
	}

	private function set_experiment_state( string $experiment_name, string $state ): void {
		if ( ! array_key_exists( $experiment_name, $this->original_experiment_states ) ) {
			$features = Plugin::$instance->experiments->get_features( $experiment_name );

			if ( empty( $features ) && Mcp_Module::V3_STANDARDIZED_MAPS_EXPERIMENT_NAME === $experiment_name ) {
				Plugin::$instance->experiments->add_feature( Mcp_Module::get_v3_standardized_maps_experimental_data() );
				$features = Plugin::$instance->experiments->get_features( $experiment_name );
			}

			$this->original_experiment_states[ $experiment_name ] = $features['default'] ?? Experiments_Manager::STATE_DEFAULT;
		}

		Plugin::$instance->experiments->set_feature_default_state( $experiment_name, $state );
		delete_option( Experiments_Manager::OPTION_PREFIX . $experiment_name );
		V3_Widget_Map_Registry::reset_instance();
	}

	private function register_v3_heading_dynamic_tag(): void {
		Plugin::$instance->dynamic_tags->register( new Manage_Elements_V3_Heading_Dynamic_Tag() );
	}

	private function given_v3_container_on_document( int $post_id ): string {
		$id = $this->random_element_id();

		$this->append_elements_to_document( $post_id, [
			[
				'id' => $id,
				'elType' => 'container',
				'settings' => [],
				'elements' => [],
			],
		] );

		return $id;
	}

	private function append_elements_to_document( int $post_id, array $new_elements ): void {
		$document = Plugin::$instance->documents->get( $post_id );
		$existing = $document->get_elements_data();
		$document->save( [ 'elements' => array_merge( is_array( $existing ) ? $existing : [], $new_elements ) ] );
	}

	private function random_element_id(): string {
		return substr( str_replace( '.', '', uniqid( '', true ) ), -7 );
	}

	private function find_element_in_document( int $post_id, string $id ): ?array {
		$document = Plugin::$instance->documents->get( $post_id );
		$elements = $document->get_elements_data();

		return $this->find_in_tree( $elements, $id );
	}

	private function find_in_tree( array $tree, string $id ): ?array {
		foreach ( $tree as $node ) {
			if ( isset( $node['id'] ) && $node['id'] === $id ) {
				return $node;
			}
			if ( ! empty( $node['elements'] ) ) {
				$found = $this->find_in_tree( $node['elements'], $id );
				if ( null !== $found ) {
					return $found;
				}
			}
		}

		return null;
	}

	private function given_dynamic_tags( array $tags ): void {
		$module = Dynamic_Tags_Module::fresh();

		$reflection = new \ReflectionClass( Dynamic_Tags_Editor_Config::class );
		$tags_prop = $reflection->getProperty( 'tags' );
		$tags_prop->setAccessible( true );
		$tags_prop->setValue( $module->registry, $tags );

		$module_reflection = new \ReflectionClass( Dynamic_Tags_Module::class );
		$instance_prop = $module_reflection->getProperty( 'instance' );
		$instance_prop->setAccessible( true );
		$instance_prop->setValue( null, $module );
	}

	private function given_kit_global_class( string $label, string $color ): string {
		( new Global_Class_Post_Type() )->register_post_type();
		$class_id = 'g-testcls';
		$data = [
			'type' => 'class',
			'variants' => [
				[
					'meta' => [
						'breakpoint' => 'desktop',
						'state' => null,
					],
					'props' => [
						'color' => [ '$$type' => 'color', 'value' => $color ],
					],
					'custom_css' => null,
				],
			],
		];

		Global_Class_Post::create( $class_id, $label, $data );

		$kit = Plugin::$instance->kits_manager->get_active_kit();
		Global_Classes_Order::make( $kit )->set_order( [ $class_id ] );
		Global_Classes_Labels::make( $kit )->set_labels( [ $class_id => $label ] );

		return $class_id;
	}

	private function with_interactions_inactive( callable $callback ) {
		$experiments = Plugin::$instance->experiments;
		$name = Interactions_Module::EXPERIMENT_NAME;
		$original_default = $experiments->get_features( $name )['default'];
		$feature_option_key = $experiments->get_feature_option_key( $name );
		$original_option = get_option( $feature_option_key );

		$experiments->set_feature_default_state( $name, Experiments_Manager::STATE_INACTIVE );
		update_option( $feature_option_key, Experiments_Manager::STATE_INACTIVE );

		try {
			return $callback();
		} finally {
			$experiments->set_feature_default_state( $name, $original_default );
			update_option( $feature_option_key, $original_option );
		}
	}
}
