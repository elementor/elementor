<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Frontend {

	private $_enqueue_google_fonts = [];
	private $_enqueue_google_early_access_fonts = [];

	private $_column_widths = [];
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

	protected function _print_sections( $sections_data ) {
		foreach ( $sections_data as $section_data ) {
			$section = new Element_Section( $section_data );

			$section->print_element();
		}
	}

	public function body_class( $classes = [] ) {
		if ( is_singular() && 'builder' === Plugin::instance()->db->get_edit_mode( get_the_ID() ) ) {
			$classes[] = 'elementor-page';
		}
		return $classes;
	}

	public function enqueue_scripts() {
		$suffix = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? '' : '.min';

		wp_register_script(
			'waypoints',
			ELEMENTOR_ASSETS_URL . 'lib/waypoints/waypoints' . $suffix . '.js',
			[
				'jquery',
			],
			'2.0.2',
			true
		);

		wp_register_script(
			'jquery-numerator',
			ELEMENTOR_ASSETS_URL . 'lib/jquery-numerator/jquery-numerator' . $suffix . '.js',
			[
				'jquery',
			],
			'0.2.0',
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
	}

	public function print_css() {
		$post_id = get_the_ID();
		$data = Plugin::instance()->db->get_plain_editor( $post_id );
		$edit_mode = Plugin::instance()->db->get_edit_mode( $post_id );

		if ( empty( $data ) || 'builder' !== $edit_mode )
			return;

		$container_width = absint( get_option( 'elementor_container_width' ) );
		if ( ! empty( $container_width ) ) {
			$this->stylesheet->add_rules( '.elementor-section.elementor-section-boxed > .elementor-container', 'max-width:' . $container_width . 'px' );
		}

		$this->_parse_schemes_css_code();

		foreach ( $data as $section_data ) {
			$section = new Element_Section( $section_data );

			$this->_parse_style_item( $section );
		}

		$css_code = $this->stylesheet;

		if ( ! empty( $this->_column_widths ) ) {
			$css_code .= '@media (min-width: 768px) {';
			foreach ( $this->_column_widths as $column_width ) {
				$css_code .= $column_width;
			}
			$css_code .= '}';
		}

		if ( empty( $css_code ) )
			return;

		?>
		<style id="elementor-frontend-stylesheet"><?php echo $css_code; ?></style>
		<?php

		// Enqueue used fonts
		if ( ! empty( $this->_enqueue_google_fonts ) ) {
			foreach ( $this->_enqueue_google_fonts as &$font ) {
				$font = str_replace( ' ', '+', $font ) . ':100,100italic,200,200italic,300,300italic,400,400italic,500,500italic,600,600italic,700,700italic,800,800italic,900,900italic';
			}

			$fonts_url = sprintf( 'https://fonts.googleapis.com/css?family=%s', implode( '|', $this->_enqueue_google_fonts ) );

			$subsets = [
				'ru_RU' => 'cyrillic',
				'uk' => 'cyrillic',
				'bg_BG' => 'cyrillic',
				'vi' => 'vietnamese',
				'el' => 'greek',
				'he_IL' => 'hebrew',
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

	protected function _add_enqueue_font( $font ) {
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

	protected function _parse_style_item( Element_Base $element ) {
		$element_settings = $element->get_settings();

		$element_unique_class = '.elementor-element.elementor-element-' . $element->get_id();

		if ( 'column' === $element->get_name() ) {
			if ( ! empty( $element_settings['_inline_size'] ) ) {
				$this->_column_widths[] = $element_unique_class . '{width:' . $element_settings['_inline_size'] . '%;}';
			}
		}

		foreach ( $element->get_style_controls() as $control ) {
			if ( ! isset( $element_settings[ $control['name'] ] ) )
				continue;

			$control_value = $element_settings[ $control['name'] ];
			if ( ! is_numeric( $control_value ) && ! is_float( $control_value ) && empty( $control_value ) ) {
				continue;
			}

			$control_obj = Plugin::instance()->controls_manager->get_control( $control['type'] );
			if ( ! $control_obj ) {
				continue;
			}

			if ( ! $element->is_control_visible( $control ) ) {
				continue;
			}

			if ( Controls_Manager::FONT === $control_obj->get_type() ) {
				$this->_add_enqueue_font( $control_value );
			}

			foreach ( $control['selectors'] as $selector => $css_property ) {
				$output_selector = str_replace( '{{WRAPPER}}', $element_unique_class, $selector );
				$output_css_property = $control_obj->get_replace_style_values( $css_property, $control_value );

				if ( ! $output_css_property ) {
					continue;
				}

				$device = ! empty( $control['responsive'] ) ? $control['responsive'] : Element_Base::RESPONSIVE_DESKTOP;

				$this->stylesheet->add_rules( $output_selector, $output_css_property, $device );
			}
		}

		$children = $element->get_children();

		if ( ! empty( $children ) ) {
			foreach ( $children as $child_element ) {
				$this->_parse_style_item( $child_element );
			}
		}
	}

	protected function _parse_schemes_css_code() {
		foreach ( Plugin::instance()->widgets_manager->get_widget_types() as $widget ) {
			foreach ( $widget->get_scheme_controls() as $control ) {
				$scheme_value = Plugin::instance()->schemes_manager->get_scheme_value( $control['scheme']['type'], $control['scheme']['value'] );
				if ( empty( $scheme_value ) )
					continue;

				if ( ! empty( $control['scheme']['key'] ) ) {
					$scheme_value = $scheme_value[ $control['scheme']['key'] ];
				}

				if ( empty( $scheme_value ) )
					continue;

				$element_unique_class = 'elementor-widget-' . $widget->get_name();
				$control_obj = Plugin::instance()->controls_manager->get_control( $control['type'] );

				if ( Controls_Manager::FONT === $control_obj->get_type() ) {
					$this->_add_enqueue_font( $scheme_value );
				}

				foreach ( $control['selectors'] as $selector => $css_property ) {
					$output_selector = str_replace( '{{WRAPPER}}', '.' . $element_unique_class, $selector );
					$output_css_property = $control_obj->get_replace_style_values( $css_property, $scheme_value );

					$this->stylesheet->add_rules( $output_selector, $output_css_property );
				}
			}
		}
	}

	public function apply_builder_in_content( $content ) {
		if ( ! $this->_is_frontend_mode )
			return $content;

		$post_id = get_the_ID();
		if ( post_password_required( $post_id ) )
			return $content;

		$data = Plugin::instance()->db->get_plain_editor( $post_id );
		$edit_mode = Plugin::instance()->db->get_edit_mode( $post_id );

		if ( empty( $data ) || 'builder' !== $edit_mode )
			return $content;

		ob_start(); ?>
		<div id="elementor" class="elementor">
			<div id="elementor-inner">
				<div id="elementor-section-wrap">
					<?php $this->_print_sections( $data ); ?>
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
			'id'    => 'elementor_edit_page',
			'title' => __( 'Edit with Elementor', 'elementor' ),
			'href'  => Utils::get_edit_link( $post_id ),
		] );
	}

	public function __construct() {
		if ( is_admin() )
			return;

		add_action( 'template_redirect', [ $this, 'init' ] );
		add_filter( 'the_content', [ $this, 'apply_builder_in_content' ] );
	}
}
