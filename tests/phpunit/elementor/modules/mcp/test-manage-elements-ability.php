<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Core\Documents_Manager;
use Elementor\Elements_Manager;
use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Tags_Editor_Config;
use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Tags_Module;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\GlobalClasses\Global_Class_Post;
use Elementor\Modules\GlobalClasses\Global_Class_Post_Type;
use Elementor\Modules\GlobalClasses\Global_Classes_Labels;
use Elementor\Modules\GlobalClasses\Global_Classes_Order;
use Elementor\Modules\Mcp\Abilities\Build_Composition_Ability;
use Elementor\Modules\Mcp\Abilities\Manage_Elements_Ability;
use Elementor\Plugin;
use Elementor\Widgets_Manager;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Manage_Elements_Ability extends Elementor_Test_Base {

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
	}

	public function tearDown(): void {
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

		$this->assertOkOperation( $result, 0 );

		$elements = Plugin::$instance->documents->get( $post_id )->get_elements_data();
		$this->assertSame( $heading_id, $elements[0]['id'] );
		$this->assertEmpty( $elements[1]['elements'] ?? [] );
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
						'title' => [
							'content' => 'New Title',
							'children' => [],
						],
					],
				],
			],
		] );

		$this->assertOkOperation( $result, 0 );

		$node = $this->find_element_in_document( $post_id, $heading_id );
		$this->assertNotNull( $node );
		$this->assertSame( 'New Title', $node['settings']['title']['value']['content']['value'] );
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

	public function test_update__unhandled_style_declaration_warns_with_declaration_and_url_hint() {
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		$heading_id = $this->given_heading_on_document( $post_id );

		$result = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => [
				[
					'action' => 'update',
					'element_id' => $heading_id,
					'style' => [
						'background' => 'url(/wp-content/uploads/x.png) center/cover no-repeat',
					],
				],
			],
		] );

		$this->assertOkOperation( $result, 0 );
		$warnings = $result['results'][0]['warnings'] ?? [];
		$this->assertNotEmpty( $warnings );

		$warning = $warnings[0];
		$this->assertStringContainsString( 'background:', $warning );
		$this->assertStringContainsString( 'url(', $warning );
		$this->assertStringContainsString( 'URLs must be absolute', $warning );
		$this->assertStringContainsString( 'elementor://widgets/schema/', $warning );
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
					'style' => [ 'font-size' => '2rem' ],
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
					'settings' => [ 'title' => 'plain string title' ],
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
			'xml_structure' => '<e-heading configuration-id="h1"/>',
			'parent_id' => 'document',
			'style' => [ 'h1' => [ 'color' => '#ff0000' ] ],
		] );
		$this->assertIsArray( $build_result, 'build-composition failed: ' . ( is_wp_error( $build_result ) ? $build_result->get_error_message() : 'unknown' ) );
		$this->assertTrue( $build_result['success'] ?? false );
		$heading_id = $build_result['root_element_ids'][0];

		$update_result = ( new Manage_Elements_Ability() )->execute( [
			'post_id' => $post_id,
			'operations' => [
				[
					'action' => 'update',
					'element_id' => $heading_id,
					'style' => [ 'font-size' => '24px' ],
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
						'title' => [ 'content' => 'Bulk Title', 'children' => [] ],
					],
				],
				[
					'action' => 'duplicate',
					'element_id' => $container_id,
				],
				[
					'action' => 'move',
					'element_id' => $heading_id,
					'new_parent_id' => 'document',
					'index' => 0,
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
		$this->assertSame( $heading_id, $elements[0]['id'] );
		$this->assertCount( 3, $elements );

		$node = $this->find_element_in_document( $post_id, $heading_id );
		$this->assertSame( 'Bulk Title', $node['settings']['title']['value']['content']['value'] );
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

	public function test_move__rejects_v3_new_parent_id() {
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

		$this->assertIsArray( $result );
		$this->assertSame( 'error', $result['status'] );
		$this->assertSame( 'elementor_v3_not_supported', $result['results'][0]['code'] );
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
					'settings' => [ 'title' => [ 'content' => 'Survived', 'children' => [] ] ],
				],
			],
		] );

		$this->assertIsArray( $result );
		$this->assertSame( 'partial_error', $result['status'] );
		$this->assertSame( 'elementor_v3_not_supported', $result['results'][0]['code'] );
		$this->assertSame( 'ok', $result['results'][1]['status'] );

		$this->assertNotNull( $this->find_element_in_document( $post_id, $v3_id ) );
		$node = $this->find_element_in_document( $post_id, $v4_id );
		$this->assertSame( 'Survived', $node['settings']['title']['value']['content']['value'] );
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
						'title' => [ 'content' => 'Survived', 'children' => [] ],
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
		$this->assertSame( 'Survived', $node['settings']['title']['value']['content']['value'] );
	}

	private function assertOkOperation( $result, int $index ): void {
		$this->assertIsArray( $result, 'Expected success but got: ' . ( is_wp_error( $result ) ? $result->get_error_message() : 'unknown' ) );
		$this->assertSame( 'ok', $result['status'] );
		$this->assertSame( 'ok', $result['results'][ $index ]['status'] ?? null );
	}

	private function create_real_document(): int {
		return $this->factory()->create_and_get_default_post()->ID;
	}

	private function given_heading_on_document( int $post_id ): string {
		$this->act_as_admin();

		$result = ( new Build_Composition_Ability() )->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-heading configuration-id="h1"/>',
			'parent_id' => 'document',
		] );

		if ( is_wp_error( $result ) ) {
			$this->fail( 'Fixture setup failed: ' . $result->get_error_message() );
		}

		return $result['root_element_ids'][0];
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

		$class_id = 'g-' . strtolower( substr( md5( $label ), 0, 6 ) );
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
}
