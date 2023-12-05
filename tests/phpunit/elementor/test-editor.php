<?php
namespace Elementor\Testing;

use ElementorEditorTesting\Elementor_Test_Base;

class Elementor_Test_Editor extends Elementor_Test_Base {

	public function setUp(): void {
		parent::setUp();

		wp_set_current_user( $this->factory()->get_administrator_user()->ID );

		$GLOBALS['post'] = $this->factory()->create_and_get_default_post()->IDs;
	}

	public function test_getInstance() {
		$this->assertInstanceOf( '\Elementor\Core\Editor\Editor', $this->elementor()->editor );
	}

	/*
	public function test_enqueueScripts() {
		ini_set( 'memory_limit', '85M' );

		ob_start();
		Elementor\ $this->plugin()->editor->enqueue_scripts();
		ob_end_clean();

		$scripts = [
			'wp-auth-check',
			'jquery-ui-sortable',
			'jquery-ui-resizable',
			'backbone-marionette',
			'backbone-radio',
			'perfect-scrollbar',
			'nprogress',
			'tipsy',
			'imagesloaded',
			'heartbeat',
			'jquery-select2',
			'flatpickr',
			'elementor-dialog',
			'ace',
			'ace-language-tools',
			'elementor-editor',
		];

		foreach ( $scripts as $script ) {
			$this->assertTrue( wp_script_is( $script ) );
		}
	}*/

	public function test_enqueueStyles() {
		$this->elementor()->editor->enqueue_styles();

		$styles = [
			'elementor-select2',
			'elementor-icons',
			'wp-auth-check',
			'google-font-roboto',

			'elementor-editor',
		];

		foreach ( $styles as $style ) {
			$this->assertTrue( wp_style_is( $style ) );
		}
	}

	/*public function test_renderFooter() {
		ob_start();
		Elementor\ $this->plugin()->editor->wp_footer();
		$buffer = ob_get_clean();

		$this->assertNotEmpty( $buffer );
	}*/
}
