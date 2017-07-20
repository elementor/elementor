<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Preview {

	/**
	 * Initialize the preview mode. Fired by `init` action.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function init() {
		if ( is_admin() || ! $this->is_preview_mode() ) {
			return;
		}

		// Disable the WP admin bar in preview mode.
		add_filter( 'show_admin_bar', '__return_false' );

		add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_styles' ] );
		add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_scripts' ] );
		add_action( 'wp_head', [ $this, 'print_custom_css' ] );
		add_filter( 'the_content', [ $this, 'builder_wrapper' ], 999999 );

		// Tell to WP Cache plugins do not cache this request.
		Utils::do_not_cache();
	}

	/**
	 * Method detect if we are in the preview mode (iFrame).
	 *
	 * @since 1.0.0
	 * @return bool
	 */
	public function is_preview_mode() {
		if ( ! User::is_current_user_can_edit() ) {
			return false;
		}

		if ( ! isset( $_GET['elementor-preview'] ) ) {
			return false;
		}

		return true;
	}

	/**
	 * Do not show the content from the page. Just print empty start HTML.
	 * The Javascript will add the content later.
	 *
	 * @since 1.0.0
	 *
	 * @return string
	 */
	public function builder_wrapper() {
		return '<div id="elementor" class="elementor elementor-edit-mode"></div>';
	}

	public function print_custom_css() {
		$stylesheet = new Stylesheet();

		$container_width = absint( get_option( 'elementor_container_width' ) );

		if ( $container_width ) {
			$stylesheet->add_rules( '.elementor-section.elementor-section-boxed > .elementor-container', [ 'max-width' => $container_width . 'px' ] );
		}

		$space_between_widgets = get_option( 'elementor_space_between_widgets' );

		if ( is_numeric( $space_between_widgets ) ) {
			$stylesheet->add_rules( '.elementor-widget:not(:last-child)', [ 'margin-bottom' => $space_between_widgets . 'px' ] );
		}

		$style_text = $stylesheet->__toString();

		if ( $style_text ) {
			echo '<style id="elementor-preview-custom-css">' . $style_text . '</style>';
		}
	}

	/**
	 * Enqueue preview scripts and styles.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function enqueue_styles() {
		// Hold-on all jQuery plugins after all HTML markup render
		wp_add_inline_script( 'jquery-migrate', 'jQuery.holdReady( true );' );

		// Make sure jQuery embed in preview window
		wp_enqueue_script( 'jquery' );

		Plugin::$instance->frontend->enqueue_styles();

		$suffix = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? '' : '.min';

		$direction_suffix = is_rtl() ? '-rtl' : '';

		wp_register_style(
			'editor-preview',
			ELEMENTOR_ASSETS_URL . 'css/editor-preview' . $direction_suffix . $suffix . '.css',
			[],
			ELEMENTOR_VERSION
		);

		wp_enqueue_style( 'editor-preview' );

		do_action( 'elementor/preview/enqueue_styles' );
	}

	public function enqueue_scripts() {
		do_action( 'elementor/preview/enqueue_scripts' );
	}

	/**
	 * Preview constructor.
	 *
	 * @since 1.0.0
	 */
	public function __construct() {
		add_action( 'template_redirect', [ $this, 'init' ] );
	}
}
