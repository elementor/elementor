<?php
namespace Elementor;

use Elementor\Core\Base\App;
use Elementor\Core\Base\Document;
use Elementor\Core\Responsive\Files\Frontend as FrontendFile;
use Elementor\Core\Files\CSS\Global_CSS;
use Elementor\Core\Files\CSS\Post as Post_CSS;
use Elementor\Core\Files\CSS\Post_Preview;
use Elementor\Core\Responsive\Responsive;
use Elementor\Core\Settings\Manager as SettingsManager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor frontend.
 *
 * Elementor frontend handler class is responsible for initializing Elementor in
 * the frontend.
 *
 * @since 1.0.0
 */
class Frontend extends App {

	/**
	 * The priority of the content filter.
	 */
	const THE_CONTENT_FILTER_PRIORITY = 9;

	/**
	 * Post ID.
	 *
	 * Holds the ID of the current post.
	 *
	 * @access private
	 *
	 * @var int Post ID.
	 */
	private $post_id;

	/**
	 * Fonts to enqueue
	 *
	 * Holds the list of fonts that are being used in the current page.
	 *
	 * @since 1.9.4
	 * @access private
	 *
	 * @var array Used fonts. Default is an empty array.
	 */
	private $fonts_to_enqueue = [];

	/**
	 * Registered fonts.
	 *
	 * Holds the list of enqueued fonts in the current page.
	 *
	 * @since 1.0.0
	 * @access private
	 *
	 * @var array Registered fonts. Default is an empty array.
	 */
	private $registered_fonts = [];

	/**
	 * Whether the page is using Elementor.
	 *
	 * Used to determine whether the current page is using Elementor.
	 *
	 * @since 1.0.0
	 * @access private
	 *
	 * @var bool Whether Elementor is being used. Default is false.
	 */
	private $_has_elementor_in_page = false;

	/**
	 * Whether the excerpt is being called.
	 *
	 * Used to determine whether the call to `the_content()` came from `get_the_excerpt()`.
	 *
	 * @since 1.0.0
	 * @access private
	 *
	 * @var bool Whether the excerpt is being used. Default is false.
	 */
	private $_is_excerpt = false;

	/**
	 * Filters removed from the content.
	 *
	 * Hold the list of filters removed from `the_content()`. Used to hold the filters that
	 * conflicted with Elementor while Elementor process the content.
	 *
	 * @since 1.0.0
	 * @access private
	 *
	 * @var array Filters removed from the content. Default is an empty array.
	 */
	private $content_removed_filters = [];


	/**
	 * @var Document[]
	 */
	private $admin_bar_edit_documents = [];

	/**
	 * @var string[]
	 */
	private $body_classes = [
		'elementor-default',
	];

	/**
	 * Front End constructor.
	 *
	 * Initializing Elementor front end. Make sure we are not in admin, not and
	 * redirect from old URL structure of Elementor editor.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function __construct() {
		// We don't need this class in admin side, but in AJAX requests.
		if ( is_admin() && ! Utils::is_ajax() ) {
			return;
		}

		add_action( 'template_redirect', [ $this, 'init' ] );
		add_action( 'wp_enqueue_scripts', [ $this, 'register_scripts' ], 5 );
		add_action( 'wp_enqueue_scripts', [ $this, 'register_styles' ], 5 );

		$this->add_content_filter();

		// Hack to avoid enqueue post CSS while it's a `the_excerpt` call.
		add_filter( 'get_the_excerpt', [ $this, 'start_excerpt_flag' ], 1 );
		add_filter( 'get_the_excerpt', [ $this, 'end_excerpt_flag' ], 20 );
	}

	/**
	 * Get module name.
	 *
	 * Retrieve the module name.
	 *
	 * @since 2.3.0
	 * @access public
	 *
	 * @return string Module name.
	 */
	public function get_name() {
		return 'frontend';
	}

	/**
	 * Init.
	 *
	 * Initialize Elementor front end. Hooks the needed actions to run Elementor
	 * in the front end, including script and style registration.
	 *
	 * Fired by `template_redirect` action.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function init() {
		if ( Plugin::$instance->editor->is_edit_mode() ) {
			return;
		}

		add_filter( 'body_class', [ $this, 'body_class' ] );

		if ( Plugin::$instance->preview->is_preview_mode() ) {
			return;
		}

		if ( current_user_can( 'manage_options' ) ) {
			Plugin::$instance->init_common();
		}

		$this->post_id = get_the_ID();

		if ( is_singular() && Plugin::$instance->db->is_built_with_elementor( $this->post_id ) ) {
			add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_styles' ] );
		}

		// Priority 7 to allow google fonts in header template to load in <head> tag
		add_action( 'wp_head', [ $this, 'print_fonts_links' ], 7 );
		add_action( 'wp_footer', [ $this, 'wp_footer' ] );

		// Add Edit with the Elementor in Admin Bar.
		add_action( 'admin_bar_menu', [ $this, 'add_menu_in_admin_bar' ], 200 );
	}

	/**
	 * @since 2.0.12
	 * @access public
	 * @param string|array $class
	 */
	public function add_body_class( $class ) {
		if ( is_array( $class ) ) {
			$this->body_classes = array_merge( $this->body_classes, $class );
		} else {
			$this->body_classes[] = $class;
		}
	}

	/**
	 * Body tag classes.
	 *
	 * Add new elementor classes to the body tag.
	 *
	 * Fired by `body_class` filter.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param array $classes Optional. One or more classes to add to the body tag class list.
	 *                       Default is an empty array.
	 *
	 * @return array Body tag classes.
	 */
	public function body_class( $classes = [] ) {
		$classes = array_merge( $classes, $this->body_classes );

		$id = get_the_ID();

		if ( is_singular() && Plugin::$instance->db->is_built_with_elementor( $id ) ) {
			$classes[] = 'elementor-page elementor-page-' . $id;
		}

		return $classes;
	}

	/**
	 * Add content filter.
	 *
	 * Remove plain content and render the content generated by Elementor.
	 *
	 * @since 1.8.0
	 * @access public
	 */
	public function add_content_filter() {
		add_filter( 'the_content', [ $this, 'apply_builder_in_content' ], self::THE_CONTENT_FILTER_PRIORITY );
	}

	/**
	 * Remove content filter.
	 *
	 * When the Elementor generated content rendered, we remove the filter to prevent multiple
	 * accuracies. This way we make sure Elementor renders the content only once.
	 *
	 * @since 1.8.0
	 * @access public
	 */
	public function remove_content_filter() {
		remove_filter( 'the_content', [ $this, 'apply_builder_in_content' ], self::THE_CONTENT_FILTER_PRIORITY );
	}

	/**
	 * Registers scripts.
	 *
	 * Registers all the frontend scripts.
	 *
	 * Fired by `wp_enqueue_scripts` action.
	 *
	 * @since 1.2.1
	 * @access public
	 */
	public function register_scripts() {
		/**
		 * Before frontend register scripts.
		 *
		 * Fires before Elementor frontend scripts are registered.
		 *
		 * @since 1.2.1
		 */
		do_action( 'elementor/frontend/before_register_scripts' );

		wp_register_script(
			'elementor-frontend-modules',
			$this->get_js_assets_url( 'frontend-modules' ),
			[
				'jquery',
			],
			ELEMENTOR_VERSION,
			true
		);

		wp_register_script(
			'elementor-waypoints',
			$this->get_js_assets_url( 'waypoints', 'assets/lib/waypoints/' ),
			[
				'jquery',
			],
			'4.0.2',
			true
		);

		wp_register_script(
			'flatpickr',
			$this->get_js_assets_url( 'flatpickr', 'assets/lib/flatpickr/' ),
			[
				'jquery',
			],
			'4.1.4',
			true
		);

		wp_register_script(
			'imagesloaded',
			$this->get_js_assets_url( 'imagesloaded', 'assets/lib/imagesloaded/' ),
			[
				'jquery',
			],
			'4.1.0',
			true
		);

		wp_register_script(
			'jquery-numerator',
			$this->get_js_assets_url( 'jquery-numerator', 'assets/lib/jquery-numerator/' ),
			[
				'jquery',
			],
			'0.2.1',
			true
		);

		wp_register_script(
			'swiper',
			$this->get_js_assets_url( 'swiper', 'assets/lib/swiper/' ),
			[],
			'4.4.6',
			true
		);

		wp_register_script(
			'jquery-slick',
			$this->get_js_assets_url( 'slick', 'assets/lib/slick/' ),
			[
				'jquery',
			],
			'1.8.1',
			true
		);

		wp_register_script(
			'elementor-dialog',
			$this->get_js_assets_url( 'dialog', 'assets/lib/dialog/' ),
			[
				'jquery-ui-position',
			],
			'4.7.1',
			true
		);

		wp_register_script(
			'elementor-frontend',
			$this->get_js_assets_url( 'frontend' ),
			[
				'elementor-frontend-modules',
				'elementor-dialog',
				'elementor-waypoints',
				'swiper',
			],
			ELEMENTOR_VERSION,
			true
		);

		/**
		 * After frontend register scripts.
		 *
		 * Fires after Elementor frontend scripts are registered.
		 *
		 * @since 1.2.1
		 */
		do_action( 'elementor/frontend/after_register_scripts' );
	}

	/**
	 * Registers styles.
	 *
	 * Registers all the frontend styles.
	 *
	 * Fired by `wp_enqueue_scripts` action.
	 *
	 * @since 1.2.0
	 * @access public
	 */
	public function register_styles() {
		/**
		 * Before frontend register styles.
		 *
		 * Fires before Elementor frontend styles are registered.
		 *
		 * @since 1.2.0
		 */
		do_action( 'elementor/frontend/before_register_styles' );

		wp_register_style(
			'elementor-icons',
			$this->get_css_assets_url( 'elementor-icons', 'assets/lib/eicons/css/' ),
			[],
			'4.3.0'
		);

		wp_register_style(
			'font-awesome',
			$this->get_css_assets_url( 'font-awesome', 'assets/lib/font-awesome/css/' ),
			[],
			'4.7.0'
		);

		wp_register_style(
			'elementor-animations',
			$this->get_css_assets_url( 'animations', 'assets/lib/animations/', true ),
			[],
			ELEMENTOR_VERSION
		);

		wp_register_style(
			'flatpickr',
			$this->get_css_assets_url( 'flatpickr', 'assets/lib/flatpickr/' ),
			[],
			'4.1.4'
		);

		$min_suffix = Utils::is_script_debug() ? '' : '.min';

		$direction_suffix = is_rtl() ? '-rtl' : '';

		$frontend_file_name = 'frontend' . $direction_suffix . $min_suffix . '.css';

		$has_custom_file = Responsive::has_custom_breakpoints();

		if ( $has_custom_file ) {
			$frontend_file = new FrontendFile( 'custom-' . $frontend_file_name, Responsive::get_stylesheet_templates_path() . $frontend_file_name );

			$time = $frontend_file->get_meta( 'time' );

			if ( ! $time ) {
				$frontend_file->update();
			}

			$frontend_file_url = $frontend_file->get_url();
		} else {
			$frontend_file_url = ELEMENTOR_ASSETS_URL . 'css/' . $frontend_file_name;
		}

		wp_register_style(
			'elementor-frontend',
			$frontend_file_url,
			[],
			$has_custom_file ? null : ELEMENTOR_VERSION
		);

		/**
		 * After frontend register styles.
		 *
		 * Fires after Elementor frontend styles are registered.
		 *
		 * @since 1.2.0
		 */
		do_action( 'elementor/frontend/after_register_styles' );
	}

	/**
	 * Enqueue scripts.
	 *
	 * Enqueue all the frontend scripts.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function enqueue_scripts() {
		/**
		 * Before frontend enqueue scripts.
		 *
		 * Fires before Elementor frontend scripts are enqueued.
		 *
		 * @since 1.0.0
		 */
		do_action( 'elementor/frontend/before_enqueue_scripts' );

		wp_enqueue_script( 'elementor-frontend' );

		$this->print_config();

		/**
		 * After frontend enqueue scripts.
		 *
		 * Fires after Elementor frontend scripts are enqueued.
		 *
		 * @since 1.0.0
		 */
		do_action( 'elementor/frontend/after_enqueue_scripts' );
	}

	/**
	 * Enqueue styles.
	 *
	 * Enqueue all the frontend styles.
	 *
	 * Fired by `wp_enqueue_scripts` action.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function enqueue_styles() {
		/**
		 * Before frontend styles enqueued.
		 *
		 * Fires before Elementor frontend styles are enqueued.
		 *
		 * @since 1.0.0
		 */
		do_action( 'elementor/frontend/before_enqueue_styles' );

		wp_enqueue_style( 'elementor-icons' );
		wp_enqueue_style( 'font-awesome' );
		wp_enqueue_style( 'elementor-animations' );
		wp_enqueue_style( 'elementor-frontend' );

		/**
		 * After frontend styles enqueued.
		 *
		 * Fires after Elementor frontend styles are enqueued.
		 *
		 * @since 1.0.0
		 */
		do_action( 'elementor/frontend/after_enqueue_styles' );

		if ( ! Plugin::$instance->preview->is_preview_mode() ) {
			$this->parse_global_css_code();

			$css_file = new Post_CSS( get_the_ID() );
			$css_file->enqueue();
		}
	}

	/**
	 * Elementor footer scripts and styles.
	 *
	 * Handle styles and scripts that are not printed in the header.
	 *
	 * Fired by `wp_footer` action.
	 *
	 * @since 1.0.11
	 * @access public
	 */
	public function wp_footer() {
		if ( ! $this->_has_elementor_in_page ) {
			return;
		}

		$this->enqueue_styles();
		$this->enqueue_scripts();

		$this->print_fonts_links();
	}

	/**
	 * Print fonts links.
	 *
	 * Enqueue all the frontend fonts by url.
	 *
	 * Fired by `wp_head` action.
	 *
	 * @since 1.9.4
	 * @access public
	 */
	public function print_fonts_links() {
		$google_fonts = [
			'google' => [],
			'early' => [],
		];

		foreach ( $this->fonts_to_enqueue as $key => $font ) {
			$font_type = Fonts::get_font_type( $font );

			switch ( $font_type ) {
				case Fonts::GOOGLE:
					$google_fonts['google'][] = $font;
					break;

				case Fonts::EARLYACCESS:
					$google_fonts['early'][] = $font;
					break;

				default:
					/**
					 * Print font links.
					 *
					 * Fires when Elementor frontend fonts are printed on the HEAD tag.
					 *
					 * The dynamic portion of the hook name, `$font_type`, refers to the font type.
					 *
					 * @since 2.0.0
					 *
					 * @param string $font Font name.
					 */
					do_action( "elementor/fonts/print_font_links/{$font_type}", $font );
			}
		}
		$this->fonts_to_enqueue = [];

		$this->enqueue_google_fonts( $google_fonts );
	}

	/**
	 * Print Google fonts.
	 *
	 * Enqueue all the frontend Google fonts.
	 *
	 * Fired by `wp_head` action.
	 *
	 * @since 1.0.0
	 * @access private
	 *
	 * @param array $google_fonts Optional. Google fonts to print in the frontend.
	 *                            Default is an empty array.
	 */
	private function enqueue_google_fonts( $google_fonts = [] ) {
		static $google_fonts_index = 0;

		$print_google_fonts = true;

		/**
		 * Print frontend google fonts.
		 *
		 * Filters whether to enqueue Google fonts in the frontend.
		 *
		 * @since 1.0.0
		 *
		 * @param bool $print_google_fonts Whether to enqueue Google fonts. Default is true.
		 */
		$print_google_fonts = apply_filters( 'elementor/frontend/print_google_fonts', $print_google_fonts );

		if ( ! $print_google_fonts ) {
			return;
		}

		// Print used fonts
		if ( ! empty( $google_fonts['google'] ) ) {
			$google_fonts_index++;

			foreach ( $google_fonts['google'] as &$font ) {
				$font = str_replace( ' ', '+', $font ) . ':100,100italic,200,200italic,300,300italic,400,400italic,500,500italic,600,600italic,700,700italic,800,800italic,900,900italic';
			}

			$fonts_url = sprintf( 'https://fonts.googleapis.com/css?family=%s', implode( rawurlencode( '|' ), $google_fonts['google'] ) );

			$subsets = [
				'ru_RU' => 'cyrillic',
				'bg_BG' => 'cyrillic',
				'he_IL' => 'hebrew',
				'el' => 'greek',
				'vi' => 'vietnamese',
				'uk' => 'cyrillic',
				'cs_CZ' => 'latin-ext',
				'ro_RO' => 'latin-ext',
				'pl_PL' => 'latin-ext',
			];
			$locale = get_locale();

			if ( isset( $subsets[ $locale ] ) ) {
				$fonts_url .= '&subset=' . $subsets[ $locale ];
			}

			wp_enqueue_style( 'google-fonts-' . $google_fonts_index, $fonts_url ); // phpcs:ignore WordPress.WP.EnqueuedResourceParameters.MissingVersion
		}

		if ( ! empty( $google_fonts['early'] ) ) {
			foreach ( $google_fonts['early'] as $current_font ) {
				$google_fonts_index++;

				//printf( '<link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/earlyaccess/%s.css">', strtolower( str_replace( ' ', '', $current_font ) ) );

				$font_url = sprintf( 'https://fonts.googleapis.com/earlyaccess/%s.css', strtolower( str_replace( ' ', '', $current_font ) ) );

				wp_enqueue_style( 'google-earlyaccess-' . $google_fonts_index, $font_url ); // phpcs:ignore WordPress.WP.EnqueuedResourceParameters.MissingVersion
			}
		}

	}

	/**
	 * Enqueue fonts.
	 *
	 * Enqueue all the frontend fonts.
	 *
	 * @since 1.2.0
	 * @access public
	 *
	 * @param array $font Fonts to enqueue in the frontend.
	 */
	public function enqueue_font( $font ) {
		if ( in_array( $font, $this->registered_fonts ) ) {
			return;
		}

		$this->fonts_to_enqueue[] = $font;
		$this->registered_fonts[] = $font;
	}

	/**
	 * Parse global CSS.
	 *
	 * Enqueue the global CSS file.
	 *
	 * @since 1.2.0
	 * @access protected
	 */
	protected function parse_global_css_code() {
		$scheme_css_file = new Global_CSS( 'global.css' );

		$scheme_css_file->enqueue();
	}

	/**
	 * Apply builder in content.
	 *
	 * Used to apply the Elementor page editor on the post content.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param string $content The post content.
	 *
	 * @return string The post content.
	 */
	public function apply_builder_in_content( $content ) {
		$this->restore_content_filters();

		if ( Plugin::$instance->preview->is_preview_mode() || $this->_is_excerpt ) {
			return $content;
		}

		// Remove the filter itself in order to allow other `the_content` in the elements
		$this->remove_content_filter();

		$post_id = get_the_ID();
		$builder_content = $this->get_builder_content( $post_id );

		if ( ! empty( $builder_content ) ) {
			$content = $builder_content;
			$this->remove_content_filters();
		}

		// Add the filter again for other `the_content` calls
		$this->add_content_filter();

		return $content;
	}

	/**
	 * Retrieve builder content.
	 *
	 * Used to render and return the post content with all the Elementor elements.
	 *
	 * Note that this method is an internal method, please use `get_builder_content_for_display()`.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param int  $post_id  The post ID.
	 * @param bool $with_css Optional. Whether to retrieve the content with CSS
	 *                       or not. Default is false.
	 *
	 * @return string The post content.
	 */
	public function get_builder_content( $post_id, $with_css = false ) {
		if ( post_password_required( $post_id ) ) {
			return '';
		}

		if ( ! Plugin::$instance->db->is_built_with_elementor( $post_id ) ) {
			return '';
		}

		$document = Plugin::$instance->documents->get_doc_for_frontend( $post_id );

		// Change the current post, so widgets can use `documents->get_current`.
		Plugin::$instance->documents->switch_to_document( $document );

		if ( $document->is_editable_by_current_user() ) {
			$this->admin_bar_edit_documents[ $document->get_main_id() ] = $document;
		}

		$data = $document->get_elements_data();

		/**
		 * Frontend builder content data.
		 *
		 * Filters the builder content in the frontend.
		 *
		 * @since 1.0.0
		 *
		 * @param array $data    The builder content.
		 * @param int   $post_id The post ID.
		 */
		$data = apply_filters( 'elementor/frontend/builder_content_data', $data, $post_id );

		if ( empty( $data ) ) {
			return '';
		}

		if ( ! $this->_is_excerpt ) {
			if ( $document->is_autosave() ) {
				$css_file = new Post_Preview( $document->get_post()->ID );
			} else {
				$css_file = new Post_CSS( $post_id );
			}

			$css_file->enqueue();
		}

		ob_start();

		// Handle JS and Customizer requests, with CSS inline.
		if ( is_customize_preview() || Utils::is_ajax() ) {
			$with_css = true;
		}

		if ( ! empty( $css_file ) && $with_css ) {
			$css_file->print_css();
		}

		$document->print_elements_with_wrapper( $data );

		$content = ob_get_clean();

		$content = $this->process_more_tag( $content );

		/**
		 * Frontend content.
		 *
		 * Filters the content in the frontend.
		 *
		 * @since 1.0.0
		 *
		 * @param string $content The content.
		 */
		$content = apply_filters( 'elementor/frontend/the_content', $content );

		if ( ! empty( $content ) ) {
			$this->_has_elementor_in_page = true;
		}

		Plugin::$instance->documents->restore_document();

		return $content;
	}

	/**
	 * Add Elementor menu to admin bar.
	 *
	 * Add new admin bar item only on singular pages, to display a link that
	 * allows the user to edit with Elementor.
	 *
	 * Fired by `admin_bar_menu` action.
	 *
	 * @since 1.3.4
	 * @access public
	 *
	 * @param \WP_Admin_Bar $wp_admin_bar WP_Admin_Bar instance, passed by reference.
	 */
	public function add_menu_in_admin_bar( \WP_Admin_Bar $wp_admin_bar ) {
		if ( empty( $this->admin_bar_edit_documents ) ) {
			return;
		}

		$queried_object_id = get_queried_object_id();

		$menu_args = [
			'id' => 'elementor_edit_page',
			'title' => __( 'Edit with Elementor', 'elementor' ),
		];

		if ( is_singular() && isset( $this->admin_bar_edit_documents[ $queried_object_id ] ) ) {
			$menu_args['href'] = $this->admin_bar_edit_documents[ $queried_object_id ]->get_edit_url();
			unset( $this->admin_bar_edit_documents[ $queried_object_id ] );
		}

		$wp_admin_bar->add_node( $menu_args );

		foreach ( $this->admin_bar_edit_documents as $document ) {
			$wp_admin_bar->add_menu( [
				'id' => 'elementor_edit_doc_' . $document->get_main_id(),
				'parent' => 'elementor_edit_page',
				'title' => sprintf( '<span class="elementor-edit-link-title">%s</span><span class="elementor-edit-link-type">%s</span>', $document->get_post()->post_title, $document::get_title() ),
				'href' => $document->get_edit_url(),
			] );
		}
	}

	/**
	 * Retrieve builder content for display.
	 *
	 * Used to render and return the post content with all the Elementor elements.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param int $post_id The post ID.
	 *
	 * @param bool $with_css Optional. Whether to retrieve the content with CSS
	 *                       or not. Default is false.
	 *
	 * @return string The post content.
	 */
	public function get_builder_content_for_display( $post_id, $with_css = false ) {
		if ( ! get_post( $post_id ) ) {
			return '';
		}

		$editor = Plugin::$instance->editor;

		// Avoid recursion
		if ( get_the_ID() === (int) $post_id ) {
			$content = '';
			if ( $editor->is_edit_mode() ) {
				$content = '<div class="elementor-alert elementor-alert-danger">' . __( 'Invalid Data: The Template ID cannot be the same as the currently edited template. Please choose a different one.', 'elementor' ) . '</div>';
			}

			return $content;
		}

		// Set edit mode as false, so don't render settings and etc. use the $is_edit_mode to indicate if we need the CSS inline
		$is_edit_mode = $editor->is_edit_mode();
		$editor->set_edit_mode( false );

		$with_css = $with_css ? true : $is_edit_mode;

		$content = $this->get_builder_content( $post_id, $with_css );

		// Restore edit mode state
		Plugin::$instance->editor->set_edit_mode( $is_edit_mode );

		return $content;
	}

	/**
	 * Start excerpt flag.
	 *
	 * Flags when `the_excerpt` is called. Used to avoid enqueueing CSS in the excerpt.
	 *
	 * @since 1.4.3
	 * @access public
	 *
	 * @param string $excerpt The post excerpt.
	 *
	 * @return string The post excerpt.
	 */
	public function start_excerpt_flag( $excerpt ) {
		$this->_is_excerpt = true;
		return $excerpt;
	}

	/**
	 * End excerpt flag.
	 *
	 * Flags when `the_excerpt` call ended.
	 *
	 * @since 1.4.3
	 * @access public
	 *
	 * @param string $excerpt The post excerpt.
	 *
	 * @return string The post excerpt.
	 */
	public function end_excerpt_flag( $excerpt ) {
		$this->_is_excerpt = false;
		return $excerpt;
	}

	/**
	 * Remove content filters.
	 *
	 * Remove WordPress default filters that conflicted with Elementor.
	 *
	 * @since 1.5.0
	 * @access public
	 */
	public function remove_content_filters() {
		$filters = [
			'wpautop',
			'shortcode_unautop',
			'wptexturize',
		];

		foreach ( $filters as $filter ) {
			// Check if another plugin/theme do not already removed the filter.
			if ( has_filter( 'the_content', $filter ) ) {
				remove_filter( 'the_content', $filter );
				$this->content_removed_filters[] = $filter;
			}
		}
	}

	/**
	 * Has Elementor In Page
	 *
	 * Determine whether the current page is using Elementor.
	 *
	 * @since 2.0.9
	 *
	 * @access public
	 * @return bool
	 */
	public function has_elementor_in_page() {
		return $this->_has_elementor_in_page;
	}

	/**
	 * Get Init Settings
	 *
	 * Used to define the default/initial settings of the object. Inheriting classes may implement this method to define
	 * their own default/initial settings.
	 *
	 * @since 2.3.0
	 *
	 * @access protected
	 * @return array
	 */
	protected function get_init_settings() {
		$is_preview_mode = Plugin::$instance->preview->is_preview_mode( Plugin::$instance->preview->get_post_id() );

		$settings = [
			'environmentMode' => [
				'edit' => $is_preview_mode,
				'wpPreview' => is_preview(),
			],
			'is_rtl' => is_rtl(),
			'breakpoints' => Responsive::get_breakpoints(),
			'version' => ELEMENTOR_VERSION,
			'urls' => [
				'assets' => ELEMENTOR_ASSETS_URL,
			],
		];

		$settings['settings'] = SettingsManager::get_settings_frontend_config();

		if ( is_singular() ) {
			$post = get_post();
			$settings['post'] = [
				'id' => $post->ID,
				'title' => $post->post_title,
				'excerpt' => $post->post_excerpt,
			];
		} else {
			$settings['post'] = [
				'id' => 0,
				'title' => wp_get_document_title(),
				'excerpt' => '',
			];
		}

		$empty_object = (object) [];

		if ( $is_preview_mode ) {
			$settings['elements'] = [
				'data' => $empty_object,
				'editSettings' => $empty_object,
				'keys' => $empty_object,
			];
		}

		if ( is_user_logged_in() ) {
			$user = wp_get_current_user();

			if ( ! empty( $user->roles ) ) {
				$settings['user'] = [
					'roles' => $user->roles,
				];
			}
		}

		return $settings;
	}

	/**
	 * Restore content filters.
	 *
	 * Restore removed WordPress filters that conflicted with Elementor.
	 *
	 * @since 1.5.0
	 * @access private
	 */
	private function restore_content_filters() {
		foreach ( $this->content_removed_filters as $filter ) {
			add_filter( 'the_content', $filter );
		}

		$this->content_removed_filters = [];
	}

	/**
	 * Process More Tag
	 *
	 * Respect the native WP (<!--more-->) tag
	 *
	 * @access private
	 * @since 2.0.4
	 *
	 * @param $content
	 *
	 * @return string
	 */
	private function process_more_tag( $content ) {
		$post = get_post();
		$content = str_replace( '&lt;!--more--&gt;', '<!--more-->', $content );
		$parts = get_extended( $content );
		if ( empty( $parts['extended'] ) ) {
			return $content;
		}

		if ( is_singular() ) {
			return $parts['main'] . '<div id="more-' . $post->ID . '"></div>' . $parts['extended'];
		}

		if ( empty( $parts['more_text'] ) ) {
			$parts['more_text'] = __( '(more&hellip;)', 'elementor' );
		}

		$more_link_text = sprintf(
			'<span aria-label="%1$s">%2$s</span>',
			sprintf(
				/* translators: %s: Name of current post */
				__( 'Continue reading %s', 'elementor' ),
				the_title_attribute( [
					'echo' => false,
				] )
			),
			$parts['more_text']
		);

		$more_link = apply_filters( 'the_content_more_link', sprintf( ' <a href="%s#more-%s" class="more-link elementor-more-link">%s</a>', get_permalink(), $post->ID, $more_link_text ), $more_link_text );

		return force_balance_tags( $parts['main'] ) . $more_link;
	}
}
