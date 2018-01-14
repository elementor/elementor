<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor elements manager class.
 *
 * Elementor elements manager handler class is responsible for registering and
 * initializing all the supported elements.
 *
 * @since 1.0.0
 */
class Elements_Manager {

	/**
	 * Element types.
	 *
	 * Holds the list of all the element types.
	 *
	 * @access private
	 *
	 * @var Element_Base[]
	 */
	private $_element_types;

	/**
	 * Element categories.
	 *
	 * Holds the list of all the element categories.
	 *
	 * @access private
	 *
	 * @var
	 */
	private $_categories;

	/**
	 * Elements constructor.
	 *
	 * Initializing Elementor elements manager.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function __construct() {
		$this->require_files();

		add_action( 'wp_ajax_elementor_save_builder', [ $this, 'ajax_save_builder' ] );
		add_action( 'wp_ajax_elementor_discard_changes', [ $this, 'ajax_discard_changes' ] );
	}

	/**
	 * Create element instance.
	 *
	 * This method creates a new element instance for any given element.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param array        $element_data Element data.
	 * @param array        $element_args Optional. Element arguments. Default is
	 *                                   an empty array.
	 * @param Element_Base $element_type Optional. Element type. Default is null.
	 *
	 * @return Element_Base|null Element instance if element created, or null
	 *                           otherwise.
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
	 * Get element categories.
	 *
	 * Retrieve the list of categories the element belongs to.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return array Element categories.
	 */
	public function get_categories() {
		if ( null === $this->_categories ) {
			$this->init_categories();
		}

		return $this->_categories;
	}

	/**
	 * Add element category.
	 *
	 * Register new category for the element.
	 *
	 * @since 1.7.12
	 * @access public
	 *
	 * @param string $category_name       Category name.
	 * @param array  $category_properties Category properties.
	 * @param int    $offset              Optional. Where to add the category in
	 *                                    the categories array. Default is null.
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
	 * Register element type.
	 *
	 * Add new type to the list of registered types.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param Element_Base $element Element instance.
	 *
	 * @return bool Whether the element type was registered.
	 */
	public function register_element_type( Element_Base $element ) {
		$this->_element_types[ $element->get_name() ] = $element;

		return true;
	}

	/**
	 * Unregister element type.
	 *
	 * Remove element type from the list of registered types.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param string $name Element name.
	 *
	 * @return bool Whether the element type was unregister, or not.
	 */
	public function unregister_element_type( $name ) {
		if ( ! isset( $this->_element_types[ $name ] ) ) {
			return false;
		}

		unset( $this->_element_types[ $name ] );

		return true;
	}

	/**
	 * Get element types.
	 *
	 * Retrieve the list of all the element types, or if a spesific element name
	 * was provided retrieve his element types.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param string $element_name Optional. Element name. Default is null.
	 *
	 * @return null|Element_Base[] Element types, or a list of all the element
	 *                             types, or null if element does not exist.
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
	 * Get element types config.
	 *
	 * Retrieve the config of all the element types.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return array Element types config.
	 */
	public function get_element_types_config() {
		$config = [];

		foreach ( $this->get_element_types() as $element ) {
			$config[ $element->get_name() ] = $element->get_config();
		}

		return $config;
	}

	/**
	 * Render elements content.
	 *
	 * Used to generate the elements templates on the editor.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function render_elements_content() {
		foreach ( $this->get_element_types() as $element_type ) {
			$element_type->print_template();
		}
	}

	/**
	 * Ajax discard changes.
	 *
	 * Ajax handler for Elementor discard_changes. Handles the discarded changes
	 * in the builder by deleting autosaved revisions.
	 *
	 * Fired by `wp_ajax_elementor_discard_changes` action.
	 *
	 * @since 1.9.0
	 * @access public
	 */
	public function ajax_discard_changes() {
		Plugin::$instance->editor->verify_ajax_nonce();

		$request = $_POST;

		if ( empty( $request['post_id'] ) ) {
			wp_send_json_error( new \WP_Error( 'no_post_id' ) );
		}

		$autosave = Utils::get_post_autosave( $request['post_id'] );

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
	 * Ajax save builder.
	 *
	 * Ajax handler for Elementor save_builder. Handles the saved data returned
	 * by the builder.
	 *
	 * Fired by `wp_ajax_elementor_save_builder` action.
	 *
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
	 * Init elements.
	 *
	 * Initialize Elementor elements by registering the supported elements.
	 * Elementor supports by default `section` element and `column` element.
	 *
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
	 * Init categories.
	 *
	 * Initialize the element categories.
	 *
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
	 * Require files.
	 *
	 * Require Elementor element base class and column, section and repeater
	 * elements.
	 *
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
