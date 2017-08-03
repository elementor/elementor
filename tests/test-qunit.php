<?php

class Elementor_Test_Qunit extends WP_UnitTestCase {

	public function setUp() {
		parent::setUp();

		wp_set_current_user( $this->factory->user->create( [ 'role' => 'administrator' ] ) );

		$GLOBALS['post'] = $this->factory->post->create_and_get();

		add_post_meta( $GLOBALS['post']->ID, '_elementor_edit_mode', 'builder' );

		$this->setUpStaticIndex();
		$this->setUpStaticPreview();
	}

	private function setUpStaticIndex() {
		$_REQUEST['post'] = $GLOBALS['post']->ID;
		$_REQUEST['action'] = 'elementor';

		/* Because it's not wp-admin,  */
		add_action( 'elementor/editor/before_enqueue_scripts', function() {
			wp_enqueue_editor();

			$suffix = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? '' : '.min';

			wp_register_script( 'iris', '/wp-admin/js/iris.min.js', [ 'jquery-ui-draggable', 'jquery-ui-slider', 'jquery-touch-punch' ], '1.0.7', 1 );

			wp_register_script( 'wp-color-picker', "/wp-admin/js/color-picker$suffix.js", [ 'iris' ], false, 1 );

			wp_localize_script( 'wp-color-picker', 'wpColorPickerL10n', [
					'clear' => __( 'Clear' ),
					'defaultString' => __( 'Default' ),
					'pick' => __( 'Select Color' ),
					'current' => __( 'Current Color' ),
				]
			);

			wp_enqueue_script( 'wp-color-picker' );
		} );

		ob_start();

		\Elementor\Plugin::$instance->editor->init( false );

		$html = ob_get_clean();

		$html = preg_replace_callback( "/(wp-includes\/(js|css)\/.*\.(js|css))/", function( $match ) {
			$return = str_replace('.css', '.min.css', $match[0] );
			$return = str_replace('.js', '.min.js', $return );
			return $return;
		}, $html );

		$html = str_replace( home_url(), 'file:///tmp/wordpress', $html );
		$html = str_replace( wp_json_encode( add_query_arg( 'elementor-preview', '', get_permalink( $_REQUEST['post'] ) ) ), '"./preview.html?"', $html );

		$quint = '<div id="qunit" style="z-index:1;position:relative;overflow:scroll;height:100%;"></div>' .
		         '<div id="qunit-fixture"></div>' .
		         '<link rel="stylesheet" href="https://code.jquery.com/qunit/qunit-2.4.0.css">' .
		         '<script src="https://code.jquery.com/qunit/qunit-2.4.0.js"></script>' .
		         '<script src="tests.js"></script>';

		$html = str_replace( '</body>', $quint . '</body>', $html );

		file_put_contents( __DIR__ . '/qunit/index.html', $html );

	}

	private function setUpStaticPreview() {
		$_GET['elementor-preview'] = 1;

		query_posts( [ 'p' => $GLOBALS['post']->ID, 'post_type' => 'any' ] );

		\Elementor\Plugin::$instance->preview->init();

		// Load the theme template.
		$template = get_index_template();
		$template = apply_filters( 'template_include', $template );

		ob_start();

		require $template;

		$html = ob_get_clean();

		$html = str_replace( home_url(), '../../../../..', $html );

		$quint = '<script src="vendor/j-ulrich/jquery-simulate-ext/jquery.simulate.js"></script>
		<script src="vendor/j-ulrich/jquery-simulate-ext/jquery.simulate.ext.js"></script>
		<script src="vendor/j-ulrich/jquery-simulate-ext/jquery.simulate.drag-n-drop.js"></script>';

		$html = str_replace( '</body>', $quint . '</body>', $html );

		file_put_contents( __DIR__ . '/qunit/preview.html', $html );
	}

	public function test_staticIndexExist() {
		$this->assertNotFalse( file_exists( __DIR__ . '/qunit/index.html' ) );
	}

	public function test_staticPreviewExist() {
		$this->assertNotFalse( file_exists( __DIR__ . '/qunit/preview.html' ) );
	}
}
