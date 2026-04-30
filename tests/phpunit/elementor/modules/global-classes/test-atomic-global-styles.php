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
			'modified' => [ 'g-invalidate-cache' ],
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
			'modified' => [ 'g-invalidate-cache' ],
		] );

		// Assert.
		$this->assertTrue( $cache_validity->is_valid(
			[ Atomic_Global_Styles::STYLES_KEY, Global_Classes_Repository::CONTEXT_FRONTEND ]
		) );

		$this->assertFalse( $cache_validity->is_valid(
			[ Atomic_Global_Styles::STYLES_KEY, Global_Classes_Repository::CONTEXT_PREVIEW ]
		) );
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
