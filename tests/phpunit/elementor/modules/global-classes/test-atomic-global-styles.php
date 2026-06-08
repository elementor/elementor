<?php

namespace Elementor\Testing\Modules\GlobalClasses;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\Styles\CacheValidity\Cache_Validity;
use Elementor\Modules\AtomicWidgets\Styles\Atomic_Styles_Manager;
use Elementor\Modules\GlobalClasses\Atomic_Global_Styles;
use Elementor\Modules\GlobalClasses\Global_Class_Post_Type;
use Elementor\Modules\GlobalClasses\Global_Classes_Labels;
use Elementor\Modules\GlobalClasses\Global_Classes_Order;
use Elementor\Modules\GlobalClasses\Global_Classes_Relations;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Atomic_Global_Styles extends Elementor_Test_Base {
	private $mock_global_classes = [
		'items' => [
			'g-4-123' => [
				'type' => 'class',
				'id' => 'g-4-123',
				'label' => 'pinky',
				'variants' => [
					[
						'meta' => [
							'breakpoint' => 'mobile',
							'state' => null,
						],
						'props' => [
							'color' => [
								'$$type' => 'color',
								'value' => 'pink',
							],
						],
					],
				],
			],
			'g-4-124' => [
				'id' => 'g-4-124',
				'type' => 'class',
				'label' => 'bluey',
				'variants' => [
					[
						'meta' => [
							'breakpoint' => 'desktop',
							'state' => null,
						],
						'props' => [
							'color' => [
								'$$type' => 'color',
								'value' => 'blue',
							],
						],
					],
				],
			],
		],
		'order' => [ 'g-4-124', 'g-4-123' ],
	];

	private $mock_atomic_styles_manager;

	public function setUp(): void {
		parent::setUp();

		( new Global_Class_Post_Type() )->register_post_type();

		$this->mock_atomic_styles_manager = $this->createMock( Atomic_Styles_Manager::class );

		remove_all_actions( 'elementor/atomic-widgets/styles/register' );
		remove_all_actions( 'elementor/atomic-widgets/settings/transformers/classes' );
	}

	public function tearDown(): void {
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		if ( $kit ) {
			$kit->delete_meta( Global_Classes_Repository::META_KEY_FRONTEND );
			$kit->delete_meta( Global_Classes_Repository::META_KEY_PREVIEW );
			$kit->delete_meta( Global_Classes_Labels::META_KEY_FRONTEND );
			$kit->delete_meta( Global_Classes_Labels::META_KEY_PREVIEW );
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

	public function test_register_styles__for_document_with_tracked_classes() {
		// Arrange.
		$relations = new Global_Classes_Relations();
		$global_classes = new Atomic_Global_Styles( $relations );
		$global_classes->register_hooks();

		$post_id = $this->factory()->post->create();
		$context = Global_Classes_Repository::CONTEXT_FRONTEND;

		$relations->set_styles_for_post( $post_id, [ 'g-4-123', 'g-4-124' ] );

		Global_Classes_Repository::make()->put(
			$this->mock_global_classes['items'],
			$this->mock_global_classes['order']
		);

		$expected = Collection::make( $this->mock_global_classes['order'] )
			->map( fn( $id ) => $this->mock_global_classes['items'][ $id ] ?? null )
			->filter( fn( $item ) => null !== $item )
			->map( function ( $item ) {
				$item['id'] = $item['label'];
				return $item;
			} )
			->reverse()
			->all();

		$this->mock_atomic_styles_manager
			->expects( $this->once() )
			->method( 'register' )
			->with(
				[ Atomic_Global_Styles::STYLES_KEY, $post_id, $context ],
				$this->callback( function ( $callback ) use ( $expected ) {
					$styles = $callback();
					$this->assertEquals( $expected, $styles );
					return true;
				} )
			);

		// Act.
		do_action( 'elementor/atomic-widgets/styles/register', $this->mock_atomic_styles_manager, [ $post_id ] );
	}

	public function test_register_styles__returns_only_document_classes() {
		// Arrange.
		$relations = new Global_Classes_Relations();
		$global_classes = new Atomic_Global_Styles( $relations );
		$global_classes->register_hooks();

		$post_id = $this->factory()->post->create();
		$context = Global_Classes_Repository::CONTEXT_FRONTEND;

		$relations->set_styles_for_post( $post_id, [ 'g-4-123' ] );

		Global_Classes_Repository::make()->put(
			$this->mock_global_classes['items'],
			$this->mock_global_classes['order']
		);

		$this->mock_atomic_styles_manager
			->expects( $this->once() )
			->method( 'register' )
			->with(
				[ Atomic_Global_Styles::STYLES_KEY, $post_id, $context ],
				$this->callback( function ( $callback ) {
					$styles = $callback();
					$this->assertCount( 1, $styles );
					$this->assertEquals( 'pinky', $styles[0]['label'] );
					return true;
				} )
			);

		// Act.
		do_action( 'elementor/atomic-widgets/styles/register', $this->mock_atomic_styles_manager, [ $post_id ] );
	}

	public function test_register_styles__returns_empty_for_document_without_classes() {
		// Arrange.
		$relations = new Global_Classes_Relations();
		$global_classes = new Atomic_Global_Styles( $relations );
		$global_classes->register_hooks();

		$post_id = $this->factory()->post->create();
		$context = Global_Classes_Repository::CONTEXT_FRONTEND;

		Global_Classes_Repository::make()->put(
			$this->mock_global_classes['items'],
			$this->mock_global_classes['order']
		);

		$this->mock_atomic_styles_manager
			->expects( $this->once() )
			->method( 'register' )
			->with(
				[ Atomic_Global_Styles::STYLES_KEY, $post_id, $context ],
				$this->callback( function ( $callback ) {
					$styles = $callback();
					$this->assertEmpty( $styles );
					return true;
				} )
			);

		// Act.
		do_action( 'elementor/atomic-widgets/styles/register', $this->mock_atomic_styles_manager, [ $post_id ] );
	}

	public function test_register_styles_ignores_order_entries_without_matching_items() {
		// Arrange.
		$global_classes = $this->create_atomic_global_styles();
		$global_classes->register_hooks();
		$context = Plugin::$instance->preview->is_editor_or_preview() ? Global_Classes_Repository::CONTEXT_PREVIEW : Global_Classes_Repository::CONTEXT_FRONTEND;

		$items = $this->mock_global_classes['items'];
		$order_with_orphans = [ 'g-missing-1', 'g-4-124', 'g-4-123', 'g-missing-2' ];

		$styles_repository = Global_Classes_Repository::make();

		$styles_repository->put( $items, $order_with_orphans );

		$synced_order = $styles_repository->all()->get_order()->all();

		$this->assertSame( [ 'g-4-124', 'g-4-123' ], $synced_order );
	}

	public function test_transform_classes_names() {
		// Arrange.
		$global_classes = $this->create_atomic_global_styles();
		$global_classes->register_hooks();

		Global_Classes_Repository::make()->put(
			[
				'g-2' => $this->minimal_global_class_item( 'g-2', 'pinky' ),
				'g-3' => $this->minimal_global_class_item( 'g-3', 'bluey' ),
			],
			[ 'g-2', 'g-3' ],
		);

		// Act.
		$result = apply_filters( 'elementor/atomic-widgets/settings/transformers/classes', [ 'e-1', 'g-2', 'g-3', 'd-1' ] );

		// Assert.
		$this->assertEquals( [ 'e-1', 'pinky', 'bluey', 'd-1' ], $result );
	}

	public function test_transform_classes_names__for_preview_mode() {
		// Arrange.
		$global_classes = $this->create_atomic_global_styles();
		$global_classes->register_hooks();

		global $wp_query;

		$wp_query->is_preview = true;

		Global_Classes_Repository::make()->put(
			[
				'g-only-frontend' => $this->minimal_global_class_item( 'g-only-frontend', 'frontend' ),
				'g-both' => $this->minimal_global_class_item( 'g-both', 'both' ),
			],
			[ 'g-only-frontend', 'g-both' ],
		);

		Global_Classes_Repository::make()->set_preview( true )->put(
			[
				'g-both' => $this->minimal_global_class_item( 'g-both', 'both' ),
				'g-only-preview' => $this->minimal_global_class_item( 'g-only-preview', 'preview' ),
			],
			[ 'g-only-frontend', 'g-both', 'g-only-preview' ],
		);

		// Act.
		$result = apply_filters(
			'elementor/atomic-widgets/settings/transformers/classes',
			[ 'g-only-frontend', 'g-both', 'g-only-preview' ]
		);

		// Assert.
		$this->assertEquals( [ 'frontend', 'both', 'preview' ], $result );
	}

	public function test_cache_invalidation_on_frontend_update() {
		// Arrange.
		$global_classes = $this->create_atomic_global_styles();
		$global_classes->register_hooks();
		$cache_validity = new Cache_Validity();

		// Act.
		$cache_validity->validate( [ Atomic_Global_Styles::STYLES_KEY, Global_Classes_Repository::CONTEXT_FRONTEND ] );
		$cache_validity->validate( [ Atomic_Global_Styles::STYLES_KEY, Global_Classes_Repository::CONTEXT_PREVIEW ] );

		// Assert.
		$this->assertTrue( $cache_validity->is_valid(
			[ Atomic_Global_Styles::STYLES_KEY, Global_Classes_Repository::CONTEXT_FRONTEND ]
		) );
		$this->assertTrue( $cache_validity->is_valid(
			[ Atomic_Global_Styles::STYLES_KEY, Global_Classes_Repository::CONTEXT_PREVIEW ]
		) );

		// Act.
		do_action( 'elementor/global_classes/update', Global_Classes_Repository::CONTEXT_FRONTEND, [
			'added' => [],
			'deleted' => [],
			'modified' => [],
			'order' => true
		] );

		// Assert.
		$this->assertFalse( $cache_validity->is_valid(
			[ Atomic_Global_Styles::STYLES_KEY, Global_Classes_Repository::CONTEXT_FRONTEND ]
		) );

		$this->assertFalse( $cache_validity->is_valid(
			[ Atomic_Global_Styles::STYLES_KEY, Global_Classes_Repository::CONTEXT_PREVIEW ]
		) );
	}

	public function test_cache_invalidation_on_preview_update() {
		// Arrange.
		$global_classes = $this->create_atomic_global_styles();
		$global_classes->register_hooks();
		$cache_validity = new Cache_Validity();

		// Act.
		$cache_validity->validate( [ Atomic_Global_Styles::STYLES_KEY, Global_Classes_Repository::CONTEXT_FRONTEND ] );
		$cache_validity->validate( [ Atomic_Global_Styles::STYLES_KEY, Global_Classes_Repository::CONTEXT_PREVIEW ] );

		// Assert.
		$this->assertTrue( $cache_validity->is_valid(
			[ Atomic_Global_Styles::STYLES_KEY, Global_Classes_Repository::CONTEXT_FRONTEND ]
		) );
		$this->assertTrue( $cache_validity->is_valid(
			[ Atomic_Global_Styles::STYLES_KEY, Global_Classes_Repository::CONTEXT_PREVIEW ]
		) );

		// Act.
		do_action( 'elementor/global_classes/update', Global_Classes_Repository::CONTEXT_PREVIEW, [
			'added' => [],
			'deleted' => [],
			'modified' => [],
			'order' => true
		] );

		// Assert.
		$this->assertTrue( $cache_validity->is_valid(
			[ Atomic_Global_Styles::STYLES_KEY, Global_Classes_Repository::CONTEXT_FRONTEND ]
		) );

		$this->assertFalse( $cache_validity->is_valid(
			[ Atomic_Global_Styles::STYLES_KEY, Global_Classes_Repository::CONTEXT_PREVIEW ]
		) );
	}

	public function test_cache_invalidation_when_repository_deletes_class_used_on_document() {
		// Arrange.
		$relations = new Global_Classes_Relations();
		$global_classes = new Atomic_Global_Styles( $relations );
		$global_classes->register_hooks();
		$cache_validity = new Cache_Validity();
		$deleted_class_id = 'g-4-123';
		$document_post_id = $this->factory()->post->create();
		$cache_path = [ Atomic_Global_Styles::STYLES_KEY, $document_post_id, Global_Classes_Repository::CONTEXT_FRONTEND ];

		Global_Classes_Repository::make()->put(
			$this->mock_global_classes['items'],
			$this->mock_global_classes['order']
		);

		$relations->set_styles_for_post( $document_post_id, [ $deleted_class_id, 'g-4-124' ] );
		$cache_validity->validate( $cache_path );

		$this->assertTrue( $cache_validity->is_valid( $cache_path ) );

		$remaining_items = array_filter(
			$this->mock_global_classes['items'],
			fn( $item ) => $deleted_class_id !== $item['id']
		);
		$remaining_order = array_values( array_filter(
			$this->mock_global_classes['order'],
			fn( $id ) => $deleted_class_id !== $id
		) );

		// Act.
		Global_Classes_Repository::make()->put( $remaining_items, $remaining_order );

		// Assert.
		$this->assertFalse( $cache_validity->is_valid( $cache_path ) );
	}

	public function test_cache_invalidation_on_global_cache_clear() {
		// Arrange.
		$global_classes = $this->create_atomic_global_styles();
		$global_classes->register_hooks();

		$cache_validity = new Cache_Validity();

		// Act.
		$cache_validity->validate( [ Atomic_Global_Styles::STYLES_KEY, Global_Classes_Repository::CONTEXT_FRONTEND ] );
		$cache_validity->validate( [ Atomic_Global_Styles::STYLES_KEY, Global_Classes_Repository::CONTEXT_PREVIEW ] );

		do_action( 'elementor/core/files/clear_cache' );

		// Assert.
		$this->assertFalse( $cache_validity->is_valid(
			[ Atomic_Global_Styles::STYLES_KEY, Global_Classes_Repository::CONTEXT_FRONTEND ]
		) );
		$this->assertFalse( $cache_validity->is_valid(
			[ Atomic_Global_Styles::STYLES_KEY, Global_Classes_Repository::CONTEXT_PREVIEW ]
		) );
	}

	public function test_register_styles__aggregates_classes_from_embedded_posts() {
		// Arrange.
		$relations = new Global_Classes_Relations();
		$global_classes = new Atomic_Global_Styles( $relations );
		$global_classes->register_hooks();

		$parent_id = $this->factory()->post->create();
		$child_id  = $this->factory()->post->create();
		$context   = Global_Classes_Repository::CONTEXT_FRONTEND;

		// Parent uses g-4-124, child uses g-4-123.
		$relations->set_styles_for_post( $parent_id, [ 'g-4-124' ] );
		$relations->set_styles_for_post( $child_id, [ 'g-4-123' ] );

		Global_Classes_Repository::make()->put(
			$this->mock_global_classes['items'],
			$this->mock_global_classes['order']
		);

		// Register a filter handler that declares $child_id as embedded in $parent_id.
		add_filter( 'elementor/document/related_posts', function( $related, $post_id ) use ( $parent_id, $child_id ) {
			if ( (int) $post_id === $parent_id ) {
				$related[] = $child_id;
			}
			return $related;
		}, 10, 2 );

		$registered_callbacks = [];
		$this->mock_atomic_styles_manager
			->method( 'register' )
			->willReturnCallback( function( $key, $callback ) use ( &$registered_callbacks ) {
				$registered_callbacks[ $key[1] ] = $callback;
			} );

		// Act.
		do_action( 'elementor/atomic-widgets/styles/register', $this->mock_atomic_styles_manager, [ $parent_id, $child_id ] );

		// Assert: parent was registered with both classes; child was skipped.
		$this->assertArrayHasKey( $parent_id, $registered_callbacks, 'Parent post should be registered.' );
		$this->assertArrayNotHasKey( $child_id, $registered_callbacks, 'Embedded child should not produce a separate entry.' );

		// The parent's CSS callback must contain classes from both parent and child.
		$styles = $registered_callbacks[ $parent_id ]();
		$labels = array_column( $styles, 'label' );
		$this->assertContains( 'pinky', $labels, 'Child class should be merged into parent CSS.' );
		$this->assertContains( 'bluey', $labels, 'Parent class should be present.' );

		remove_all_filters( 'elementor/document/related_posts' );
	}

	public function test_register_styles__skips_embedded_post_from_producing_own_entry() {
		// Arrange.
		$relations = new Global_Classes_Relations();
		$global_classes = new Atomic_Global_Styles( $relations );
		$global_classes->register_hooks();

		$parent_id = $this->factory()->documents->create_and_get()->get_main_id();
		$child_id  = $this->factory()->documents->create_and_get()->get_main_id();

		$relations->set_styles_for_post( $parent_id, [ 'g-4-124' ] );
		$relations->set_styles_for_post( $child_id,  [ 'g-4-123' ] );

		Global_Classes_Repository::make()->put(
			$this->mock_global_classes['items'],
			$this->mock_global_classes['order']
		);

		add_filter( 'elementor/document/related_posts', function( $related, $post_id ) use ( $parent_id, $child_id ) {
			if ( (int) $post_id === $parent_id ) {
				$related[] = $child_id;
			}
			return $related;
		}, 10, 2 );

		$register_call_count = 0;
		$this->mock_atomic_styles_manager
			->method( 'register' )
			->willReturnCallback( function() use ( &$register_call_count ) {
				$register_call_count++;
			} );

		// Act: pass both post ids (as would happen in a real request).
		do_action( 'elementor/atomic-widgets/styles/register', $this->mock_atomic_styles_manager, [ $parent_id, $child_id ] );

		// Assert: only one registration (the parent's aggregated entry).
		$this->assertSame( 1, $register_call_count, 'Exactly one global CSS entry should be registered.' );

		remove_all_filters( 'elementor/document/related_posts' );
	}

	public function test_invalidate_cache__also_invalidates_parent_when_child_class_changes() {
		// Arrange.
		$relations     = new Global_Classes_Relations();
		$global_classes = new Atomic_Global_Styles( $relations );
		$global_classes->register_hooks();
		$cache_validity = new Cache_Validity();

		$parent_id = $this->factory()->documents->create_and_get()->get_main_id();
		$child_id  = $this->factory()->documents->create_and_get()->get_main_id();

		$relations->set_styles_for_post( $parent_id, [ 'g-4-124' ] );
		$relations->set_styles_for_post( $child_id,  [ 'g-4-123' ] );

		Global_Classes_Repository::make()->put(
			$this->mock_global_classes['items'],
			$this->mock_global_classes['order']
		);

		add_filter( 'elementor/document/related_posts', function( $related, $post_id ) use ( $parent_id, $child_id ) {
			if ( (int) $post_id === $parent_id ) {
				$related[] = $child_id;
			}
			return $related;
		}, 10, 2 );

		$this->mock_atomic_styles_manager->method( 'register' )->willReturn( null );

		// Populate the relation map by triggering a styles registration.
		do_action( 'elementor/atomic-widgets/styles/register', $this->mock_atomic_styles_manager, [ $parent_id, $child_id ] );

		// Seed valid cache entries for both posts.
		$context = Global_Classes_Repository::CONTEXT_FRONTEND;
		$cache_validity->validate( [ Atomic_Global_Styles::STYLES_KEY, $parent_id, $context ] );
		$cache_validity->validate( [ Atomic_Global_Styles::STYLES_KEY, $child_id,  $context ] );

		// Act: a class used by the child post changes.
		do_action( 'elementor/global_classes/update', $context, [
			'added'    => [],
			'deleted'  => [],
			'modified' => [ 'g-4-123' ],
			'order'    => false,
		] );

		// Assert: parent's cache must also be invalidated.
		$this->assertFalse(
			$cache_validity->is_valid( [ Atomic_Global_Styles::STYLES_KEY, $parent_id, $context ] ),
			'Parent cache must be invalidated when an embedded child\'s class changes.'
		);

		remove_all_filters( 'elementor/document/related_posts' );
	}

	public function test_on_document_save__invalidates_parent_cache() {
		// Arrange.
		$relations      = new Global_Classes_Relations();
		$global_classes = new Atomic_Global_Styles( $relations );
		$global_classes->register_hooks();
		$cache_validity = new Cache_Validity();

		$parent_doc = $this->factory()->documents->create_and_get();
		$child_doc  = $this->factory()->documents->create_and_get();
		$parent_id  = $parent_doc->get_main_id();
		$child_id   = $child_doc->get_main_id();

		$relations->set_styles_for_post( $parent_id, [ 'g-4-124' ] );
		$relations->set_styles_for_post( $child_id,  [ 'g-4-123' ] );

		Global_Classes_Repository::make()->put(
			$this->mock_global_classes['items'],
			$this->mock_global_classes['order']
		);

		add_filter( 'elementor/document/related_posts', function( $related, $post_id ) use ( $parent_id, $child_id ) {
			if ( (int) $post_id === $parent_id ) {
				$related[] = $child_id;
			}
			return $related;
		}, 10, 2 );

		$this->mock_atomic_styles_manager->method( 'register' )->willReturn( null );

		// Populate the relation map.
		do_action( 'elementor/atomic-widgets/styles/register', $this->mock_atomic_styles_manager, [ $parent_id, $child_id ] );

		$context = Global_Classes_Repository::CONTEXT_FRONTEND;
		$cache_path = [ Atomic_Global_Styles::STYLES_KEY, $parent_id, $context ];

		// Seed a valid parent cache entry (must match the context used at registration time).
		$cache_validity->validate( $cache_path );

		// Act: the child document is saved.
		do_action( 'elementor/document/after_save', $child_doc, [] );

		// Assert: parent cache is now invalid.
		$this->assertFalse(
			$cache_validity->is_valid( $cache_path ),
			'Parent cache must be invalidated when an embedded child document is saved.'
		);

		remove_all_filters( 'elementor/document/related_posts' );
	}

	public function test_on_document_save__invalidates_grandparent_cache() {
		// Arrange.
		$relations      = new Global_Classes_Relations();
		$global_classes = new Atomic_Global_Styles( $relations );
		$global_classes->register_hooks();
		$cache_validity = new Cache_Validity();

		$grandparent_id = $this->factory()->post->create();
		$parent_id      = $this->factory()->post->create();
		$child_doc      = $this->factory()->documents->create_and_get();
		$child_id       = $child_doc->get_main_id();
		$context        = Global_Classes_Repository::CONTEXT_FRONTEND;

		add_filter( 'elementor/document/related_posts', function( $related, $post_id ) use ( $grandparent_id, $parent_id, $child_id ) {
			if ( (int) $post_id === $grandparent_id ) {
				$related[] = $parent_id;
			}

			if ( (int) $post_id === $parent_id ) {
				$related[] = $child_id;
			}

			return $related;
		}, 10, 2 );

		$this->mock_atomic_styles_manager->method( 'register' )->willReturn( null );

		do_action(
			'elementor/atomic-widgets/styles/register',
			$this->mock_atomic_styles_manager,
			[ $grandparent_id, $parent_id, $child_id ]
		);

		$grandparent_cache_path = [ Atomic_Global_Styles::STYLES_KEY, $grandparent_id, $context ];
		$cache_validity->validate( $grandparent_cache_path );

		// Act.
		do_action( 'elementor/document/after_save', $child_doc, [] );

		// Assert.
		$this->assertFalse(
			$cache_validity->is_valid( $grandparent_cache_path ),
			'Grandparent cache must be invalidated when a deeply embedded child document is saved.'
		);

		remove_all_filters( 'elementor/document/related_posts' );
	}

	private function create_atomic_global_styles(): Atomic_Global_Styles {
		$relations = new Global_Classes_Relations();

		return new Atomic_Global_Styles( $relations );
	}

	private function minimal_global_class_item( string $id, string $label ): array {
		return [
			'id' => $id,
			'label' => $label,
			'type' => 'class',
			'variants' => [],
		];
	}
}
