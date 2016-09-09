<?php
namespace Elementor\TemplateLibrary;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Manager {

	/**
	 * @var Source_Base[]
	 */
	protected $_registered_sources = [];

	public function init() {
		include( ELEMENTOR_PATH . 'includes/template-library/classes/class-import-images.php' );
		include( ELEMENTOR_PATH . 'includes/template-library/sources/base.php' );

		$sources = [
			'local',
			'remote',
		];

		foreach ( $sources as $source_filename ) {
			include( ELEMENTOR_PATH . 'includes/template-library/sources/' . $source_filename . '.php' );

			$class_name = ucwords( $source_filename );
			$class_name = str_replace( '-', '_', $class_name );

			$this->register_source( __NAMESPACE__ . '\Source_' . $class_name );
		}
	}

	public function register_source( $source_class, $args = [] ) {
		if ( ! class_exists( $source_class ) ) {
			return new \WP_Error( 'source_class_name_not_exists' );
		}

		$source_instance = new $source_class( $args );

		if ( ! $source_instance instanceof Source_Base ) {
			return new \WP_Error( 'wrong_instance_source' );
		}
		$this->_registered_sources[ $source_instance->get_id() ] = $source_instance;

		return true;
	}

	public function unregister_source( $id ) {
		if ( ! isset( $this->_registered_sources[ $id ] ) ) {
			return false;
		}
		unset( $this->_registered_sources[ $id ] );
		return true;
	}

	public function get_registered_sources() {
		return $this->_registered_sources;
	}

	public function get_source( $id ) {
		$sources = $this->get_registered_sources();

		if ( ! isset( $sources[ $id ] ) ) {
			return false;
		}
		return $sources[ $id ];
	}

	public function get_templates() {
		$templates = [];
		foreach ( $this->get_registered_sources() as $source ) {
			$templates = array_merge( $templates, $source->get_items() );
		}
		return $templates;
	}

	public function save_template() {
		if ( empty( $_POST['source'] ) ) {
			return new \WP_Error( 'template_error', 'Template `source` was not specified.' );
		}

		$source = $this->get_source( $_POST['source'] );

		if ( ! $source ) {
			return new \WP_Error( 'template_error', 'Template source not found.' );
		}

		$_POST['data'] = json_decode( stripslashes( html_entity_decode( $_POST['data'] ) ), true );

		$template_id = $source->save_item( $_POST );

		if ( is_wp_error( $template_id ) ) {
			return $template_id;
		}

		return $source->get_item( $template_id );
	}

	public function get_template_content() {
		if ( empty( $_POST['source'] ) ) {
			return new \WP_Error( 'template_error', 'Template `source` was not specified.' );
		}

		if ( empty( $_POST['template_id'] ) || empty( $_POST['post_id'] ) ) {
			return new \WP_Error( 'template_error', '`template_id` was not specified.' );
		}

		// Override the global $post for the render
		$GLOBALS['post'] = get_post( (int) $_POST['post_id'] );

		$source = $this->get_source( $_POST['source'] );

		if ( ! $source ) {
			return new \WP_Error( 'template_error', 'Template source not found.' );
		}

		return $source->get_content( $_POST['template_id'] );
	}

	public function delete_template() {
		if ( empty( $_POST['source'] ) ) {
			return new \WP_Error( 'template_error', 'Template `source` was not specified.' );
		}

		if ( empty( $_POST['template_id'] ) ) {
			return new \WP_Error( 'template_error', 'Template `source_id` was not specified.' );
		}

		$source = $this->get_source( $_POST['source'] );

		if ( ! $source ) {
			return new \WP_Error( 'template_error', 'Template source not found.' );
		}

		$source->delete_template( $_POST['template_id'] );

		return true;
	}

	public function export_template() {
		// TODO: Add nonce for security
		if ( empty( $_REQUEST['source'] ) ) {
			return new \WP_Error( 'template_error', 'Template `source` was not specified.' );
		}

		if ( empty( $_REQUEST['template_id'] ) ) {
			return new \WP_Error( 'template_error', '`template_id` was not specified.' );
		}

		$source = $this->get_source( $_REQUEST['source'] );

		if ( ! $source ) {
			return new \WP_Error( 'template_error', 'Template source not found.' );
		}

		return $source->export_template( $_REQUEST['template_id'] );
	}

	public function import_template() {
		/** @var Source_Local $source */
		$source = $this->get_source( 'local' );

		return $source->import_template();
	}

	public function on_import_template_success() {
		wp_redirect( admin_url( 'edit.php?post_type=' . Source_Local::CPT ) );
	}

	public function on_import_template_error( \WP_Error $error ) {
		echo $error->get_error_message();
	}

	public function on_export_template_error( \WP_Error $error ) {
		_default_wp_die_handler( $error->get_error_message(), 'Elementor Library' );
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
