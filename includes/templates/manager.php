<?php
namespace Elementor\Templates;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Manager {

	/**
	 * @var Type_Base[]
	 */
	protected $_registered_types = [];

	public function init() {
		include( ELEMENTOR_PATH . 'includes/templates/classes/class-import-images.php' );
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

	public function save_template() {
		if ( empty( $_POST['type'] ) ) {
			return new \WP_Error( 'template_error', 'Template `type` was not specified.' );
		}

		$type = $this->get_type( $_POST['type'] );

		if ( ! $type ) {
			return new \WP_Error( 'template_error', 'Template type not found.' );
		}

		$posted = json_decode( stripslashes( html_entity_decode( $_POST['data'] ) ), true );

		$return = $type->save_item( $posted, ! empty( $_POST['title'] ) ? $_POST['title'] : '' );

		if ( is_wp_error( $return ) ) {
			return $return;
		}

		return $type->get_item( $return );
	}

	public function get_template_content() {
		if ( empty( $_POST['type'] ) ) {
			return new \WP_Error( 'template_error', 'Template `type` was not specified.' );
		}

		if ( empty( $_POST['item_id'] ) || empty( $_POST['post_id'] ) ) {
			return new \WP_Error( 'template_error', 'Template `type_id` was not specified.' );
		}

		// Override the global $post for the render
		$GLOBALS['post'] = get_post( (int) $_POST['post_id'] );

		$type = $this->get_type( $_POST['type'] );

		if ( ! $type ) {
			return new \WP_Error( 'template_error', 'Template type not found.' );
		}

		return $type->get_template_content( $_POST['item_id'] );
	}

	public function get_template_url() {
		if ( empty( $_POST['id'] ) ) {
			return new \WP_Error( 'template_error', 'Template `id` was not specified.' );
		}

		return get_permalink( $_POST['id'] );
	}

	public function delete_template() {
		if ( empty( $_POST['type'] ) ) {
			return new \WP_Error( 'template_error', 'Template `type` was not specified.' );
		}

		if ( empty( $_POST['item_id'] ) ) {
			return new \WP_Error( 'template_error', 'Template `type_id` was not specified.' );
		}

		$type = $this->get_type( $_POST['type'] );

		if ( ! $type ) {
			return new \WP_Error( 'template_error', 'Template type not found.' );
		}

		$type->delete_template( $_POST['item_id'] );

		return true;
	}

	public function export_template() {
		// TODO: Add nonce for security
		if ( empty( $_REQUEST['type'] ) ) {
			return new \WP_Error( 'template_error', 'Template `type` was not specified.' );
		}

		if ( empty( $_REQUEST['item_id'] ) ) {
			return new \WP_Error( 'template_error', 'Template `type_id` was not specified.' );
		}

		$type = $this->get_type( $_REQUEST['type'] );

		if ( ! $type ) {
			return new \WP_Error( 'template_error', 'Template type not found.' );
		}

		return $type->export_template( $_REQUEST['item_id'] );
	}

	public function import_template() {
		/** @var Type_Local $type */
		$type = $this->get_type( 'local' );

		return $type->import_template();
	}

	public function on_import_template_success() {
		wp_redirect( admin_url( 'edit.php?post_type=' . Type_Local::CPT ) );
	}

	public function on_import_template_error( \WP_Error $error ) {
		echo $error->get_error_message();
	}

	private function handle_ajax_request( $ajax_request, $args ) {
		$result = call_user_func_array( [ $this, $ajax_request ], $args );

		$request_type = ! empty( $_SERVER['HTTP_X_REQUESTED_WITH'] ) && strtolower( $_SERVER['HTTP_X_REQUESTED_WITH'] ) === 'xmlhttprequest' ? 'ajax' : 'direct';

		if ( 'direct' === $request_type ) {
			$callback = 'on_' . $ajax_request;

			if ( method_exists( $this, $callback ) ) {
				$this->$callback( $result );
			}
		}

		if ( is_wp_error( $result ) ) {
			if ( 'ajax' === $request_type ) {
				wp_send_json_error( $result );
			}

			$callback = "on_{$ajax_request}_error";

			if ( method_exists( $this, $callback ) ) {
				$this->$callback( $result );
			}

			die;
		}

		if ( 'ajax' === $request_type ) {
			wp_send_json_success( $result );
		}

		$callback = "on_{$ajax_request}_success";

		if ( method_exists( $this, $callback ) ) {
			$this->$callback( $result );
		}

		die;
	}

	private function init_ajax_calls() {
		$allowed_ajax_requests = [
			'get_templates',
			'get_template_content',
			'get_template_url',
			'save_template',
			'delete_template',
			'export_template',
			'import_template',
		];

		foreach ( $allowed_ajax_requests as $ajax_request ) {
			add_action( 'wp_ajax_elementor_' . $ajax_request, function() use ( $ajax_request ) {
				$this->handle_ajax_request( $ajax_request, func_get_args() );
			} );
		}
	}

	public function __construct() {
		add_action( 'init', [ $this, 'init' ] );

		$this->init_ajax_calls();
	}
}
