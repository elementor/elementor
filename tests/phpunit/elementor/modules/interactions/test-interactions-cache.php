<?php

namespace Elementor\Testing\Modules\Interactions;

use Elementor\Core\Base\Document;
use Elementor\Modules\Interactions\Interactions_Cache;
use Elementor\Modules\Interactions\Interactions_Collector;
use Elementor\Modules\Interactions\Interactions_Data_Builder;
use Elementor\Modules\Interactions\Interactions_Frontend_Handler;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules
 * @group Elementor\Modules\Interactions
 * @group Elementor\Modules\Interactions\Interactions_Cache
 */
class Test_Interactions_Cache extends Elementor_Test_Base {

	public function setUp(): void {
		parent::setUp();
		Interactions_Collector::instance()->reset();
	}

	public function tearDown(): void {
		Interactions_Collector::instance()->reset();
		parent::tearDown();
	}

	private function sample_interactions_structure() {
		return [
			'items' => [
				[
					'$$type' => 'interaction-item',
					'value' => [
						'trigger' => [
							'$$type' => 'string',
							'value' => 'load',
						],
						'animation' => [
							'$$type' => 'animation-preset-props',
							'value' => [
								'effect' => [
									'$$type' => 'string',
									'value' => 'fade',
								],
							],
						],
					],
				],
			],
		];
	}

	private function sample_elements_tree( $element_id = 'widget-abc' ) {
		return [
			[
				'id' => $element_id,
				'elType' => 'widget',
				'widgetType' => 'e-heading',
				'interactions' => $this->sample_interactions_structure(),
				'elements' => [],
			],
		];
	}

	private function sample_elements_tree_widget_nested_in_parent( $parent_id = 'component-root', $child_id = 'nested-widget' ) {
		return [
			[
				'id' => $parent_id,
				'elType' => 'widget',
				'widgetType' => 'nested-generic',
				'elements' => [
					[
						'id' => $child_id,
						'elType' => 'widget',
						'widgetType' => 'e-heading',
						'interactions' => $this->sample_interactions_structure(),
						'elements' => [],
					],
				],
			],
		];
	}

	private function sample_elements_tree_parent_and_child_interactions(
		$parent_id = 'component-with-interactions',
		$child_id = 'child-with-interactions'
	) {
		$interactions = $this->sample_interactions_structure();

		return [
			[
				'id' => $parent_id,
				'elType' => 'widget',
				'widgetType' => 'nested-generic',
				'interactions' => $interactions,
				'elements' => [
					[
						'id' => $child_id,
						'elType' => 'widget',
						'widgetType' => 'e-button',
						'interactions' => $interactions,
						'elements' => [],
					],
				],
			],
		];
	}

	public function test_build_script_rows__produces_rows_with_element_id_and_interactions() {
		$element_id = 'el-build-test';
		$rows = Interactions_Data_Builder::build_script_rows( $this->sample_elements_tree( $element_id ) );

		$this->assertCount( 1, $rows );
		$this->assertSame( $element_id, $rows[0]['elementId'] );
		$this->assertSame( $element_id, $rows[0]['dataId'] );
		$this->assertIsArray( $rows[0]['interactions'] );
		$this->assertNotEmpty( $rows[0]['interactions'] );
	}

	public function test_build_script_rows__empty_tree_returns_empty_array() {
		$this->assertSame( [], Interactions_Data_Builder::build_script_rows( [] ) );
	}

	public function test_build_script_rows__collects_interactions_from_widget_nested_inside_component_like_parent() {
		$parent_id = 'outer-component';
		$child_id = 'inner-heading';
		$rows = Interactions_Data_Builder::build_script_rows(
			$this->sample_elements_tree_widget_nested_in_parent( $parent_id, $child_id )
		);

		$this->assertCount( 1, $rows );
		$this->assertSame( $child_id, $rows[0]['elementId'] );
		$this->assertSame( $child_id, $rows[0]['dataId'] );
		$this->assertNotEmpty( $rows[0]['interactions'] );
	}

	public function test_build_script_rows__collects_interactions_for_parent_and_nested_child() {
		$parent_id = 'parent-el';
		$child_id = 'nested-el';
		$rows = Interactions_Data_Builder::build_script_rows(
			$this->sample_elements_tree_parent_and_child_interactions( $parent_id, $child_id )
		);

		$this->assertCount( 2, $rows );

		$by_id = [];
		foreach ( $rows as $row ) {
			$by_id[ $row['elementId'] ] = $row;
		}

		$this->assertArrayHasKey( $parent_id, $by_id );
		$this->assertArrayHasKey( $child_id, $by_id );
		$this->assertSame( $parent_id, $by_id[ $parent_id ]['dataId'] );
		$this->assertSame( $child_id, $by_id[ $child_id ]['dataId'] );
		$this->assertNotEmpty( $by_id[ $parent_id ]['interactions'] );
		$this->assertNotEmpty( $by_id[ $child_id ]['interactions'] );
	}

	public function test_build_script_rows__collects_nested_interactions_under_container_el_type() {
		$container_id = 'container-outer';
		$nested_id = 'widget-inside-container';
		$tree = [
			[
				'id' => $container_id,
				'elType' => 'container',
				'elements' => [
					[
						'id' => $nested_id,
						'elType' => 'widget',
						'widgetType' => 'e-icon',
						'interactions' => $this->sample_interactions_structure(),
						'elements' => [],
					],
				],
			],
		];

		$rows = Interactions_Data_Builder::build_script_rows( $tree );

		$this->assertCount( 1, $rows );
		$this->assertSame( $nested_id, $rows[0]['elementId'] );
	}

	public function test_sync__stores_rows_for_nested_component_structure() {
		$post_id = $this->factory()->create_and_get_default_post()->ID;
		$parent_id = 'sync-parent';
		$child_id = 'sync-child';
		$tree = $this->sample_elements_tree_parent_and_child_interactions( $parent_id, $child_id );

		Interactions_Cache::sync( $post_id, $tree );

		$rows = Interactions_Cache::get_valid_rows( $post_id );
		$this->assertIsArray( $rows );
		$this->assertCount( 2, $rows );

		$ids = array_column( $rows, 'elementId' );
		sort( $ids );
		$this->assertSame( [ $child_id, $parent_id ], $ids );
	}

	public function test_collect_into_collector__registers_nested_widget_interactions() {
		$collector = Interactions_Collector::instance();
		$child_id = 'collector-nested';
		Interactions_Data_Builder::collect_into_collector(
			$this->sample_elements_tree_widget_nested_in_parent( 'collector-parent', $child_id ),
			$collector
		);

		$this->assertNotNull( $collector->get( $child_id ) );
		$this->assertNull( $collector->get( 'collector-parent' ) );
	}

	public function test_extract_interaction_items__reads_items_key() {
		$structure = $this->sample_interactions_structure();
		$items = Interactions_Data_Builder::extract_interaction_items( $structure );

		$this->assertSame( $structure['items'], $items );
	}

	public function test_sync__stores_meta_and_get_valid_rows_returns_it() {
		$post_id = $this->factory()->create_and_get_default_post()->ID;
		$tree = $this->sample_elements_tree( 'persist-el' );

		Interactions_Cache::sync( $post_id, $tree );

		$rows = Interactions_Cache::get_valid_rows( $post_id );
		$this->assertIsArray( $rows );
		$this->assertCount( 1, $rows );
		$this->assertSame( 'persist-el', $rows[0]['elementId'] );
		$this->assertArrayHasKey( 'interactions', $rows[0] );
	}

	public function test_sync__empty_elements_deletes_meta() {
		$post_id = $this->factory()->create_and_get_default_post()->ID;
		update_post_meta( $post_id, Interactions_Cache::META_KEY, [ 'stale' => true ] );

		Interactions_Cache::sync( $post_id, [] );

		$this->assertSame( '', get_post_meta( $post_id, Interactions_Cache::META_KEY, true ) );
		$this->assertNull( Interactions_Cache::get_valid_rows( $post_id ) );
	}

	public function test_get_valid_rows__returns_null_for_invalid_shape() {
		$post_id = $this->factory()->create_and_get_default_post()->ID;
		update_post_meta( $post_id, Interactions_Cache::META_KEY, [
			[ 'elementId' => '', 'interactions' => [] ],
		] );

		$this->assertNull( Interactions_Cache::get_valid_rows( $post_id ) );
	}

	public function test_should_skip_sync_for_save_data__true_when_autosave_status() {
		$this->assertTrue( Interactions_Cache::should_skip_sync_for_save_data( [
			'settings' => [ 'post_status' => Document::STATUS_AUTOSAVE ],
		] ) );
	}

	public function test_should_skip_sync_for_save_data__false_for_normal_save() {
		$this->assertFalse( Interactions_Cache::should_skip_sync_for_save_data( [
			'settings' => [ 'post_status' => 'publish' ],
		] ) );
		$this->assertFalse( Interactions_Cache::should_skip_sync_for_save_data( [] ) );
	}

	public function test_collect_document_interactions__uses_cache_without_walking_elements() {
		$post_id = $this->factory()->create_and_get_default_post()->ID;
		$cached_items = [
			[
				'$$type' => 'interaction-item',
				'value' => [ 'k' => 'v' ],
			],
		];
		update_post_meta( $post_id, Interactions_Cache::META_KEY, [
			[
				'elementId' => 'from-cache',
				'dataId' => 'from-cache',
				'interactions' => $cached_items,
			],
		] );

		$handler = new Interactions_Frontend_Handler( fn () => [] );

		$editor = Plugin::$instance->editor;

		try {
			$editor->set_edit_mode( false );
			$handler->collect_document_interactions(
				[
					[
						'id' => 'other-id',
						'elType' => 'section',
						'elements' => [],
					],
				],
				$post_id
			);
		} finally {
			$editor->set_edit_mode( null );
		}

		$stored = Interactions_Collector::instance()->get( 'from-cache' );
		$this->assertIsArray( $stored );
		$this->assertSame( $cached_items, $stored['items'] );
		$this->assertNull( Interactions_Collector::instance()->get( 'other-id' ) );
	}
}
