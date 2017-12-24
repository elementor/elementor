<?php
namespace Elementor\Core;

use Elementor\Core\Base\Document;
use Elementor\Core\DocumentTypes\Post;
use Elementor\DB;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Documents_Manager {

	protected $types = [];

	/**
	 * @var Document[]
	 */
	protected $documents = [];
	private $current_doc_id;

	public function register_document_type( $type, $class ) {
		$this->types[ $type ] = $class;
		return $this;
	}

	public function get_document_type( $type ) {
		return isset( $this->types[ $type ] ) ? $this->types[ $type ] : $this->types['post'];
	}

	public function register_default_types() {
		$default_types = [
			'post' => Post::get_class_full_name(),
		];

		foreach ( $default_types as $type => $class ) {
			$this->register_document_type( $type, $class );
		}

		do_action( 'elementor/documents/register', $this );
	}

	/**
	 * @param int $post_id
	 *
	 * @return Document
	 */
	public function get( $post_id ) {
		if ( ! isset( $this->documents[ $post_id ] ) ) {
			$post_id_for_get_meta = $post_id;
			$parent_post_id = wp_is_post_revision( $post_id );
			if ( $parent_post_id ) {
				$post_id_for_get_meta = $parent_post_id;
			}
			$doc_type = get_post_meta( $post_id_for_get_meta, '_elementor_template_type', true );

			$doc_type_class = $this->get_document_type( $doc_type );
			$this->documents[ $post_id ] = new $doc_type_class( [
				'post_id' => $post_id,
			] );
		}

		return $this->documents[ $post_id ];
	}

	/**
	 * @param string $class_name
	 * @param array $post_data
	 * @param array $meta_data
	 *
	 * @return Document
	 */
	public function create( $class_name, $post_data = [], $meta_data = [] ) {
		if ( empty( $post_data['post_title'] ) ) {
			$post_data['post_title'] = __( 'Elementor', '' );
			$update_title = true;
		}

		$post_id = wp_insert_post( $post_data );

		if ( ! empty( $update_title ) ) {
			$post_data['ID'] = $post_id;
			$post_data['post_title'] .= ' #' . $post_id;
			wp_update_post( $post_data );
		}

		add_post_meta( $post_id, '_elementor_edit_mode', 'builder' );

		foreach ( $meta_data as $key => $value ) {
			add_post_meta( $post_id, $key, $value );
		}

		$document = new $class_name( [
			'post_id' => $post_id,
		] );

		return $document;
	}

	/**
	 * @since 1.0.0
	 * @access public
	 */
	public function ajax_save() {
		Plugin::$instance->editor->verify_ajax_nonce();

		$request = $_POST;

		if ( empty( $request['post_id'] ) ) {
			wp_send_json_error( new \WP_Error( 'no_post_id' ) );
		}

		$document = $this->get( $request['post_id'] );

		if ( ! $document->is_built_with_elementor() || ! $document->is_editable_by_current_user() ) {
			wp_send_json_error( new \WP_Error( 'no_access' ) );
		}

		$status = DB::STATUS_DRAFT;

		if ( isset( $request['status'] ) && in_array( $request['status'], [ DB::STATUS_PUBLISH, DB::STATUS_PRIVATE, DB::STATUS_AUTOSAVE ] , true ) ) {
			$status = $request['status'];
		}

		// If the post is a draft - save the `autosave` to the original draft.
		// Allow a revision only if the original post is already published.
		if ( DB::STATUS_AUTOSAVE === $status && in_array( $document->get_post()->post_status, [ DB::STATUS_PUBLISH, DB::STATUS_PRIVATE ], true ) ) {
			$document = $document->get_autosave();
		}

		$data = [
			'elements' => json_decode( stripslashes( $request['elements'] ), true ),
			'settings' => json_decode( stripslashes( $request['settings'] ), true ),
		];

		$data['settings']['post_status'] = $status;

		$document->save( $data );

		$return_data = [
			'config' => [
				'wp_preview' => [
					'url' => $document->get_permalink(),
				],
			],
		];

		/**
		 * Filters the ajax data returned when saving the post on the builder.
		 *
		 * @since 1.0.0
		 *
		 * @param array $return_data The returned data. Default is an empty array.
		 */
		$return_data = apply_filters( 'elementor/ajax_save_builder/return_data', $return_data, $document->get_post()->ID );

		wp_send_json_success( $return_data );
	}

	public function ajax_discard_changes() {
		Plugin::$instance->editor->verify_ajax_nonce();

		$request = $_POST;

		if ( empty( $request['post_id'] ) ) {
			wp_send_json_error( new \WP_Error( 'no_post_id' ) );
		}

		$document = $this->get( $request['post_id'] );

		$autosave = $document->get_autosave( 0, false );

		if ( $autosave ) {
			$success = $autosave->delete();
		} else {
			$success = true;
		}

		if ( $success ) {
			wp_send_json_success();
		} else {
			wp_send_json_error();
		}
	}

	public function __construct() {
		$this->register_default_types();

		add_action( 'wp_ajax_elementor_save_builder', [ $this, 'ajax_save' ] );
		add_action( 'wp_ajax_elementor_discard_changes', [ $this, 'ajax_discard_changes' ] );
	}

	public function set_current( $post_id ) {
		$this->current_doc_id = $post_id;
	}

	public function get_current() {
		return $this->get( $this->current_doc_id );
	}
}
