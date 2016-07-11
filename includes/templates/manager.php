<?php
namespace Elementor\Templates;

use Elementor\User;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Manager {

	/**
	 * @var Type_Base[]
	 */
	protected $_registered_types = [];

	public function init() {
		include( ELEMENTOR_PATH . 'includes/templates/types/base.php' );

		$types = [
			'local',
		];

		foreach ( $types as $types_filename ) {
			include( ELEMENTOR_PATH . 'includes/templates/types/' . $types_filename . '.php' );

			$class_name = ucwords( $types_filename );
			$class_name = str_replace( '-', '_', $class_name );

			$this->register_type( __NAMESPACE__ . '\Type_' . $class_name );
		}
	}

	public function register_type( $type_class, $args = [] ) {
		if ( ! class_exists( $type_class ) ) {
			return new \WP_Error( 'type_class_name_not_exists' );
		}

		$type_instance = new $type_class( $args );

		if ( ! $type_instance instanceof Type_Base ) {
			return new \WP_Error( 'wrong_instance_type' );
		}
		$this->_registered_types[ $type_instance->get_id() ] = $type_instance;

		return true;
	}

	public function unregister_type( $id ) {
		if ( ! isset( $this->_registered_types[ $id ] ) ) {
			return false;
		}
		unset( $this->_registered_types[ $id ] );
		return true;
	}

	public function get_registered_types() {
		return $this->_registered_types;
	}

	public function get_type( $id ) {
		$types = $this->get_registered_types();

		if ( ! isset( $types[ $id ] ) ) {
			return false;
		}
		return $types[ $id ];
	}

	public function get_templates() {
		$templates = [];
		foreach ( $this->get_registered_types() as $type ) {
			$templates += $type->get_items();
		}
		return $templates;
	}

	public function print_templates_json() {
		$templates = $this->get_templates();

		wp_send_json_success( $templates );
	}

	public function save_template() {
		if ( empty( $_POST['type'] ) ) {
			wp_send_json_error( [ 'message' => 'Template `type` was not specified.' ] );
		}

		$type = $this->get_type( $_POST['type'] );

		if ( ! $type ) {
			wp_send_json_error( [ 'message' => 'Template type not found.' ] );
		}

		$posted = json_decode( stripslashes( html_entity_decode( $_POST['data'] ) ), true );

		$return = $type->save_item( $posted, ! empty( $_POST['title'] ) ? $_POST['title'] : '' );

		if ( is_wp_error( $return ) ) {
			wp_send_json_error( [ 'message' => $return->get_error_message() ] );
		}

		wp_send_json_success( [ 'item' => $type->get_item( $return ) ] );
	}

	public function get_template() {
		if ( empty( $_POST['type'] ) ) {
			wp_send_json_error( [ 'message' => 'Template `type` was not specified.' ] );
		}

		if ( empty( $_POST['item_id'] ) ) {
			wp_send_json_error( [ 'message' => 'Template `type_id` was not specified.' ] );
		}

		$type = $this->get_type( $_POST['type'] );

		if ( ! $type ) {
			wp_send_json_error( [ 'message' => 'Template type not found.' ] );
		}

		wp_send_json_success( [ 'template' => $type->get_template( $_POST['item_id'] ) ] );
	}

	public function delete_template() {
		if ( empty( $_POST['type'] ) ) {
			wp_send_json_error( [ 'message' => 'Template `type` was not specified.' ] );
		}

		if ( empty( $_POST['item_id'] ) ) {
			wp_send_json_error( [ 'message' => 'Template `type_id` was not specified.' ] );
		}

		$type = $this->get_type( $_POST['type'] );

		if ( ! $type ) {
			wp_send_json_error( [ 'message' => 'Template type not found.' ] );
		}

		$type->delete_template( $_POST['item_id'] );

		wp_send_json_success();
	}

	public function export_template() {
		// TODO: Add nonce for security
		if ( empty( $_REQUEST['type'] ) ) {
			wp_send_json_error( [ 'message' => 'Template `type` was not specified.' ] );
		}

		if ( empty( $_REQUEST['item_id'] ) ) {
			wp_send_json_error( [ 'message' => 'Template `type_id` was not specified.' ] );
		}

		$type = $this->get_type( $_REQUEST['type'] );

		if ( ! $type ) {
			wp_send_json_error( [ 'message' => 'Template type not found.' ] );
		}

		$type->export_template( $_REQUEST['item_id'] );
	}

	public function import_template() {
		/** @var Type_Local $type */
		$type = $this->get_type( 'local' );
		$type->import_template();
	}

	public function __construct() {
		add_action( 'init', [ $this, 'init' ] );

		add_action( 'wp_ajax_elementor_get_templates', [ $this, 'print_templates_json' ] );
		add_action( 'wp_ajax_elementor_save_template', [ $this, 'save_template' ] );
		add_action( 'wp_ajax_elementor_get_template', [ $this, 'get_template' ] );
		add_action( 'wp_ajax_elementor_delete_template', [ $this, 'delete_template' ] );
		add_action( 'wp_ajax_elementor_export_template', [ $this, 'export_template' ] );
		add_action( 'wp_ajax_elementor_import_template', [ $this, 'import_template' ] );
	}
}
