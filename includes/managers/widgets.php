<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widgets_Manager {
	/**
	 * @var Widget_Base[]
	 */
	private $_widget_types = null;

	private function _init_widgets() {
		$build_widgets_filename = [
			'common',
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

			$class_name = __NAMESPACE__ . '\Widget_' . $class_name;

			$this->register_widget_type( new $class_name() );
		}

		$this->_register_wp_widgets();

		do_action( 'elementor/widgets/widgets_registered', $this );
	}

	private function _register_wp_widgets() {
		global $wp_widget_factory;

		include( ELEMENTOR_PATH . 'includes/widgets/wordpress.php' );

		// Skip Pojo widgets
		$pojo_allowed_widgets = [
			'Pojo_Widget_Recent_Posts',
			'Pojo_Widget_Posts_Group',
			'Pojo_Widget_Gallery',
			'Pojo_Widget_Recent_Galleries',
			'Pojo_Slideshow_Widget',
			'Pojo_Forms_Widget',
			'Pojo_Widget_News_Ticker',

			'Pojo_Widget_WC_Products',
			'Pojo_Widget_WC_Products_Category',
			'Pojo_Widget_WC_Product_Categories',
		];

		// Allow themes/plugins to filter out their widgets
		$black_list = apply_filters( 'elementor/widgets/black_list', [] );

		foreach ( $wp_widget_factory->widgets as $widget_class => $widget_obj ) {

			if ( in_array( $widget_class, $black_list ) ) {
				continue;
			}

			if ( $widget_obj instanceof \Pojo_Widget_Base && ! in_array( $widget_class, $pojo_allowed_widgets ) ) {
				continue;
			}

			$elementor_widget_class = __NAMESPACE__ . '\Widget_WordPress';

			$this->register_widget_type( new $elementor_widget_class( [], [ 'widget_name' => $widget_class ] ) );
		}
	}

	private function _require_files() {
		require ELEMENTOR_PATH . 'includes/base/widget-base.php';
	}

	public function register_widget_type( Widget_Base $widget ) {
		if ( is_null( $this->_widget_types ) ) {
			$this->_init_widgets();
		}

		$this->_widget_types[ $widget->get_name() ] = $widget;

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

		if ( null !== $widget_name ) {
			return isset( $this->_widget_types[ $widget_name ] ) ? $this->_widget_types[ $widget_name ] : null;
		}

		return $this->_widget_types;
	}

	public function get_widget_types_config() {
		$config = [];

		foreach ( $this->get_widget_types() as $widget_key => $widget ) {
			if ( ! $widget->show_in_panel() ) {
				continue;
			}

			$config[ $widget_key ] = $widget->get_config();
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

		$data = json_decode( stripslashes( $_POST['data'] ), true );

		// Start buffering
		ob_start();

		$widget = Plugin::$instance->elements_manager->create_element_instance( $data );

		if ( ! $widget ) {
			wp_send_json_error();

			return;
		}

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

		if ( empty( $_POST['widget_type'] ) ) {
			wp_send_json_error();
		}

		if ( empty( $_POST['data'] ) ) {
			$_POST['data'] = [];
		}

		$data = json_decode( stripslashes( $_POST['data'] ), true );

		$element_data = [
			'id' => $_POST['id'],
			'elType' => 'widget',
			'widgetType' => $_POST['widget_type'],
			'settings' => $data,
		];

		/**
		 * @var $widget_obj Widget_WordPress
		 */
		$widget_obj = Plugin::$instance->elements_manager->create_element_instance( $element_data );

		if ( ! $widget_obj ) {
			wp_send_json_error();
		}

		wp_send_json_success( $widget_obj->get_form() );
	}

	public function render_widgets_content() {
		foreach ( $this->get_widget_types() as $widget ) {
			$widget->print_template();
		}
	}

	public function get_widgets_frontend_settings_keys() {
		$keys = [];

		foreach ( $this->get_widget_types() as $widget_type_name => $widget_type ) {
			$widget_type_keys = $widget_type->get_frontend_settings_keys();

			if ( $widget_type_keys ) {
				$keys[ $widget_type_name ] = $widget_type_keys;
			}
		}

		return $keys;
	}

	public function enqueue_widgets_scripts() {
		foreach ( $this->get_widget_types() as $widget ) {
			$widget->enqueue_scripts();
		}
	}

	public function __construct() {
		$this->_require_files();

		add_action( 'wp_ajax_elementor_render_widget', [ $this, 'ajax_render_widget' ] );
		add_action( 'wp_ajax_elementor_editor_get_wp_widget_form', [ $this, 'ajax_get_wp_widget_form' ] );
	}
}
