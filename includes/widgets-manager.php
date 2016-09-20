<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widgets_Manager {

	private $_widgets = null;

	private function _init_widgets() {

		$build_widgets_filename = [
			'heading',
			'image',
			'text-editor',
			'video',
			'button',
			'divider',
			'spacer',
			'image-box',
			'google-maps',
			'icon',
			'icon-box',
			'image-gallery',
			'image-carousel',
			'icon-list',
			'counter',
			'progress',
			'testimonial',
			'tabs',
			'accordion',
			'toggle',
			'social-icons',
			'alert',
			'audio',
			'shortcode',
			'html',
			'menu-anchor',
			'sidebar',
		];

		$this->_widgets = [];

		foreach ( $build_widgets_filename as $widget_filename ) {
			include( ELEMENTOR_PATH . 'includes/widgets/' . $widget_filename . '.php' );

			$class_name = str_replace( '-', '_', $widget_filename );

			$this->register_widget( __NAMESPACE__ . '\Widget_' . $class_name );
		}

		$this->_register_wp_widgets();

		do_action( 'elementor/widgets/widgets_registered' );
	}

	private function _register_wp_widgets() {
		global $wp_widget_factory;

		include( ELEMENTOR_PATH . 'includes/widgets/wordpress.php' );

		foreach ( $wp_widget_factory->widgets as $widget_class => $widget_obj ) {
			// Skip Pojo widgets
			$allowed_widgets = [
				'Pojo_Widget_Recent_Posts',
				'Pojo_Widget_Posts_Group',
				'Pojo_Widget_Gallery',
				'Pojo_Widget_Recent_Galleries',
				'Pojo_Slideshow_Widget',
				'Pojo_Forms_Widget',
				'Pojo_Widget_News_Ticker',
			];

			if ( $widget_obj instanceof \Pojo_Widget_Base && ! in_array( $widget_class, $allowed_widgets ) ) {
				continue;
			}

			$this->register_widget( __NAMESPACE__ . '\Widget_WordPress', [ 'widget_name' => $widget_class ] );
		}
	}

	private function _require_files() {
		require_once ELEMENTOR_PATH . 'includes/elements/base.php';
		require ELEMENTOR_PATH . 'includes/widgets/base.php';
		require ELEMENTOR_PATH . 'includes/widgets/multi-section-base.php';
	}

	public function register_widget( $widget_class, $args = [] ) {
		/** @var Widget_Base $widget_class */
		if ( ! class_exists( $widget_class ) ) {
			return new \WP_Error( 'widget_class_name_not_exists' );
		}

		$this->_widgets[ $widget_class::get_name() ] = [
			'class' => $widget_class,
			'args' => $args,
		];

		return true;
	}

	public function unregister_widget( $name ) {
		if ( ! isset( $this->_widgets[ $name ] ) ) {
			return false;
		}

		unset( $this->_widgets[ $name ] );

		return true;
	}

	public function get_widgets( $widget_name = null ) {
		if ( is_null( $this->_widgets ) ) {
			$this->_init_widgets();
		}

		if ( $widget_name ) {
			return isset( $this->_widgets[ $widget_name ] ) ? $this->_widgets[ $widget_name ] : null;
		}

		return $this->_widgets;
	}

	public function get_registered_widgets_config() {
		$config = [];

		foreach ( $this->get_widgets() as $widget_data ) {
			/** @var Widget_Base $class */
			$class = $widget_data['class'];

			$config[ $class::get_name() ] = $class::get_config();
		}

		return $config;
	}

	public function ajax_render_widget() {
		if ( empty( $_POST['_nonce'] ) || ! wp_verify_nonce( $_POST['_nonce'], 'elementor-editing' ) ) {
			wp_send_json_error( new \WP_Error( 'token_expired' ) );
		}

		if ( empty( $_POST['post_id'] ) ) {
			wp_send_json_error( new \WP_Error( 'no_post_id', 'No post_id' ) );
		}

		if ( ! User::is_current_user_can_edit( $_POST['post_id'] ) ) {
			wp_send_json_error( new \WP_Error( 'no_access' ) );
		}

		// Override the global $post for the render
		$GLOBALS['post'] = get_post( (int) $_POST['post_id'] );

		$data = json_decode( stripslashes( html_entity_decode( $_POST['data'] ) ), true );

		// Start buffering
		ob_start();
		if ( false !== $widget ) {
			$data['settings'] = $widget->get_parse_values( $data['settings'] );
			$widget->render_content( $data['settings'] );
		}
		$widget_data = $this->get_widgets( $data['widgetType'] );

		$render_html = ob_get_clean();

		wp_send_json_success(
			[
				'render' => $render_html,
			]
		);
	}

	public function ajax_get_wp_widget_form() {
		if ( empty( $_POST['_nonce'] ) || ! wp_verify_nonce( $_POST['_nonce'], 'elementor-editing' ) ) {
			die;
		}

		$widget_type = $_POST['widget_type'];
		$widget_obj = $this->get_widgets( $widget_type );

		if ( ! $widget_obj instanceof Widget_WordPress ) {
			wp_send_json_error();
		}

		$data = json_decode( stripslashes( html_entity_decode( $_POST['data'] ) ), true );

		wp_send_json_success( $widget_obj->get_form( $data ) );
	}

	public function render_widgets_content() {
		foreach ( $this->get_widgets() as $widget_data ) {
			/** @var Widget_Base $class */
			$class = $widget_data['class'];

			$class::print_template();
		}
	}

	public function __construct() {
		$this->_require_files();

		add_action( 'wp_ajax_elementor_render_widget', [ $this, 'ajax_render_widget' ] );
		add_action( 'wp_ajax_elementor_editor_get_wp_widget_form', [ $this, 'ajax_get_wp_widget_form' ] );
	}
}
