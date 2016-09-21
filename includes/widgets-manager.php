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

		$this->_widget_types = [];

		foreach ( $build_widgets_filename as $widget_filename ) {
			include( ELEMENTOR_PATH . 'includes/widgets/' . $widget_filename . '.php' );

			$class_name = str_replace( '-', '_', $widget_filename );

			$this->register_widget( __NAMESPACE__ . '\Widget_' . $class_name );
		}

//		$this->_register_wp_widgets();
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
		// require ELEMENTOR_PATH . 'includes/widgets/multi-section-base.php';
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

	public function unregister_widget_type( $name ) {
		if ( ! isset( $this->_widget_types[ $name ] ) ) {
			return false;
		}

		unset( $this->_widget_types[ $name ] );

		return true;
	}

	public function get_widget_types( $widget_name = null ) {
		if ( is_null( $this->_widget_types ) ) {
			$this->_init_widgets();
		}

		if ( $widget_name ) {
			return isset( $this->_widget_types[ $widget_name ] ) ? $this->_widget_types[ $widget_name ] : null;
		}

		return $this->_widget_types;
	}

	public function get_widget_types_config() {
		$config = [];

			/** @var Widget_Base $class */
			$class = $widget_data['class'];
		foreach ( $this->get_widget_types() as $widget ) {

			$config[ $widget->get_name() ] = $widget->get_config();
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

		/** @var Widget_Base|Widget_WordPress $widget_data */
		$widget_data = $this->get_widget_types( $data['widgetType'] );

		/** @var Widget_Base $widget */
		$widget = new $widget_data['class']( $data );

		$widget->render_content();

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

		$widget_obj = $this->get_widget_types( $widget_type );

		if ( ! $widget_obj instanceof Widget_WordPress ) {
			wp_send_json_error();
		}

		$data = json_decode( stripslashes( html_entity_decode( $_POST['data'] ) ), true );

		wp_send_json_success( $widget_obj->get_form( $data ) );
	}

	public function render_widgets_content() {
			/** @var Widget_Base $class */
			$class = $widget_data['class'];

			$class::print_template();
		foreach ( $this->get_widget_types() as $widget ) {
		}
	}

	public function __construct() {
		$this->_require_files();

		add_action( 'wp_ajax_elementor_render_widget', [ $this, 'ajax_render_widget' ] );
		add_action( 'wp_ajax_elementor_editor_get_wp_widget_form', [ $this, 'ajax_get_wp_widget_form' ] );
	}
}
