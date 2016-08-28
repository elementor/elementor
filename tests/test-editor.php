<?php

class Elementor_Test_Editor extends WP_UnitTestCase {

	public function test_getInstance() {
		$this->assertInstanceOf( '\Elementor\Editor', Elementor\Plugin::instance()->editor );
	}

	public function test_enqueueScripts() {
		ob_start();
		Elementor\Plugin::instance()->editor->enqueue_scripts();
		ob_get_clean();

		$scripts = [
			'jquery-ui-sortable',
			'jquery-ui-resizable',
			'backbone-marionette',
			'backbone-radio',
			'perfect-scrollbar',
			'jquery-easing',
			'nprogress',
			'tipsy',
			'imagesloaded',
			'heartbeat',
			'elementor-dialog',

			'elementor-editor',
		];

		foreach ( $scripts as $script ) {
			$this->assertTrue( wp_script_is( $script ) );
		}
	}

	public function test_enqueueStyles() {
		Elementor\Plugin::instance()->editor->enqueue_styles();

		$scripts = [
			'font-awesome',
			'select2',
			'elementor-icons',
			'wp-auth-check',
			'google-font-roboto',

			'elementor-admin',
		];

		foreach ( $scripts as $script ) {
			$this->assertTrue( wp_style_is( $script ) );
		}
	}

	public function test_renderFooter() {
		ob_start();
		Elementor\Plugin::instance()->editor->wp_footer();
		$buffer = ob_get_clean();

		$this->assertNotEmpty( $buffer );
	}
}
