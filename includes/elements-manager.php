<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Elements_Manager {

	/**
	 * @var Element_Base[]
	 */
	protected $_registered_elements = null;

	private function _init_elements() {
		$this->_registered_elements = [];

		$this->register_element( __NAMESPACE__ . '\Element_Column' );
		$this->register_element( __NAMESPACE__ . '\Element_Section' );

		do_action( 'elementor/elements/elements_registered' );
	}

	private function require_files() {
		require_once ELEMENTOR_PATH . 'includes/elements/base.php';

		require ELEMENTOR_PATH . 'includes/elements/column.php';
		require ELEMENTOR_PATH . 'includes/elements/section.php';
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

		$this->_registered_elements[ $element_instance->get_id() ] = $element_instance;

		return true;
	}

	public function unregister_element( $id ) {
		if ( ! isset( $this->_registered_elements[ $id ] ) ) {
			return false;
		}
		unset( $this->_registered_elements[ $id ] );
		return true;
	}

	public function get_elements( $element_name = null ) {
		if ( is_null( $this->_elements ) ) {
			$this->_init_elements();
		}

		if ( $element_name ) {
			return isset( $this->_elements[ $element_name ] ) ? $this->_elements[ $element_name ] : null;
		}

		return $this->_elements;
	}

	public function get_registered_elements_config() {
		$config = [];

		foreach ( $this->get_elements() as $element_data ) {
			/** @var Element_Base $class */
			$class = $element_data['class'];

			$config[ $class::get_name() ] = $class::get_config();
		}

		return $config;
	}

	public function render_elements_content() {
		foreach ( $this->get_elements() as $element_data ) {
			/** @var Element_Base $class */
			$class = $element_data['class'];

			$class::print_template();
		}
	}

	public function ajax_save_builder() {
		if ( empty( $_POST['_nonce'] ) || ! wp_verify_nonce( $_POST['_nonce'], 'elementor-editing' ) ) {
			wp_send_json_error( new \WP_Error( 'token_expired' ) );
		}

		if ( empty( $_POST['post_id'] ) ) {
			wp_send_json_error( new \WP_Error( 'no_post_id' ) );
		}

		if ( ! User::is_current_user_can_edit( $_POST['post_id'] ) ) {
			wp_send_json_error( new \WP_Error( 'no_access' ) );
		}

		if ( isset( $_POST['revision'] ) && DB::REVISION_PUBLISH === $_POST['revision'] ) {
			$revision = DB::REVISION_PUBLISH;
		} else {
			$revision = DB::REVISION_DRAFT;
		}
		$posted = json_decode( stripslashes( html_entity_decode( $_POST['data'] ) ), true );

		Plugin::instance()->db->save_builder( $_POST['post_id'], $posted, $revision );

		wp_send_json_success();
	}

	public function __construct() {
		$this->require_files();

		add_action( 'wp_ajax_elementor_save_builder', [ $this, 'ajax_save_builder' ] );
	}
}
