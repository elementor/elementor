<?php

namespace Elementor\Testing\Modules\GlobalClasses;

use Elementor\Modules\GlobalClasses\Global_Classes_CSS_File;
use Elementor\Modules\GlobalClasses\Global_Classes_CSS_Preview;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\GlobalClasses\Global_Classes_CSS;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Global_Classes_CSS extends Elementor_Test_Base {
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

	private $mock_global_classes_with_fonts = [
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
							'font-family' => [
								'$$type' => 'string',
								'value' => 'Poppins',
							],
						],
					],
					[
						'meta' => [
							'breakpoint' => 'tablet',
							'state' => null,
						],
						'props' => [
							'font-family' => [
								'$$type' => 'string',
								'value' => 'Inter',
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
							'font-family' => [
								'$$type' => 'string',
								'value' => 'Inter',
							],
						],
					],
				],
			],
		],
		'order' => [ 'g-4-124', 'g-4-123' ],
	];

	public function setUp(): void {
		parent::setUp();

		remove_all_actions( 'deleted_post' );
		remove_all_actions( 'elementor/global_classes/update' );
		remove_all_actions( 'elementor/core/files/clear_cache' );
		remove_all_actions( 'elementor/frontend/after_enqueue_styles' );
		remove_all_actions( 'elementor/core/files/after_generate_css' );
		remove_all_actions( 'elementor/atomic-widgets/settings/transformers/classes' );

		( new Global_Classes_CSS() )->register_hooks();
	}

	public function tearDown(): void {
		parent::tearDown();

		( new Global_Classes_CSS_File() )->delete();
		( new Global_Classes_CSS_Preview() )->delete();
	}

	/**
	 * CSS Injection.
	 */

	public function test_it__parses_global_classes_to_css_file() {
		// Arrange
		Global_Classes_Repository::make()->put(
			$this->mock_global_classes['items'],
			$this->mock_global_classes['order'],
		);

		$css_file = new Global_Classes_CSS_File();

		// Assert
		$css = $css_file->get_content();

		$this->assertEquals( '@media(max-width:767px){.elementor .pinky{color:pink;}}.elementor .bluey{color:blue;}', $css );
	}

	public function test_it__does_not_parse_global_classes_to_css_file_if_no_classes() {
		// Arrange
		$css_file = new Global_Classes_CSS_File();

		// Assert
		$css = $css_file->get_content();

		$this->assertEquals( '', $css );
	}

	public function test_it__does_not_parse_global_classes_to_post_css_if_no_kit() {
		// Arrange
		$css_file = new Global_Classes_CSS_File();

		// Assert
		$css = $css_file->get_content();

		$this->assertEquals( '', $css );
	}

	public function test__enqueues_the_css_file_in_frontend() {
		// Arrange.
		Global_Classes_Repository::make()->put(
			$this->mock_global_classes['items'],
			$this->mock_global_classes['order'],
		);

		// Act.
		do_action( 'elementor/frontend/after_enqueue_styles' );

		// Assert.
		$kit_id = Plugin::$instance->kits_manager->get_active_id();

		$handle = "elementor-global-classes-$kit_id";

		$this->assertTrue( wp_style_is( $handle, 'enqueued' ) );
	}

	public function test__enqueues_the_css_file_in_preview() {
		// Arrange.
		Global_Classes_Repository::make()
			->context( Global_Classes_Repository::CONTEXT_PREVIEW )
			->put(
				$this->mock_global_classes['items'],
				$this->mock_global_classes['order'],
			);

		global $wp_query;

		$wp_query->is_preview = true;

		// Act.
		do_action( 'elementor/frontend/after_enqueue_styles' );

		// Assert.
		$kit_id = Plugin::$instance->kits_manager->get_active_id();

		$handle = "elementor-global-classes-preview-$kit_id";

		$this->assertTrue( wp_style_is( $handle, 'enqueued' ) );
	}

	/**
	 * CSS Caching.
	 */

	public function test__updates_the_classes_in_the_css_file() {
		// Arrange.
		Global_Classes_Repository::make()->put(
			$this->mock_global_classes['items'],
			$this->mock_global_classes['order'],
		);

		// Assert.
		$this->assert_css_contains( '.elementor .pinky{color:pink;}' );
		$this->assert_css_contains( '.elementor .bluey{color:blue;}' );

		// Arrange.
		$updated_classes = $this->mock_global_classes['items'];

		// Update an existing class.
		$updated_classes['g-4-123']['variants'][0]['props']['color']['value'] = 'red';

		// Delete a class.
		unset( $updated_classes['g-4-124'] );

		// Add a new class.
		$updated_classes['g-4-125'] = $this->mock_global_classes['items']['g-4-123'];
		$updated_classes['g-4-125']['id'] = 'g-4-125';
		$updated_classes['g-4-125']['label'] = 'newy';
		$updated_classes['g-4-125']['variants'][0]['props']['color']['value'] = 'pink';

		// Act.
		Global_Classes_Repository::make()->put( $updated_classes, [ 'g-4-123', 'g-4-125' ] );

		// Assert.
		$this->assert_css_contains( '.elementor .pinky{color:red;}' );
		$this->assert_css_not_contains( '.elementor .bluey{color:blue;}' );
		$this->assert_css_contains( '.elementor .newy{color:pink;}' );
	}

	public function test__enqueues_fonts() {
		// Arrange.
		Global_Classes_Repository::make()->put(
			$this->mock_global_classes_with_fonts['items'],
			$this->mock_global_classes_with_fonts['order'],
		);

		// Act.
		// Intentionally not using the `Global_Classes_CSS_File::create` function to force a new instance.
		$css_file = new Global_Classes_CSS_File();

		$css_file->get_content();

		// Assert.
		$this->assertSame( [ 'Poppins', 'Inter' ], $css_file->get_fonts() );
	}

	public function test__deletes_only_preview_css_file_on_draft_update() {
		// Arrange.
		Global_Classes_Repository::make()->put(
			$this->mock_global_classes['items'],
			$this->mock_global_classes['order'],
		);

		// Trigger frontend styles render.
		do_action( 'elementor/frontend/after_enqueue_styles' );

		// Trigger preview styles render.
		global $wp_query;

		$wp_query->is_preview = true;

		do_action( 'elementor/frontend/after_enqueue_styles' );

		// Act.
		Global_Classes_Repository::make()
			->context( Global_Classes_Repository::CONTEXT_PREVIEW )
			->put(
				$this->mock_global_classes_with_fonts['items'],
				$this->mock_global_classes_with_fonts['order'],
			);

		// Assert.
		$frontend_css_path = ( new Global_Classes_CSS_File() )->get_path();
		$preview_css_path = ( new Global_Classes_CSS_Preview() )->get_path();

		$this->assertFileExists( $frontend_css_path );
		$this->assertFileDoesNotExist( $preview_css_path );
	}

	public function test__deletes_css_file_on_kit_delete() {
		// Arrange.
		Global_Classes_Repository::make()->put(
			$this->mock_global_classes['items'],
			$this->mock_global_classes['order'],
		);

		// Trigger styles render.
		do_action( 'elementor/frontend/after_enqueue_styles' );

		// Act.
		$_GET['force_delete_kit'] = true;

		Plugin::$instance->kits_manager->get_active_kit()->delete();

		// Assert.
		$css_path = ( new Global_Classes_CSS_File() )->get_path();

		$this->assertFileDoesNotExist( $css_path );
	}

	public function test__does_not_delete_css_file_on_non_kit_delete() {
		// Arrange.
		Global_Classes_Repository::make()->put(
			$this->mock_global_classes['items'],
			$this->mock_global_classes['order'],
		);

		// Trigger styles render.
		do_action( 'elementor/frontend/after_enqueue_styles' );

		// Act.
		$post = $this->factory()->post->create_and_get();

		wp_delete_post( $post->ID, true );

		// Assert.
		$css_path = ( new Global_Classes_CSS_File() )->get_path();

		$this->assertFileExists( $css_path );
	}

	public function test__deletes_css_file_on_clear_cache() {
		// Arrange.
		Global_Classes_Repository::make()->put(
			$this->mock_global_classes['items'],
			$this->mock_global_classes['order'],
		);

		// Trigger styles render.
		do_action( 'elementor/frontend/after_enqueue_styles' );

		// Act.
		do_action( 'elementor/core/files/clear_cache' );

		// Assert.
		$css_path = ( new Global_Classes_CSS_File() )->get_path();

		$this->assertFileDoesNotExist( $css_path );
	}

	public function test__creates_css_file_on_regenerate() {
		// Arrange.
		Global_Classes_Repository::make()->put(
			$this->mock_global_classes['items'],
			$this->mock_global_classes['order'],
		);

		// Act.
		do_action( 'elementor/core/files/after_generate_css' );

		// Assert.
		$css_path = ( new Global_Classes_CSS_File() )->get_path();

		$this->assertFileExists( $css_path );
	}

	public function test_transform_classes_names() {
		// Arrange.
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

	private function assert_css_contains( string $substring, bool $contains = true ) {
		// Intentionally not using the `Global_Classes_CSS_File::create` function to force a new instance.
		$css_file = new Global_Classes_CSS_File();
		$meta = $css_file->get_meta();

		// Emulate runtime behavior that creates the CSS file only when necessary.
		// See: `Elementor\Core\Files\CSS\Base:enqueue()`.
		if ( '' === $meta['status'] ) {
			$css_file->update();
		}

		$css_content = file_get_contents( $css_file->get_path() );

		if ( $contains ) {
			$this->assertStringContainsString( $substring, $css_content );
		} else {
			$this->assertStringNotContainsString( $substring, $css_content );
		}
	}

	private function assert_css_not_contains( string $substring ) {
		$this->assert_css_contains( $substring, false );
	}
}
