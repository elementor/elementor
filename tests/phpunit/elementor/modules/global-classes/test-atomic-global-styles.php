<?php

namespace Elementor\Testing\Modules\GlobalClasses;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\Cache_Validity;
use Elementor\Modules\AtomicWidgets\Styles\Atomic_Styles_Manager;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\GlobalClasses\Atomic_Global_Styles;
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
							]
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

		$this->mock_atomic_styles_manager = $this->createMock( Atomic_Styles_Manager::class );

		remove_all_actions( 'elementor/atomic-widgets/styles/register' );
		remove_all_actions( 'elementor/atomic-widgets/settings/transformers/classes' );
	}

	public function test_register_styles() {
		// Arrange.
		$global_classes = new Atomic_Global_Styles();
		$global_classes->register_hooks();
		$context = is_preview() ? Global_Classes_Repository::CONTEXT_PREVIEW : Global_Classes_Repository::CONTEXT_FRONTEND;

		Global_Classes_Repository::make()->put(
			$this->mock_global_classes['items'],
			$this->mock_global_classes['order']
		);

		// Assert.
		$expected = Collection::make( $this->mock_global_classes['items'] )
			->map( function ( $item ) {
				$item['id'] = $item['label'];
				return $item;
			} )
			->all();

		$this->mock_atomic_styles_manager
			->expects( $this->once() )
			->method( 'register' )
			->with(
				Atomic_Global_Styles::STYLES_KEY . '-' . $context,
				$this->callback( function ( $callback ) use ( $expected ) {
					$styles = $callback( [ 1, 2 ] );
					$this->assertEquals( $expected, $styles );
					return true;
				} )
			);


		// Act.
		do_action( 'elementor/atomic-widgets/styles/register', $this->mock_atomic_styles_manager, [ 0 ] );
	}

	public function test_transform_classes_names() {
		// Arrange.
		$global_classes = new Atomic_Global_Styles();
		$global_classes->register_hooks();

		Global_Classes_Repository::make()->put(
			[
				'g-2' => [ 'id' => 'g-2', 'label' => 'pinky' ],
				'g-3' => [ 'id' => 'g-3', 'label' => 'bluey' ],
			],
			[],
		);

		// Act.
		$result = apply_filters( 'elementor/atomic-widgets/settings/transformers/classes', [ 'e-1', 'g-2', 'g-3', 'd-1' ] );

		// Assert.
		$this->assertEquals( [ 'e-1', 'pinky', 'bluey', 'd-1' ], $result );
	}

	public function test_transform_classes_names__for_preview_mode() {
		// Arrange.
		$global_classes = new Atomic_Global_Styles();
		$global_classes->register_hooks();

		global $wp_query;

		$wp_query->is_preview = true;

		Global_Classes_Repository::make()->put(
			[
				'g-only-frontend' => [ 'id' => 'g-only-frontend', 'label' => 'frontend' ],
				'g-both' => [ 'id' => 'g-both', 'label' => 'both' ],
			],
			[],
		);

		Global_Classes_Repository::make()->context( Global_Classes_Repository::CONTEXT_PREVIEW )->put(
			[
				'g-both' => [ 'id' => 'g-both', 'label' => 'both' ],
				'g-only-preview' => [ 'id' => 'g-only-preview', 'label' => 'preview' ],
			],
			[],
		);

		// Act.
		$result = apply_filters(
			'elementor/atomic-widgets/settings/transformers/classes',
			[ 'g-only-frontend', 'g-both', 'g-only-preview' ]
		);

		// Assert.
		$this->assertEquals( [ 'g-only-frontend', 'both', 'preview' ], $result );
	}

	public function test_cache_invalidation_on_update() {
		// Arrange.
		$global_classes = new Atomic_Global_Styles();
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
			'items' => [],
			'order' => [],
		], [
			'items' => [],
			'order' => [],
		] );

		// Assert.
		$this->assertFalse( $cache_validity->is_valid(
			[ Atomic_Global_Styles::STYLES_KEY, Global_Classes_Repository::CONTEXT_FRONTEND ]
		) );
		$this->assertTrue( $cache_validity->is_valid(
			[ Atomic_Global_Styles::STYLES_KEY, Global_Classes_Repository::CONTEXT_PREVIEW ]
		) );
	}

	public function test_cache_invalidation_on_global_cache_clear() {
		// Arrange.
		$global_classes = new Atomic_Global_Styles();
		$global_classes->register_hooks();

		$cache_validity = new Cache_Validity();

		// Act.
		$cache_validity->validate( [ Atomic_Global_Styles::STYLES_KEY, Global_Classes_Repository::CONTEXT_FRONTEND ] );
		$cache_validity->validate( [ Atomic_Global_Styles::STYLES_KEY, Global_Classes_Repository::CONTEXT_PREVIEW ] );

		do_action('elementor/core/files/clear_cache' );

		// Assert.
		$this->assertFalse( $cache_validity->is_valid(
			[ Atomic_Global_Styles::STYLES_KEY, Global_Classes_Repository::CONTEXT_FRONTEND ]
		) );
		$this->assertFalse( $cache_validity->is_valid(
			[ Atomic_Global_Styles::STYLES_KEY, Global_Classes_Repository::CONTEXT_PREVIEW ]
		) );
	}
}
