<?php
namespace Elementor\TemplateLibrary;

use Elementor\Api;
use Elementor\Core\Settings\Manager as SettingsManager;
use Elementor\TemplateLibrary\Classes\Import_Images;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Manager {

	/**
	 * @var Source_Base[]
	 */
	protected $_registered_sources = [];

	private $_import_images = null;

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function __construct() {
		$this->register_default_sources();

		$this->init_ajax_calls();
	}

	/**
	 * @since 1.0.0
	 * @access public
	 * @return Import_Images
	 */
	public function get_import_images_instance() {
		if ( null === $this->_import_images ) {
			$this->_import_images = new Import_Images();
		}

		return $this->_import_images;
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
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

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function unregister_source( $id ) {
		if ( ! isset( $this->_registered_sources[ $id ] ) ) {
			return false;
		}

		unset( $this->_registered_sources[ $id ] );

		return true;
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function get_registered_sources() {
		return $this->_registered_sources;
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function get_source( $id ) {
		$sources = $this->get_registered_sources();

		if ( ! isset( $sources[ $id ] ) ) {
			return false;
		}

		return $sources[ $id ];
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function get_templates() {
		$templates = [];

		foreach ( $this->get_registered_sources() as $source ) {
			$templates = array_merge( $templates, $source->get_items() );
		}

		return $templates;
	}

	/**
	 * @since 1.9.0
	 * @access public
	 */
	public function get_library_data( array $args ) {
		if ( ! empty( $args['sync'] ) ) {
			Api::get_templates_data( true );
		}

		return [
			'templates' => $this->get_templates(),
			'config' => [],
		];
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function save_template( array $args ) {
		$validate_args = $this->ensure_args( [ 'post_id', 'source', 'content', 'type' ], $args );

		if ( is_wp_error( $validate_args ) ) {
			return $validate_args;
		}

		$source = $this->get_source( $args['source'] );

		if ( ! $source ) {
			return new \WP_Error( 'template_error', 'Template source not found.' );
		}

		$args['content'] = json_decode( stripslashes( $args['content'] ), true );

		if ( 'page' === $args['type'] ) {
			$page = SettingsManager::get_settings_managers( 'page' )->get_model( $args['post_id'] );

			$args['page_settings'] = $page->get_data( 'settings' );
		}

		$template_id = $source->save_item( $args );

		if ( is_wp_error( $template_id ) ) {
			return $template_id;
		}

		return $source->get_item( $template_id );
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function update_template( array $template_data ) {
		// TODO: Temp patch since 1.5.0.
		if ( isset( $template_data['data'] ) ) {
			$template_data['content'] = $template_data['data'];

			unset( $template_data['data'] );
		}
		// END Patch.
		$validate_args = $this->ensure_args( [ 'source', 'content', 'type' ], $template_data );

		if ( is_wp_error( $validate_args ) ) {
			return $validate_args;
		}

		$source = $this->get_source( $template_data['source'] );

		if ( ! $source ) {
			return new \WP_Error( 'template_error', 'Template source not found.' );
		}

		$template_data['content'] = json_decode( stripslashes( $template_data['content'] ), true );

		$update = $source->update_item( $template_data );

		if ( is_wp_error( $update ) ) {
			return $update;
		}

		return $source->get_item( $template_data['id'] );
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function update_templates( array $args ) {
		foreach ( $args['templates'] as $template_data ) {
			$result = $this->update_template( $template_data );

			if ( is_wp_error( $result ) ) {
				return $result;
			}
		}

		return true;
	}

	/**
	 * @since 1.5.0
	 * @access public
	 * @param array $args
	 *
	 * @return array|bool|\WP_Error
	 */
	public function get_template_data( array $args ) {
		$validate_args = $this->ensure_args( [ 'source', 'template_id' ], $args );

		if ( is_wp_error( $validate_args ) ) {
			return $validate_args;
		}

		if ( isset( $args['edit_mode'] ) ) {
			Plugin::$instance->editor->set_edit_mode( $args['edit_mode'] );
		}

		$source = $this->get_source( $args['source'] );

		if ( ! $source ) {
			return new \WP_Error( 'template_error', 'Template source not found.' );
		}

		return $source->get_data( $args );
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function delete_template( array $args ) {
		$validate_args = $this->ensure_args( [ 'source', 'template_id' ], $args );

		if ( is_wp_error( $validate_args ) ) {
			return $validate_args;
		}

		$source = $this->get_source( $args['source'] );

		if ( ! $source ) {
			return new \WP_Error( 'template_error', 'Template source not found.' );
		}

		return $source->delete_template( $args['template_id'] );
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function export_template( array $args ) {
		$validate_args = $this->ensure_args( [ 'source', 'template_id' ], $args );

		if ( is_wp_error( $validate_args ) ) {
			return $validate_args;
		}

		$source = $this->get_source( $args['source'] );

		if ( ! $source ) {
			return new \WP_Error( 'template_error', 'Template source not found.' );
		}

		// If you reach this line, the export was not successful.
		return $source->export_template( $args['template_id'] );
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function import_template() {
		/** @var Source_Local $source */
		$source = $this->get_source( 'local' );

		return $source->import_template();
	}

	/**
	 * @since 1.9.0
	 * @access public
	 */
	public function mark_template_as_favorite( $args ) {
		$validate_args = $this->ensure_args( [ 'source', 'template_id', 'favorite' ], $args );

		if ( is_wp_error( $validate_args ) ) {
			return $validate_args;
		}

		$source = $this->get_source( $args['source'] );

		return $source->mark_as_favorite( $args['template_id'], filter_var( $args['favorite'], FILTER_VALIDATE_BOOLEAN ) );
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function on_import_template_success() {
		wp_redirect( admin_url( 'edit.php?post_type=' . Source_Local::CPT ) );
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function on_import_template_error( \WP_Error $error ) {
		echo $error->get_error_message();
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function on_export_template_error( \WP_Error $error ) {
		_default_wp_die_handler( $error->get_error_message(), 'Elementor Library' );
	}

	/**
	 * @since 1.0.0
	 * @access private
	*/
	private function register_default_sources() {
		$sources = [
			'local',
			'remote',
		];

		foreach ( $sources as $source_filename ) {
			$class_name = ucwords( $source_filename );
			$class_name = str_replace( '-', '_', $class_name );

			$this->register_source( __NAMESPACE__ . '\Source_' . $class_name );
		}
	}

	/**
	 * @since 1.0.0
	 * @access private
	*/
	private function handle_ajax_request( $ajax_request ) {
		Plugin::$instance->editor->verify_ajax_nonce();

		$result = call_user_func( [ $this, $ajax_request ], $_REQUEST );

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

	/**
	 * @since 1.0.0
	 * @access private
	*/
	private function init_ajax_calls() {
		$allowed_ajax_requests = [
			'get_library_data',
			'get_template_data',
			'save_template',
			'update_templates',
			'delete_template',
			'export_template',
			'import_template',
			'mark_template_as_favorite',
		];

		foreach ( $allowed_ajax_requests as $ajax_request ) {
			add_action( 'wp_ajax_elementor_' . $ajax_request, function() use ( $ajax_request ) {
				$this->handle_ajax_request( $ajax_request );
			} );
		}
	}

	/**
	 * @since 1.0.0
	 * @access private
	*/
	private function ensure_args( array $required_args, array $specified_args ) {
		$not_specified_args = array_diff( $required_args, array_keys( array_filter( $specified_args ) ) );

		if ( $not_specified_args ) {
			return new \WP_Error( 'arguments_not_specified', 'The required argument(s) `' . implode( ', ', $not_specified_args ) . '` not specified' );
		}

		return true;
	}
}
