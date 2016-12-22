<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Frontend {

	private $_enqueue_google_fonts = [];
	private $_enqueue_google_early_access_fonts = [];

	private $_is_frontend_mode = false;

	/**
	 * @var Stylesheet
	 */
	private $stylesheet;

	public function init() {
		if ( Plugin::instance()->editor->is_edit_mode() || Plugin::instance()->preview->is_preview_mode() ) {
			return;
		}

		$this->_is_frontend_mode = true;

		$this->_init_stylesheet();

		add_action( 'wp_head', [ $this, 'print_css' ] );
		add_filter( 'body_class', [ $this, 'body_class' ] );
		add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_scripts' ] );
		add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_styles' ] );
		add_action( 'wp_footer', [ $this, 'wp_footer' ] );

		// Add Edit with the Elementor in Admin Bar
		add_action( 'admin_bar_menu', [ $this, 'add_menu_in_admin_bar' ], 200 );
	}

	private function _init_stylesheet() {
		$this->stylesheet = new Stylesheet();

		$breakpoints = Responsive::get_breakpoints();

		$this->stylesheet
			->add_device( 'mobile', $breakpoints['md'] - 1 )
			->add_device( 'tablet', $breakpoints['lg'] - 1 );
	}

	protected function _print_elements( $elements_data ) {
		foreach ( $elements_data as $element_data ) {
			$element = Plugin::instance()->elements_manager->create_element_instance( $element_data );

			$element->print_element();
		}
	}

	public function body_class( $classes = [] ) {
		if ( is_singular() && 'builder' === Plugin::instance()->db->get_edit_mode( get_the_ID() ) ) {
			$classes[] = 'elementor-page';
		}
		return $classes;
	}

	public function enqueue_scripts() {
		do_action( 'elementor/frontend/enqueue_scripts/before' );

		$suffix = Utils::is_script_debug() ? '' : '.min';

		wp_register_script(
			'waypoints',
			ELEMENTOR_ASSETS_URL . 'lib/waypoints/waypoints' . $suffix . '.js',
			[
				'jquery',
			],
			'4.0.1',
			true
		);

		wp_register_script(
			'jquery-numerator',
			ELEMENTOR_ASSETS_URL . 'lib/jquery-numerator/jquery-numerator' . $suffix . '.js',
			[
				'jquery',
			],
			'0.2.1',
			true
		);

		wp_register_script(
			'jquery-slick',
			ELEMENTOR_ASSETS_URL . 'lib/slick/slick' . $suffix . '.js',
			[
				'jquery',
			],
			'1.6.0',
			true
		);

		wp_register_script(
			'elementor-frontend',
			ELEMENTOR_ASSETS_URL . 'js/frontend' . $suffix . '.js',
			[
				'waypoints',
				'jquery-numerator',
				'jquery-slick',
			],
			Plugin::instance()->get_version(),
			true
		);
		wp_enqueue_script( 'elementor-frontend' );

		wp_localize_script(
			'elementor-frontend',
			'elementorFrontendConfig', [
				'isEditMode' => Plugin::instance()->editor->is_edit_mode(),
				'stretchedSectionContainer' => get_option( 'elementor_stretched_section_container', '' ),
				'is_rtl' => is_rtl(),
			]
		);

		do_action( 'elementor/frontend/enqueue_scripts/after' );
	}

	public function enqueue_styles() {
		$suffix = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? '' : '.min';

		$direction_suffix = is_rtl() ? '-rtl' : '';

		wp_enqueue_style(
			'elementor-icons',
			ELEMENTOR_ASSETS_URL . 'lib/eicons/css/elementor-icons' . $suffix . '.css',
			[],
			Plugin::instance()->get_version()
		);

		wp_register_style(
			'font-awesome',
			ELEMENTOR_ASSETS_URL . 'lib/font-awesome/css/font-awesome' . $suffix . '.css',
			[],
			'4.7.0'
		);

		// Elementor Animations
		wp_register_style(
			'elementor-animations',
			ELEMENTOR_ASSETS_URL . 'css/animations.min.css',
			[],
			ELEMENTOR_VERSION
		);

		wp_register_style(
			'elementor-frontend',
			ELEMENTOR_ASSETS_URL . 'css/frontend' . $direction_suffix . $suffix . '.css',
			[
				'elementor-icons',
				'font-awesome',
			],
			Plugin::instance()->get_version()
		);

		wp_enqueue_style( 'elementor-animations' );
		wp_enqueue_style( 'elementor-frontend' );

		$css_file = new Post_CSS_File( get_the_ID() );
		$css_file->enqueue();
	}

	public function print_css() {
		$container_width = absint( get_option( 'elementor_container_width' ) );

		if ( ! empty( $container_width ) ) {
			$this->stylesheet->add_rules( '.elementor-section.elementor-section-boxed > .elementor-container', 'max-width:' . $container_width . 'px' );
		}

		$this->_parse_schemes_css_code();

		$css_code = $this->stylesheet;

		if ( empty( $css_code ) )
			return;

		?>
		<style id="elementor-frontend-stylesheet"><?php echo $css_code; ?></style>
		<?php

		$this->print_google_fonts();
	}

	/**
	 * Handle style that do not printed in header
	 */
	function wp_footer() {
		// TODO: add JS to append the css to the `head` tag
		$this->print_google_fonts();
	}

	public function print_google_fonts() {
		// Enqueue used fonts
		if ( ! empty( $this->_enqueue_google_fonts ) ) {
			foreach ( $this->_enqueue_google_fonts as &$font ) {
				$font = str_replace( ' ', '+', $font ) . ':100,100italic,200,200italic,300,300italic,400,400italic,500,500italic,600,600italic,700,700italic,800,800italic,900,900italic';
			}

			$fonts_url = sprintf( 'https://fonts.googleapis.com/css?family=%s', implode( '|', $this->_enqueue_google_fonts ) );

			$subsets = [
				'ru_RU' => 'cyrillic',
				'bg_BG' => 'cyrillic',
				'he_IL' => 'hebrew',
				'el' => 'greek',
				'vi' => 'vietnamese',
				'uk' => 'cyrillic',
			];
			$locale = get_locale();

			if ( isset( $subsets[ $locale ] ) ) {
				$fonts_url .= '&subset=' . $subsets[ $locale ];
			}

			echo '<link rel="stylesheet" type="text/css" href="' . $fonts_url . '">';
			$this->_enqueue_google_fonts = [];
		}

		if ( ! empty( $this->_enqueue_google_early_access_fonts ) ) {
			foreach ( $this->_enqueue_google_early_access_fonts as $current_font ) {
				printf( '<link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/earlyaccess/%s.css">', strtolower( str_replace( ' ', '', $current_font ) ) );
			}
			$this->_enqueue_google_early_access_fonts = [];
		}
	}
	public function add_enqueue_font( $font ) {
		switch ( Fonts::get_font_type( $font ) ) {
			case Fonts::GOOGLE :
				if ( ! in_array( $font, $this->_enqueue_google_fonts ) )
					$this->_enqueue_google_fonts[] = $font;
				break;

			case Fonts::EARLYACCESS :
				if ( ! in_array( $font, $this->_enqueue_google_early_access_fonts ) )
					$this->_enqueue_google_early_access_fonts[] = $font;
				break;
		}
	}

	protected function _parse_schemes_css_code() {
		foreach ( Plugin::instance()->widgets_manager->get_widget_types() as $widget ) {
			$scheme_controls = $widget->get_scheme_controls();

			foreach ( $scheme_controls as $control ) {
				Post_CSS_File::add_control_rules( $this->stylesheet, $control, $widget->get_controls(), function ( $control ) {
					$scheme_value = Plugin::instance()->schemes_manager->get_scheme_value( $control['scheme']['type'], $control['scheme']['value'] );

					if ( empty( $scheme_value ) ) {
						return null;
					}

					if ( ! empty( $control['scheme']['key'] ) ) {
						$scheme_value = $scheme_value[ $control['scheme']['key'] ];
					}

					if ( empty( $scheme_value ) ) {
						return null;
					}

					$control_obj = Plugin::instance()->controls_manager->get_control( $control['type'] );

					if ( Controls_Manager::FONT === $control_obj->get_type() ) {
						$this->add_enqueue_font( $scheme_value );
					}

					return $scheme_value;
				}, [ '{{WRAPPER}}' ], [ '.elementor-widget-' . $widget->get_name() ] );
			}
		}
	}

	public function apply_builder_in_content( $content ) {
		// Remove the filter itself in order to allow other `the_content` in the elements
		remove_filter( 'the_content', [ $this, 'apply_builder_in_content' ] );

		if ( ! $this->_is_frontend_mode )
			return $content;

		$post_id = get_the_ID();
		$builder_content = $this->get_builder_content( $post_id );

		if ( ! empty( $builder_content ) ) {
			$content = $builder_content;
		}

		// Add the filter again for other `the_content` calls
		add_filter( 'the_content', [ $this, 'apply_builder_in_content' ] );

		return $content;
	}

	public function get_builder_content( $post_id, $with_css = false ) {
		if ( post_password_required( $post_id ) ) {
			return '';
		}

		$data = Plugin::instance()->db->get_plain_editor( $post_id );
		$edit_mode = Plugin::instance()->db->get_edit_mode( $post_id );

		if ( empty( $data ) || 'builder' !== $edit_mode )
			return '';

		$css_file = new Post_CSS_File( $post_id );
		$css_file->enqueue();

		ob_start();

		// Handle JS and Customizer requests, with css inline
		if ( is_customize_preview() || Utils::is_ajax() ) {
			$with_css = true;
		}

		if ( $with_css ) {
			echo '<style>' . $css_file->get_css() . '</style>';
		}

		?>
		<div class="elementor elementor-<?php echo $post_id; ?>">
			<div class="elementor-inner">
				<div class="elementor-section-wrap">
					<?php $this->_print_elements( $data ); ?>
				</div>
			</div>
		</div>
		<?php
		return apply_filters( 'elementor/frontend/the_content', ob_get_clean() );
	}

	function add_menu_in_admin_bar( \WP_Admin_Bar $wp_admin_bar ) {
		$post_id = get_the_ID();
		$is_not_builder_mode = ! is_singular() || ! User::is_current_user_can_edit( $post_id ) || 'builder' !== Plugin::instance()->db->get_edit_mode( $post_id );

		if ( $is_not_builder_mode ) {
			return;
		}

		$wp_admin_bar->add_node( [
			'id' => 'elementor_edit_page',
			'title' => __( 'Edit with Elementor', 'elementor' ),
			'href' => Utils::get_edit_link( $post_id ),
		] );
	}

	public function get_builder_content_for_display( $post_id ) {
		if ( ! get_post( $post_id ) ) {
			return '';
		}

		// Avoid recursion
		if ( get_the_ID() === (int) $post_id ) {
			$content = '';
			if ( Plugin::instance()->editor->is_edit_mode() ) {
				$content = '<div class="elementor-alert elementor-alert-danger">' . __( 'Invalid Data: The Template ID cannot be the same as the currently edited template. Please choose a different one.', 'elementor' ) . '</div>';
			}

			return $content;
		}

		// Set edit mode as false, so don't render settings and etc. use the $is_edit_mode to indicate if we need the css inline
		$is_edit_mode = Plugin::instance()->editor->is_edit_mode();
		Plugin::instance()->editor->set_edit_mode( false );

		// Change the global post to current library post, so widgets can use `get_the_ID` and other post data
		if ( isset( $GLOBALS['post'] ) ) {
			$global_post = $GLOBALS['post'];
		}

		$GLOBALS['post'] = get_post( $post_id );

		$content = $this->get_builder_content( $post_id, $is_edit_mode );

		// Restore global post
		if ( isset( $global_post ) ) {
			$GLOBALS['post'] = $global_post;
		} else {
			unset( $GLOBALS['post'] );
		}

		// Restore edit mode state
		Plugin::instance()->editor->set_edit_mode( $is_edit_mode );

		return $content;
	}

	public function __construct() {
		// We don't need this class in admin side, but in AJAX requests
		if ( is_admin() && ! ( defined( 'DOING_AJAX' ) && DOING_AJAX ) ) {
			return;
		}

		add_action( 'template_redirect', [ $this, 'init' ] );
		add_filter( 'the_content', [ $this, 'apply_builder_in_content' ] );
	}
}
