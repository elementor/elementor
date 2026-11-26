<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\EditorOne;

use Elementor\Modules\EditorOne\Classes\Top_Bar_Locale_Assets;
use Elementor\Modules\EditorOne\Components\Top_Bar_Handler;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Top_Bar_Handler extends Elementor_Test_Base {

	private Top_Bar_Handler $handler;

	private $original_screen;

	public function setUp(): void {
		parent::setUp();

		$this->original_screen = $GLOBALS['current_screen'] ?? null;
		$this->handler = new Top_Bar_Handler();
	}

	public function tearDown(): void {
		remove_action( 'admin_enqueue_scripts', [ $this->handler, 'enqueue_assets' ] );
		remove_action( 'in_admin_header', [ $this->handler, 'render_top_bar_container' ] );
		remove_filter( 'script_loader_tag', [ Top_Bar_Locale_Assets::class, 'filter_locale_json_script_tag' ], 10 );
		remove_filter( 'elementor/editor-one/admin-edit-post-types', [ $this, 'filter_editor_one_post_types' ] );
		$GLOBALS['current_screen'] = $this->original_screen;

		parent::tearDown();
	}

	public function test_get_placeholder_markup__is_a_hidden_header_with_the_logo_and_title() {
		// Act
		$html = $this->handler->get_placeholder_markup();

		// Assert
		$this->assertStringStartsWith( '<header class="e-one-top-bar-placeholder" aria-hidden="true">', $html );
		$this->assertStringEndsWith( '</header>', $html );
		$this->assertStringContainsString( '<svg class="e-one-top-bar-placeholder__logo"', $html );
		$this->assertStringContainsString( '<span class="e-one-top-bar-placeholder__title">Elementor</span>', $html );
	}

	public function test_get_placeholder_markup__has_nothing_focusable() {
		// Act
		$html = $this->handler->get_placeholder_markup();

		// Assert
		$this->assertDoesNotMatchRegularExpression( '/<(a|button|input)\b/', $html );
		$this->assertStringContainsString( 'focusable="false"', $html );
	}

	public function test_render_top_bar_container__prints_nothing_outside_editor_one_pages() {
		// Arrange
		$GLOBALS['current_screen'] = null;

		// Act
		ob_start();
		$this->handler->render_top_bar_container();
		$html = ob_get_clean();

		// Assert
		$this->assertSame( '', $html );
	}

	public function test_render_top_bar_container__prints_the_placeholder_inside_the_root_on_editor_one_pages() {
		// Arrange
		$this->act_on_an_editor_one_page();

		// Act
		ob_start();
		$this->handler->render_top_bar_container();
		$html = ob_get_clean();

		// Assert
		$this->assertStringStartsWith(
			'<div id="editor-one-top-bar"><header class="e-one-top-bar-placeholder" aria-hidden="true">',
			$html
		);
		$this->assertStringEndsWith( '</header></div>', $html );
	}

	private function act_on_an_editor_one_page(): void {
		$GLOBALS['current_screen'] = \WP_Screen::get( 'post' );
		add_filter( 'elementor/editor-one/admin-edit-post-types', [ $this, 'filter_editor_one_post_types' ] );
	}

	public function filter_editor_one_post_types( array $post_types ): array {
		$post_types[] = 'post';

		return $post_types;
	}
}
