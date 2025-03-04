<?php

namespace Elementor\Testing\Modules\GlobalClasses;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Core\Files\CSS\Post as Post_CSS;
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

	private Kit $kit;

	public function setUp(): void {
		parent::setUp();

		Plugin::$instance->kits_manager->create_new_kit( 'kit' );
		$this->kit = Plugin::$instance->kits_manager->get_active_kit();

		remove_all_actions( 'elementor/css-file/post/parse' );

		( new Global_Classes_CSS() )->register_hooks();
	}

	public function tearDown(): void {
		parent::tearDown();

		$this->kit->delete_meta( Global_Classes_Repository::META_KEY );
	}

	/**
	 * CSS Injection.
	 */

	public function test_it__parses_global_classes_to_kit_css() {
		// Arrange
		$this->kit->update_json_meta( Global_Classes_Repository::META_KEY, $this->mock_global_classes );

		$post = Post_CSS::create( $this->kit->get_id() );

		// Assert
		$css = $post->get_content();

		$this->assertEquals( '@media(max-width:767px){.elementor .g-4-123{color:pink;}}.elementor .g-4-124{color:blue;}', $css );
	}

	public function test_it__does_not_parse_global_classes_to_kit_css_if_no_classes() {
		// Arrange
		$post = Post_CSS::create( $this->kit->get_id() );

		// Assert
		$css = $post->get_content();

		$this->assertEquals( '', $css );
	}

	public function test_it__does_not_parse_global_classes_to_post_css_if_no_kit() {
		// Arrange
		$post = Post_CSS::create( uniqid() );

		// Assert
		$css = $post->get_content();

		$this->assertEquals( '', $css );
	}

	/**
	 * CSS Caching.
	 */

	public function test__updates_the_classes_in_the_css_file() {
		// Arrange.
		Plugin::$instance->kits_manager->get_active_kit()->update_json_meta(
			Global_Classes_Repository::META_KEY,
			$this->mock_global_classes
		);

		// Assert.
		$this->assert_kit_css_contains( '.elementor .g-4-123{color:pink;}' );
		$this->assert_kit_css_contains( '.elementor .g-4-124{color:blue;}' );

		// Arrange.
		$updated_classes = $this->mock_global_classes['items'];

		// Update an existing class.
		$updated_classes['g-4-123']['variants'][0]['props']['color']['value'] = 'red';

		// Delete a class.
		unset( $updated_classes['g-4-124'] );

		// Add a new class.
		$updated_classes['g-4-125'] = $this->mock_global_classes['items']['g-4-123'];
		$updated_classes['g-4-125']['id'] = 'g-4-125';
		$updated_classes['g-4-125']['variants'][0]['props']['color']['value'] = 'pink';

		// Act.
		( new Global_Classes_Repository() )->put( $updated_classes, [ 'g-4-123', 'g-4-125' ] );

		// Assert.
		$this->assert_kit_css_contains( '.elementor .g-4-123{color:red;}' );
		$this->assert_kit_css_not_contains( '.elementor .g-4-124{color:blue;}' );
		$this->assert_kit_css_contains( '.elementor .g-4-125{color:pink;}' );
	}

	public function test__enqueues_fonts() {
		// Arrange.
		Plugin::$instance->kits_manager->get_active_kit()->update_json_meta(
			Global_Classes_Repository::META_KEY,
			$this->mock_global_classes_with_fonts
		);

		// Act.
		$kit_id = Plugin::$instance->kits_manager->get_active_id();

		// Intentionally not using the `Post_CSS::create` function to force a new instance.
		$post_css = new Post_CSS( $kit_id );

		$post_css->get_content();

		// Assert.
		$this->assertSame( [ 'Poppins', 'Inter' ], $post_css->get_fonts() );
	}

	private function assert_kit_css_contains( string $substring, bool $contains = true ) {
		$kit_id = Plugin::$instance->kits_manager->get_active_id();

		// Intentionally not using the `Post_CSS::create` function to force a new instance.
		$post_css = new Post_CSS( $kit_id );
		$meta = $post_css->get_meta();

		// Emulate runtime behavior that creates the CSS file only when necessary.
		// See: `Elementor\Core\Files\CSS\Base:enqueue()`.
		if ( '' === $meta['status'] ) {
			$post_css->update();
		}

		$css_content = file_get_contents( $post_css->get_path() );

		if ( $contains ) {
			$this->assertStringContainsString( $substring, $css_content );
		} else {
			$this->assertStringNotContainsString( $substring, $css_content );
		}
	}

	private function assert_kit_css_not_contains( string $substring ) {
		$this->assert_kit_css_contains( $substring, false );
	}
}
