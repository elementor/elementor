<?php

namespace Elementor\Testing\Modules\GlobalClasses;

use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Core\Files\CSS\Post as Post_CSS;
use Elementor\Modules\GlobalClasses\Module;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Module extends Elementor_Test_Base {
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
		'order' => [ 'g-4-123', 'g-4-124' ],
	];

	public function setUp(): void {
		parent::setUp();

		Plugin::$instance->kits_manager->create_new_kit( 'kit' );

		remove_all_actions( 'elementor/css-file/post/parse' );
	}

	public function tearDown(): void {
		parent::tearDown();

		Plugin::$instance->kits_manager->get_active_kit()->delete_meta( Global_Classes_Repository::META_KEY );
	}

	public function test_it__parses_global_classes_to_kit_css() {
		// Arrange
		Plugin::$instance->kits_manager->get_active_kit()->update_json_meta( Global_Classes_Repository::META_KEY, $this->mock_global_classes );

		$post = Post_CSS::create( Plugin::$instance->kits_manager->get_active_kit()->get_id() );

		// Act
		new Module();

		// Assert
		ob_start();
		$post->print_css();
		$css = ob_get_clean();

		$this->assertStringContainsString( '@media(max-width:767px){.g-4-123{color:pink;}}', $css );
		$this->assertStringContainsString( '.g-4-124{color:blue;}', $css );
	}

	public function test_it__does_not_parse_global_classes_to_kit_css_if_no_classes() {
		// Arrange
		$post = Post_CSS::create( Plugin::$instance->kits_manager->get_active_kit()->get_id() );

		// Act
		new Module();

		// Assert
		ob_start();
		$post->print_css();
		$css = ob_get_clean();

		$this->assertEquals( '<style></style>', $css );
	}

	public function test_it__does_not_parse_global_classes_to_post_css_if_no_kit() {
		// Arrange
		$post = Post_CSS::create( uniqid() );

		// Act
		new Module();

		// Assert
		ob_start();
		$post->print_css();
		$css = ob_get_clean();

		$this->assertEquals( '<style></style>', $css );
	}
}
