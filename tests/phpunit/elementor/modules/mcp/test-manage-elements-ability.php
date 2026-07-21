<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Core\Documents_Manager;
use Elementor\Elements_Manager;
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

	public function test_execute__unknown_action_returns_bad_request() {
		$this->act_as_admin();
		$post_id = $this->create_real_document();

		$result = ( new Manage_Elements_Ability() )->execute( [
			'action' => 'noop',
			'post_id' => $post_id,
			'element_id' => 'anything',
		] );

		$this->assertWPError( $result );
		$this->assertSame( 'invalid_input', $result->get_error_code() );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
	}

	public function test_execute__missing_post_id_returns_bad_request() {
		$this->act_as_admin();

		$result = ( new Manage_Elements_Ability() )->execute( [
			'action' => 'delete',
			'element_id' => 'x',
		] );

		$this->assertWPError( $result );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
	}

	public function test_execute__forbidden_user_returns_403() {
		wp_set_current_user( $this->factory()->user->create( [ 'role' => 'subscriber' ] ) );
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		wp_set_current_user( $this->factory()->user->create( [ 'role' => 'subscriber' ] ) );

		$result = ( new Manage_Elements_Ability() )->execute( [
			'action' => 'delete',
			'post_id' => $post_id,
			'element_id' => 'x',
		] );

		$this->assertWPError( $result );
		$this->assertSame( 'elementor_forbidden', $result->get_error_code() );
		$this->assertSame( \WP_Http::FORBIDDEN, $result->get_error_data()['status'] );
	}

	public function test_execute__unknown_element_returns_not_found() {
		$this->act_as_admin();
		$post_id = $this->create_real_document();

		$result = ( new Manage_Elements_Ability() )->execute( [
			'action' => 'delete',
			'post_id' => $post_id,
			'element_id' => 'ghost',
		] );

		$this->assertWPError( $result );
		$this->assertSame( 'elementor_not_found', $result->get_error_code() );
		$this->assertSame( \WP_Http::NOT_FOUND, $result->get_error_data()['status'] );
	}

	public function test_delete__removes_element_from_document() {
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		$root_id = $this->given_heading_on_document( $post_id );

		$result = ( new Manage_Elements_Ability() )->execute( [
			'action' => 'delete',
			'post_id' => $post_id,
			'element_id' => $root_id,
		] );

		$this->assertNoErrors( $result );

		$this->assertNull( $this->find_element_in_document( $post_id, $root_id ) );
	}

	public function test_duplicate__clones_element_after_source_with_new_ids() {
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		[ $container_id, $heading_id ] = $this->given_container_with_heading( $post_id );

		$result = ( new Manage_Elements_Ability() )->execute( [
			'action' => 'duplicate',
			'post_id' => $post_id,
			'element_id' => $container_id,
		] );

		$this->assertNoErrors( $result );

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
			'action' => 'move',
			'post_id' => $post_id,
			'element_id' => $heading_id,
			'new_parent_id' => 'document',
			'index' => 0,
		] );

		$this->assertNoErrors( $result );

		$elements = Plugin::$instance->documents->get( $post_id )->get_elements_data();
		$this->assertSame( $heading_id, $elements[0]['id'] );
		$this->assertEmpty( $elements[1]['elements'] ?? [] );
	}

	public function test_move__missing_new_parent_id_returns_bad_request() {
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		$heading_id = $this->given_heading_on_document( $post_id );

		$result = ( new Manage_Elements_Ability() )->execute( [
			'action' => 'move',
			'post_id' => $post_id,
			'element_id' => $heading_id,
		] );

		$this->assertWPError( $result );
		$this->assertSame( 'invalid_input', $result->get_error_code() );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
	}

	public function test_update__merges_partial_settings_into_existing_element() {
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		$heading_id = $this->given_heading_on_document( $post_id );

		$result = ( new Manage_Elements_Ability() )->execute( [
			'action' => 'update',
			'post_id' => $post_id,
			'element_id' => $heading_id,
			'settings' => [
				'title' => [
					'$$type' => 'html-v3',
					'value' => [
						'content' => [ '$$type' => 'string', 'value' => 'New Title' ],
						'children' => [],
					],
				],
			],
		] );

		$this->assertNoErrors( $result );

		$node = $this->find_element_in_document( $post_id, $heading_id );
		$this->assertNotNull( $node );
		$this->assertSame( 'New Title', $node['settings']['title']['value']['content']['value'] );
	}

	public function test_update__rejects_unknown_prop_with_bad_request() {
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		$heading_id = $this->given_heading_on_document( $post_id );

		$result = ( new Manage_Elements_Ability() )->execute( [
			'action' => 'update',
			'post_id' => $post_id,
			'element_id' => $heading_id,
			'settings' => [
				'nonexistent_prop' => [ '$$type' => 'string', 'value' => 'x' ],
			],
		] );

		$this->assertWPError( $result );
		$this->assertSame( 'elementor_invalid_settings', $result->get_error_code() );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
	}

	public function test_update__applies_style_and_attaches_global_class_by_label() {
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		$heading_id = $this->given_heading_on_document( $post_id );
		$class_id = $this->given_kit_global_class( 'hero-heading', '#111111' );

		$result = ( new Manage_Elements_Ability() )->execute( [
			'action' => 'update',
			'post_id' => $post_id,
			'element_id' => $heading_id,
			'style' => [ 'font-size' => '2rem' ],
			'classes' => [ 'hero-heading' ],
		] );

		$this->assertNoErrors( $result );

		$node = $this->find_element_in_document( $post_id, $heading_id );
		$this->assertNotNull( $node );

		$class_values = $node['settings']['classes']['value'] ?? [];
		$this->assertContains( $class_id, $class_values );
		$this->assertNotEmpty( $node['styles'] ?? [] );
	}

	public function test_update__rejects_unknown_class_label() {
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		$heading_id = $this->given_heading_on_document( $post_id );

		$result = ( new Manage_Elements_Ability() )->execute( [
			'action' => 'update',
			'post_id' => $post_id,
			'element_id' => $heading_id,
			'classes' => [ 'missing-class' ],
		] );

		$this->assertWPError( $result );
		$this->assertSame( 'elementor_unknown_global_class', $result->get_error_code() );
	}

	private function assertNoErrors( $result ): void {
		$this->assertIsArray( $result, 'Expected success but got: ' . ( is_wp_error( $result ) ? $result->get_error_message() : 'unknown' ) );
		$this->assertSame( 'ok', $result['status'] );
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
