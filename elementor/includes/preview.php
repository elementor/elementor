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

		add_filter( 'body_class', [ $this, 'body_class' ] );
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
	 * Add custom class in `<body>` element.
	 *
	 * @since 1.0.0
	 * @param array $classes
	 *
	 * @return array
	 */
	public function body_class( $classes = [] ) {
		$classes[] = 'elementor-body';
		return $classes;
	}

	/**
	 * Do not show the conent from the page. Just print empty start HTML.
	 * The Javascript will add the content later.
	 *
	 * @since 1.0.0
	 * @param string $content
	 *
	 * @return string
	 */
	public function builder_wrapper( $content ) {
		return '<div id="elementor" class="elementor"></div>';
	}

	/**
	 * Enqueue preview scripts and styles.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function enqueue_styles() {
		Plugin::instance()->frontend->enqueue_styles();

		$suffix = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? '' : '.min';

		$direction_suffix = is_rtl() ? '-rtl' : '';

		wp_register_style(
			'editor-preview',
			ELEMENTOR_ASSETS_URL . 'css/editor-preview' . $direction_suffix . $suffix . '.css',
			[],
			Plugin::instance()->get_version()
		);

		wp_enqueue_style( 'editor-preview' );
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
