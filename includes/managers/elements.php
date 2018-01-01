<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Elements_Manager {
	/**
	 * @var Element_Base[]
	 */
	private $_element_types;

	private $_categories;

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function __construct() {
		$this->require_files();

		add_action( 'wp_ajax_elementor_save_builder', [ $this, 'ajax_save_builder' ] );
		add_action( 'wp_ajax_elementor_discard_changes', [ $this, 'ajax_discard_changes' ] );
	}

	/**
	 * @since 1.0.0
	 * @access public
	 * @param array        $element_data
	 *
	 * @param array        $element_args
	 *
	 * @param Element_Base $element_type
	 *
	 * @return Element_Base
	 */
	public function create_element_instance( array $element_data, array $element_args = [], Element_Base $element_type = null ) {
		if ( null === $element_type ) {
			if ( 'widget' === $element_data['elType'] ) {
				$element_type = Plugin::$instance->widgets_manager->get_widget_types( $element_data['widgetType'] );
			} else {
				$element_type = $this->get_element_types( $element_data['elType'] );
			}
		}

		if ( ! $element_type ) {
			return null;
		}

		$args = array_merge( $element_type->get_default_args(), $element_args );

		$element_class = $element_type->get_class_name();

		try {
			$element = new $element_class( $element_data, $args );
		} catch ( \Exception $e ) {
			return null;
		}

		return $element;
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function get_categories() {
		if ( null === $this->_categories ) {
			$this->init_categories();
		}

		return $this->_categories;
	}

	/**
	 * @since 1.7.12
	 * @access public
	*/
	public function add_category( $category_name, $category_properties, $offset = null ) {
		if ( null === $this->_categories ) {
			$this->init_categories();
		}

		if ( null === $offset ) {
			$this->_categories[ $category_name ] = $category_properties;
		}

		$this->_categories = array_slice( $this->_categories, 0, $offset, true )
			+ [
				$category_name => $category_properties,
			]
			+ array_slice( $this->_categories, $offset, null, true );
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function register_element_type( Element_Base $element ) {
		$this->_element_types[ $element->get_name() ] = $element;

		return true;
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function unregister_element_type( $name ) {
		if ( ! isset( $this->_element_types[ $name ] ) ) {
			return false;
		}

		unset( $this->_element_types[ $name ] );

		return true;
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function get_element_types( $element_name = null ) {
		if ( is_null( $this->_element_types ) ) {
			$this->_init_elements();
		}

		if ( null !== $element_name ) {
			return isset( $this->_element_types[ $element_name ] ) ? $this->_element_types[ $element_name ] : null;
		}

		return $this->_element_types;
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function get_element_types_config() {
		$config = [];

		foreach ( $this->get_element_types() as $element ) {
			$config[ $element->get_name() ] = $element->get_config();
		}

		return $config;
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function render_elements_content() {
		foreach ( $this->get_element_types() as $element_type ) {
			$element_type->print_template();
		}
	}

	public function ajax_discard_changes() {
		Plugin::$instance->editor->verify_ajax_nonce();

		$request = $_POST;

		if ( empty( $request['post_id'] ) ) {
			wp_send_json_error( new \WP_Error( 'no_post_id' ) );
		}

		$autosave = wp_get_post_autosave( $request['post_id'] );

		if ( $autosave ) {
			$deleted = wp_delete_post_revision( $autosave->ID );
			$success = $deleted && ! is_wp_error( $deleted );
		} else {
			$success = true;
		}

		if ( $success ) {
			wp_send_json_success();
		}

		wp_send_json_error();
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function ajax_save_builder() {
		Plugin::$instance->editor->verify_ajax_nonce();

		$request = $_POST;

		if ( empty( $request['post_id'] ) ) {
			wp_send_json_error( new \WP_Error( 'no_post_id' ) );
		}

		$post_id = $request['post_id'];

		if ( ! User::is_current_user_can_edit( $post_id ) ) {
			wp_send_json_error( new \WP_Error( 'no_access' ) );
		}

		$status = DB::STATUS_DRAFT;

		if ( isset( $request['status'] ) && in_array( $request['status'], [ DB::STATUS_PUBLISH, DB::STATUS_PRIVATE, DB::STATUS_PENDING, DB::STATUS_AUTOSAVE ] , true ) ) {
			$status = $request['status'];
		}

		$posted = json_decode( stripslashes( $request['data'] ), true );

		Plugin::$instance->db->save_editor( $post_id, $posted, $status );

		$return_data = [
			'config' => [
				'last_edited' => Utils::get_last_edited( $post_id ),
				'wp_preview' => [
					'url' => Utils::get_wp_preview_url( $post_id ),
				],
			],
		];

		/**
		 * Saved ajax data returned by the builder.
		 *
		 * Filters the ajax data returned when saving the post on the builder.
		 *
		 * @since 1.0.0
		 *
		 * @param array $return_data The returned data. Default is an empty array.
		 */
		$return_data = apply_filters( 'elementor/ajax_save_builder/return_data', $return_data, $post_id );

		wp_send_json_success( $return_data );
	}

	/**
	 * @since 1.0.0
	 * @access private
	*/
	private function _init_elements() {
		$this->_element_types = [];

		foreach ( [ 'section', 'column' ] as $element_name ) {
			$class_name = __NAMESPACE__ . '\Element_' . $element_name;

			$this->register_element_type( new $class_name() );
		}

		/**
		 * After elements registered.
		 *
		 * Fires after Elementor elements are registered.
		 *
		 * @since 1.0.0
		 */
		do_action( 'elementor/elements/elements_registered' );
	}

	/**
	 * @since 1.7.12
	 * @access private
	*/
	private function init_categories() {
		$this->_categories = [
			'basic' => [
				'title' => __( 'Basic', 'elementor' ),
				'icon' => 'eicon-font',
			],
			'general-elements' => [
				'title' => __( 'General Elements', 'elementor' ),
				'icon' => 'eicon-font',
			],
			'pojo' => [
				'title' => __( 'Pojo Themes', 'elementor' ),
				'icon' => 'eicon-pojome',
			],
			'wordpress' => [
				'title' => __( 'WordPress', 'elementor' ),
				'icon' => 'eicon-wordpress',
			],
		];
	}

	/**
	 * @since 1.0.0
	 * @access private
	*/
	private function require_files() {
		require_once ELEMENTOR_PATH . 'includes/base/element-base.php';

		require ELEMENTOR_PATH . 'includes/elements/column.php';
		require ELEMENTOR_PATH . 'includes/elements/section.php';
		require ELEMENTOR_PATH . 'includes/elements/repeater.php';
	}
}
