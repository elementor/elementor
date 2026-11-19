<?php

namespace Elementor\Testing\Modules\GlobalClasses;

use Elementor\Core\Utils\Template_Library_Import_Export_Utils;
use Elementor\Modules\GlobalClasses\Global_Class_Post_Type;
use Elementor\Modules\GlobalClasses\Global_Classes_Lock;
use Elementor\Modules\GlobalClasses\Global_Classes_Order;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\GlobalClasses\Utils\Template_Library_Global_Classes;
use Elementor\Modules\GlobalClasses\Utils\Template_Library_Global_Classes_Element_Transformer;
use Elementor\Modules\GlobalClasses\Utils\Template_Library_Global_Classes_Snapshot_Builder;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Template_Library_Global_Classes_Utils extends Elementor_Test_Base {

	public function setUp(): void {
		parent::setUp();

		( new Global_Class_Post_Type() )->register_post_type();
	}

	public function tearDown(): void {
		remove_all_filters( 'elementor/global_classes/lock/acquire_timeout' );
		$this->delete_lock_row();

		$kit = Plugin::$instance->kits_manager->get_active_kit();

		if ( $kit ) {
			$kit->delete_meta( Global_Classes_Repository::META_KEY_FRONTEND );
			$kit->delete_meta( Global_Classes_Repository::META_KEY_PREVIEW );
			$kit->delete_meta( Global_Classes_Order::META_KEY );
		}

		$post_ids = get_posts( [
			'post_type' => Global_Class_Post_Type::CPT,
			'post_status' => 'any',
			'posts_per_page' => -1,
			'fields' => 'ids',
		] );

		foreach ( $post_ids as $post_id ) {
			wp_delete_post( $post_id, true );
		}

		parent::tearDown();
	}

	private function seed_global_classes( array $items, array $order ): void {
		Global_Classes_Repository::make()->put( $items, $order );
	}

	public function test_extract_used_class_ids_from_elements_returns_unique_string_ids() {
		$elements = [
			[
				'id' => 'el-1',
				'elType' => 'widget',
				'settings' => [
					'classes' => [
						'value' => [ 'g-1', 'g-2', 'g-1', '', 12, null ],
					],
				],
				'elements' => [],
			],
			[
				'id' => 'el-2',
				'elType' => 'widget',
				'settings' => [
					'classes' => [
						'value' => [ 'g-3' ],
					],
				],
				'elements' => [],
			],
			[
				'id' => 'el-3',
				'elType' => 'widget',
				'settings' => [
					'classes' => [
						'value' => 'bad',
					],
				],
				'elements' => [],
			],
		];

		$result = Template_Library_Global_Classes_Snapshot_Builder::extract_used_class_ids_from_elements( $elements );

		$this->assertSame( [ 'g-1', 'g-2', 'g-3' ], $result );
	}

	public function test_build_snapshot_for_ids_filters_items_and_order() {
		$this->act_as_admin();

		$items = [
			'g-1' => [
				'id' => 'g-1',
				'type' => 'class',
				'label' => 'Primary',
				'variants' => [],
			],
			'g-2' => [
				'id' => 'g-2',
				'type' => 'class',
				'label' => 'Secondary',
				'variants' => [],
			],
		];

		$this->seed_global_classes( $items, [ 'g-2', 'g-1' ] );

		$snapshot = Template_Library_Global_Classes_Snapshot_Builder::build_snapshot_for_ids( [ 'g-1', 'g-2', 'g-missing', '' ] );

		$this->assertIsArray( $snapshot );
		$this->assertSame( [ 'g-2', 'g-1' ], $snapshot['order'] );
		$this->assertArrayHasKey( 'g-1', $snapshot['items'] );
		$this->assertArrayHasKey( 'g-2', $snapshot['items'] );
		$this->assertArrayNotHasKey( 'g-missing', $snapshot['items'] );
	}

	public function test_merge_snapshot_and_get_id_map_matches_by_label_ignoring_variants() {
		$this->act_as_admin();

		$this->seed_global_classes( [
			'g-1' => [
				'id' => 'g-1',
				'type' => 'class',
				'label' => 'Same',
				'variants' => [
					[
						'meta' => [
							'breakpoint' => 'desktop',
							'state' => null,
						],
						'props' => [
							'display' => [
								'$$type' => 'string',
								'value' => 'block',
							],
						],
					],
				],
			],
		], [ 'g-1' ] );

		$incoming = [
			'items' => [
				'g-remote' => [
					'id' => 'g-remote',
					'type' => 'class',
					'label' => 'Same',
					'variants' => [],
				],
			],
			'order' => [ 'g-remote' ],
		];

		$result = Template_Library_Global_Classes_Snapshot_Builder::merge_snapshot_and_get_id_map( $incoming );

		$this->assertArrayHasKey( 'g-remote', $result['id_map'] );
		$this->assertSame( 'g-1', $result['id_map']['g-remote'] );

		$current = Global_Classes_Repository::make()->all()->get();
		$this->assertCount( 1, $current['items'] );
		$this->assertArrayHasKey( 'g-1', $current['items'] );
	}

	public function test_merge_snapshot_matches_by_name_and_maps_id_when_content_equal() {
		$this->act_as_admin();

		$variants = [
			[
				'meta' => [
					'breakpoint' => 'desktop',
					'state' => null,
				],
				'props' => [
					'display' => [
						'$$type' => 'string',
						'value' => 'block',
					],
				],
			],
		];

		$this->seed_global_classes( [
			'g-existing' => [
				'id' => 'g-existing',
				'type' => 'class',
				'label' => 'Hero',
				'variants' => $variants,
			],
		], [ 'g-existing' ] );

		$incoming = [
			'items' => [
				'g-remote' => [
					'id' => 'g-remote',
					'type' => 'class',
					'label' => 'Hero',
					'variants' => $variants,
				],
			],
			'order' => [ 'g-remote' ],
		];

		$result = Template_Library_Global_Classes_Snapshot_Builder::merge_snapshot_and_get_id_map( $incoming );

		$this->assertArrayHasKey( 'g-remote', $result['id_map'] );
		$this->assertSame( 'g-existing', $result['id_map']['g-remote'] );

		$current = Global_Classes_Repository::make()->all()->get();
		$this->assertCount( 1, $current['items'] );
		$this->assertArrayHasKey( 'g-existing', $current['items'] );
	}

	public function test_merge_snapshot_skips_mapping_when_same_id_and_name_and_content() {
		$this->act_as_admin();

		$variants = [
			[
				'meta' => [
					'breakpoint' => 'desktop',
					'state' => null,
				],
				'props' => [
					'display' => [
						'$$type' => 'string',
						'value' => 'block',
					],
				],
			],
		];

		$this->seed_global_classes( [
			'g-1' => [
				'id' => 'g-1',
				'type' => 'class',
				'label' => 'Hero',
				'variants' => $variants,
			],
		], [ 'g-1' ] );

		$incoming = [
			'items' => [
				'g-1' => [
					'id' => 'g-1',
					'type' => 'class',
					'label' => 'Hero',
					'variants' => $variants,
				],
			],
			'order' => [ 'g-1' ],
		];

		$result = Template_Library_Global_Classes_Snapshot_Builder::merge_snapshot_and_get_id_map( $incoming );

		$this->assertEmpty( $result['id_map'] );

		$current = Global_Classes_Repository::make()->all()->get();
		$this->assertCount( 1, $current['items'] );
	}

	public function test_merge_snapshot_creates_new_when_no_name_match() {
		$this->act_as_admin();

		$this->seed_global_classes( [
			'g-1' => [
				'id' => 'g-1',
				'type' => 'class',
				'label' => 'Existing',
				'variants' => [],
			],
		], [ 'g-1' ] );

		$incoming = [
			'items' => [
				'g-2' => [
					'id' => 'g-2',
					'type' => 'class',
					'label' => 'Fresh',
					'variants' => [],
				],
			],
			'order' => [ 'g-2' ],
		];

		$result = Template_Library_Global_Classes_Snapshot_Builder::merge_snapshot_and_get_id_map( $incoming );

		$this->assertEmpty( $result['id_map'] );

		$current = Global_Classes_Repository::make()->all()->get();
		$this->assertCount( 2, $current['items'] );
		$this->assertArrayHasKey( 'g-2', $current['items'] );
	}

	public function test_rewrite_elements_classes_ids_updates_values() {
		$elements = [
			[
				'id' => 'el-1',
				'elType' => 'widget',
				'settings' => [
					'classes' => [
						'value' => [ 'g-1', 'g-2', '', 5, 'g-1' ],
					],
				],
				'elements' => [],
			],
		];

		$result = Template_Library_Global_Classes_Element_Transformer::rewrite_elements_classes_ids( $elements, [ 'g-1' => 'g-9' ] );

		$this->assertSame( [ 'g-9', 'g-2' ], $result[0]['settings']['classes']['value'] );
	}

	public function test_create_all_as_new_assigns_fresh_ids() {
		$this->act_as_admin();

		$this->seed_global_classes( [
			'g-1' => [
				'id' => 'g-1',
				'type' => 'class',
				'label' => 'Existing',
				'variants' => [],
			],
		], [ 'g-1' ] );

		$incoming = [
			'items' => [
				'g-remote' => [
					'id' => 'g-remote',
					'type' => 'class',
					'label' => 'Imported',
					'variants' => [],
				],
			],
			'order' => [ 'g-remote' ],
		];

		$result = Template_Library_Global_Classes_Snapshot_Builder::create_snapshot_as_new( $incoming );

		$this->assertArrayHasKey( 'g-remote', $result['id_map'] );
		$new_id = $result['id_map']['g-remote'];
		$this->assertStringStartsWith( 'g-', $new_id );
		$this->assertNotSame( 'g-remote', $new_id );

		$current = Global_Classes_Repository::make()->all()->get();
		$this->assertCount( 2, $current['items'] );
		$this->assertArrayHasKey( $new_id, $current['items'] );
	}

	public function test_create_all_as_new_with_label_collision_renames() {
		$this->act_as_admin();

		$this->seed_global_classes( [
			'g-1' => [
				'id' => 'g-1',
				'type' => 'class',
				'label' => 'Button',
				'variants' => [],
			],
		], [ 'g-1' ] );

		$incoming = [
			'items' => [
				'g-remote' => [
					'id' => 'g-remote',
					'type' => 'class',
					'label' => 'Button',
					'variants' => [],
				],
			],
			'order' => [ 'g-remote' ],
		];

		$result = Template_Library_Global_Classes_Snapshot_Builder::create_snapshot_as_new( $incoming );

		$new_id = $result['id_map']['g-remote'];
		$current = Global_Classes_Repository::make()->all()->get();
		$new_label = $current['items'][ $new_id ]['label'];

		$this->assertNotSame( 'Button', $new_label );
		$this->assertStringStartsWith( 'DUP_', $new_label );
	}

	public function test_flatten_elements_classes_replaces_global_with_local_style() {
		$elements = [
			[
				'id' => 'abc12345',
				'elType' => 'widget',
				'settings' => [
					'classes' => [
						'value' => [ 'g-1', 'e-1' ],
					],
				],
				'styles' => [
					'e-1' => [
						'id' => 'e-1',
						'label' => 'Local',
						'type' => 'class',
						'variants' => [],
					],
				],
				'elements' => [],
			],
		];

		$global_classes = [
			'items' => [
				'g-1' => [
					'id' => 'g-1',
					'type' => 'class',
					'label' => 'Main',
					'variants' => [
						[
							'meta' => [
								'breakpoint' => 'desktop',
								'state' => null,
							],
							'props' => [
								'color' => [
									'$$type' => 'color',
									'value' => '#fff',
								],
							],
						],
					],
				],
			],
		];

		$result = Template_Library_Global_Classes_Element_Transformer::flatten_elements_classes( $elements, $global_classes );

		$classes = $result[0]['settings']['classes']['value'];
		$this->assertCount( 2, $classes );
		$this->assertNotContains( 'g-1', $classes );
		$this->assertContains( 'e-1', $classes );

		$local_ids = array_values( array_filter( $classes, fn( $id ) => 'e-1' !== $id ) );
		$this->assertCount( 1, $local_ids );
		$local_id = $local_ids[0];

		$this->assertStringStartsWith( 'e-abc12345-', $local_id );
		$this->assertArrayHasKey( $local_id, $result[0]['styles'] );
		$this->assertSame( 'class', $result[0]['styles'][ $local_id ]['type'] );
		$this->assertSame( 'local', $result[0]['styles'][ $local_id ]['label'] );
		$this->assertNotEmpty( $result[0]['styles'][ $local_id ]['variants'] );
	}

	public function test_flatten_merges_into_existing_local_class() {
		$existing_variant = [
			'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
			'props' => [ 'padding' => [ '$$type' => 'size', 'value' => '10px' ] ],
		];

		$elements = [
			[
				'id' => 'abc12345',
				'elType' => 'widget',
				'settings' => [
					'classes' => [
						'value' => [ 'e-abc12345-local1', 'g-1' ],
					],
				],
				'styles' => [
					'e-abc12345-local1' => [
						'id' => 'e-abc12345-local1',
						'label' => 'local',
						'type' => 'class',
						'variants' => [ $existing_variant ],
					],
				],
				'elements' => [],
			],
		];

		$incoming_variant = [
			'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
			'props' => [ 'color' => [ '$$type' => 'color', 'value' => '#fff' ] ],
		];

		$global_classes = [
			'items' => [
				'g-1' => [
					'id' => 'g-1',
					'type' => 'class',
					'label' => 'Main',
					'variants' => [ $incoming_variant ],
				],
			],
		];

		$result = Template_Library_Global_Classes_Element_Transformer::flatten_elements_classes( $elements, $global_classes );

		$classes = $result[0]['settings']['classes']['value'];
		$this->assertContains( 'e-abc12345-local1', $classes );
		$this->assertNotContains( 'g-1', $classes );

		$local_style = $result[0]['styles']['e-abc12345-local1'];
		$this->assertSame( 'local', $local_style['label'] );
		$this->assertCount( 2, $local_style['variants'] );
		$this->assertSame( $existing_variant, $local_style['variants'][0] );
		$this->assertSame( $incoming_variant, $local_style['variants'][1] );
	}

	public function test_flatten_multiple_global_classes_creates_single_local_class() {
		$elements = [
			[
				'id' => 'abc12345',
				'elType' => 'widget',
				'settings' => [
					'classes' => [
						'value' => [ 'g-1', 'g-2' ],
					],
				],
				'styles' => [],
				'elements' => [],
			],
		];

		$variant_1 = [
			'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
			'props' => [ 'color' => [ '$$type' => 'color', 'value' => '#000' ] ],
		];

		$variant_2 = [
			'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
			'props' => [ 'padding' => [ '$$type' => 'size', 'value' => '8px' ] ],
		];

		$global_classes = [
			'items' => [
				'g-1' => [
					'id' => 'g-1',
					'type' => 'class',
					'label' => 'First',
					'variants' => [ $variant_1 ],
				],
				'g-2' => [
					'id' => 'g-2',
					'type' => 'class',
					'label' => 'Second',
					'variants' => [ $variant_2 ],
				],
			],
		];

		$result = Template_Library_Global_Classes_Element_Transformer::flatten_elements_classes( $elements, $global_classes );

		$classes = $result[0]['settings']['classes']['value'];
		$this->assertCount( 1, $classes );
		$this->assertNotContains( 'g-1', $classes );
		$this->assertNotContains( 'g-2', $classes );

		$local_id = $classes[0];
		$this->assertStringStartsWith( 'e-', $local_id );

		$local_style = $result[0]['styles'][ $local_id ];
		$this->assertSame( 'local', $local_style['label'] );
		$this->assertCount( 2, $local_style['variants'] );
		$this->assertSame( $variant_1, $local_style['variants'][0] );
		$this->assertSame( $variant_2, $local_style['variants'][1] );
	}

	public function test_flatten_does_not_duplicate_local_class_id_in_classes_value() {
		$elements = [
			[
				'id' => 'abc12345',
				'elType' => 'widget',
				'settings' => [
					'classes' => [
						'value' => [ 'g-1', 'g-2', 'e-some-other' ],
					],
				],
				'styles' => [
					'e-some-other' => [
						'id' => 'e-some-other',
						'label' => 'custom',
						'type' => 'class',
						'variants' => [],
					],
				],
				'elements' => [],
			],
		];

		$global_classes = [
			'items' => [
				'g-1' => [
					'id' => 'g-1',
					'type' => 'class',
					'label' => 'A',
					'variants' => [ [ 'meta' => [ 'breakpoint' => 'desktop', 'state' => null ], 'props' => [] ] ],
				],
				'g-2' => [
					'id' => 'g-2',
					'type' => 'class',
					'label' => 'B',
					'variants' => [ [ 'meta' => [ 'breakpoint' => 'mobile', 'state' => null ], 'props' => [] ] ],
				],
			],
		];

		$result = Template_Library_Global_Classes_Element_Transformer::flatten_elements_classes( $elements, $global_classes );

		$classes = $result[0]['settings']['classes']['value'];
		$local_class_ids = array_filter( $classes, fn( $id ) => $id !== 'e-some-other' );
		$this->assertCount( 1, $local_class_ids, 'Only one local class ID should be added for all flattened globals' );

		$styles = $result[0]['styles'];
		$local_styles = array_filter( $styles, fn( $s ) => 'local' === ( $s['label'] ?? '' ) );
		$this->assertCount( 1, $local_styles, 'Only one local style entry should exist' );
	}

	public function test_merge_snapshot_and_get_id_map_returns_lock_error_and_writes_nothing_when_lock_is_busy() {
		// Arrange - another request holds the per-kit lock.
		$this->act_as_admin();
		$this->seed_global_classes( [ 'g-1' => $this->make_class( 'g-1', 'Existing' ) ], [ 'g-1' ] );
		$this->hold_lock();

		// Act.
		$result = Template_Library_Global_Classes_Snapshot_Builder::merge_snapshot_and_get_id_map( $this->make_snapshot( 'g-remote', 'Imported' ) );

		// Assert - the import fails, it does not flatten, and nothing is written.
		$this->assertInstanceOf( \WP_Error::class, $result['error'] );
		$this->assertSame( Global_Classes_Lock::ERROR_CODE, $result['error']->get_error_code() );
		$this->assertSame( [], $result['id_map'] );
		$this->assertSame( [], $result['ids_to_flatten'] );
		$this->assertSame( [ 'g-1' ], array_keys( Global_Classes_Repository::make()->all()->get()['items'] ) );
		$this->assertNotNull( $this->lock_row(), 'The other request must keep its lock.' );
	}

	public function test_create_snapshot_as_new_returns_lock_error_and_writes_nothing_when_lock_is_busy() {
		// Arrange.
		$this->act_as_admin();
		$this->seed_global_classes( [ 'g-1' => $this->make_class( 'g-1', 'Existing' ) ], [ 'g-1' ] );
		$this->hold_lock();

		// Act.
		$result = Template_Library_Global_Classes_Snapshot_Builder::create_snapshot_as_new( $this->make_snapshot( 'g-remote', 'Imported' ) );

		// Assert.
		$this->assertInstanceOf( \WP_Error::class, $result['error'] );
		$this->assertSame( [], $result['ids_to_flatten'] );
		$this->assertSame( [ 'g-1' ], array_keys( Global_Classes_Repository::make()->all()->get()['items'] ) );
	}

	public function test_snapshot_import_releases_the_lock_after_it_finishes() {
		// Arrange.
		$this->act_as_admin();

		// Act.
		$merged = Template_Library_Global_Classes_Snapshot_Builder::merge_snapshot_and_get_id_map( $this->make_snapshot( 'g-a', 'LabelA' ) );
		$created = Template_Library_Global_Classes_Snapshot_Builder::create_snapshot_as_new( $this->make_snapshot( 'g-b', 'LabelB' ) );

		// Assert.
		$this->assertArrayNotHasKey( 'error', $merged );
		$this->assertArrayNotHasKey( 'error', $created );
		$this->assertCount( 2, Global_Classes_Repository::make()->all()->get()['items'] );
		$this->assertNull( $this->lock_row() );
	}

	public function test_snapshot_import_holds_the_lock_while_it_writes() {
		// Arrange.
		$this->act_as_admin();
		$lock_held_during_write = null;

		add_action( 'elementor/global_classes/update', function () use ( &$lock_held_during_write ) {
			$lock_held_during_write = null !== $this->lock_row();
		} );

		// Act.
		Template_Library_Global_Classes_Snapshot_Builder::merge_snapshot_and_get_id_map( $this->make_snapshot( 'g-a', 'LabelA' ) );

		// Assert.
		$this->assertTrue( $lock_held_during_write );
	}

	public function test_process_global_classes_import_returns_wp_error_when_lock_is_busy() {
		// Arrange.
		$this->act_as_admin();
		$this->hold_lock();

		$content = [ [ 'id' => 'el-1', 'elType' => 'widget', 'settings' => [ 'classes' => [ 'value' => [ 'g-remote' ] ] ], 'elements' => [] ] ];

		// Act.
		$result = Template_Library_Global_Classes::process_global_classes_import(
			[ 'content' => $content ],
			Template_Library_Import_Export_Utils::IMPORT_MODE_MATCH_SITE,
			[ 'global_classes' => $this->make_snapshot( 'g-remote', 'Imported' ) ]
		);

		// Assert - the import fails instead of flattening the class into a local style.
		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 409, $result->get_error_data()['status'] );
	}

	private function make_class( string $id, string $label ): array {
		return [
			'id' => $id,
			'type' => 'class',
			'label' => $label,
			'variants' => [],
		];
	}

	private function make_snapshot( string $id, string $label ): array {
		return [
			'items' => [ $id => $this->make_class( $id, $label ) ],
			'order' => [ $id ],
		];
	}

	private function lock_name(): string {
		return 'elementor_global_classes_lock_' . (int) Plugin::$instance->kits_manager->get_active_kit()->get_main_id();
	}

	private function hold_lock() {
		global $wpdb;

		add_filter( 'elementor/global_classes/lock/acquire_timeout', '__return_zero' );

		$wpdb->query( $wpdb->prepare(
			"INSERT INTO `$wpdb->options` ( `option_name`, `option_value`, `autoload` ) VALUES (%s, %s, 'off')",
			$this->lock_name(),
			time() . '|other-request'
		) );
	}

	private function lock_row() {
		global $wpdb;

		return $wpdb->get_var( $wpdb->prepare(
			"SELECT option_value FROM `$wpdb->options` WHERE option_name = %s",
			$this->lock_name()
		) );
	}

	private function delete_lock_row() {
		global $wpdb;

		$wpdb->delete( $wpdb->options, [ 'option_name' => $this->lock_name() ] );
	}
}
