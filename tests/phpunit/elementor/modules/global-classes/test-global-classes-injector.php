<?php

namespace Elementor\Testing\Modules\GlobalClasses;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Core\Files\CSS\Post as Post_CSS;
use Elementor\Modules\GlobalClasses\Global_Classes_Injector;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Global_Classes_Injector extends Elementor_Test_Base {
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
							'color' => 'pink',
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
							'color' => 'blue',
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

		( new Global_Classes_Injector() )->register_hooks();
	}

	public function tearDown(): void {
		parent::tearDown();

		$this->kit->delete_meta( Global_Classes_Repository::META_KEY );
	}

	public function test_it__parses_global_classes_to_kit_css() {
		// Arrange
		$this->kit->update_json_meta( Global_Classes_Repository::META_KEY, $this->mock_global_classes );

		$post = Post_CSS::create( $this->kit->get_id() );

		// Assert
		$css = $post->get_content();

		$this->assertEquals( '.g-4-124{color:blue;}@media(max-width:767px){.g-4-123{color:pink;}}', $css );
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
}
