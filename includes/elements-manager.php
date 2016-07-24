<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Elements_Manager {

	/**
	 * @var Element_Base[]
	 */
	protected $_register_elements = null;

	private function _init_elements() {
		include_once( ELEMENTOR_PATH . 'includes/elements/base.php' );

		include( ELEMENTOR_PATH . 'includes/elements/column.php' );
		include( ELEMENTOR_PATH . 'includes/elements/section.php' );

		$this->_register_elements = [];

		$this->register_element( __NAMESPACE__ . '\Element_Column' );
		$this->register_element( __NAMESPACE__ . '\Element_Section' );

		do_action( 'elementor/elements/elements_registered' );
	}

	public function get_categories() {
		// TODO: Need to filter
		return [
			'basic' => [
				'title' => __( 'Elements', 'elementor' ),
				'icon' => 'font',
			],
			'pojo' => [
				'title' => __( 'Pojo Themes', 'elementor' ),
				'icon' => 'pojome',
			],
			'wordpress' => [
				'title' => __( 'WordPress', 'elementor' ),
				'icon' => 'wordpress',
			],
		];
	}

	public function register_element( $element_class ) {
		if ( ! class_exists( $element_class ) ) {
			return new \WP_Error( 'element_class_name_not_exists' );
		}

		$element_instance = new $element_class();

		if ( ! $element_instance instanceof Element_Base ) {
			return new \WP_Error( 'wrong_instance_element' );
		}

		$this->_register_elements[ $element_instance->get_id() ] = $element_instance;

		return true;
	}

	public function unregister_element( $id ) {
		if ( ! isset( $this->_register_elements[ $id ] ) ) {
			return false;
		}
		unset( $this->_register_elements[ $id ] );
		return true;
	}

	public function get_register_elements() {
		if ( is_null( $this->_register_elements ) ) {
			$this->_init_elements();
		}
		return $this->_register_elements;
	}

	public function get_element( $id ) {
		$elements = $this->get_register_elements();

		if ( ! isset( $elements[ $id ] ) ) {
			return false;
		}

		return $elements[ $id ];
	}

	public function get_register_elements_data() {
		$data = [];
		foreach ( $this->get_register_elements() as $element ) {
			$data[ $element->get_id() ] = $element->get_data();
		}

		return $data;
	}

	public function render_elements_content() {
		foreach ( $this->get_register_elements() as $element ) {
			$element->print_template();
		}
	}

	public function ajax_save_builder() {
		if ( isset( $_POST['revision'] ) && DB::REVISION_PUBLISH === $_POST['revision'] ) {
			$revision = DB::REVISION_PUBLISH;
		} else {
			$revision = DB::REVISION_DRAFT;
		}
		$posted = json_decode( stripslashes( html_entity_decode( $_POST['data'] ) ), true );

		Plugin::instance()->db->save_builder( $_POST['post_id'], $posted, $revision );
		die;
	}

	public function __construct() {
		add_action( 'wp_ajax_elementor_save_builder', [ $this, 'ajax_save_builder' ] );
	}
}
