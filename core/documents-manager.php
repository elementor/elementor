<?php
namespace Elementor\Core;

use Elementor\Core\Base\Document;
use Elementor\Core\DocumentTypes\Post;
use Elementor\Core\Utils\Exceptions;
use Elementor\DB;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * Elementor documents manager class.
 *
 * Elementor documents manager handler class is responsible for registering and
 * managing Elementor documents.
 *
 * @since 2.0.0
 */
class Documents_Manager {

	/**
	 * Registered document groups.
	 *
	 * Holds the list of all the registered document groups.
	 *
	 * @since 2.0.0
	 * @access protected
	 *
	 * @var array
	 */
	protected $groups = [];

	/**
	 * Registered types.
	 *
	 * Holds the list of all the registered types.
	 *
	 * @since 2.0.0
	 * @access protected
	 *
	 * @var Document[]
	 */
	protected $types = [];

	/**
	 * Registered documents.
	 *
	 * Holds the list of all the registered documents.
	 *
	 * @since 2.0.0
	 * @access protected
	 *
	 * @var Document[]
	 */
	protected $documents = [];

	/**
	 * Current document.
	 *
	 * Holds the current document.
	 *
	 * @since 2.0.0
	 * @access protected
	 *
	 * @var Document
	 */
	protected $current_doc;

	/**
	 * Switched data.
	 *
	 * Holds the current document when changing to the requested post.
	 *
	 * @since 2.0.0
	 * @access protected
	 *
	 * @var Document
	 */
	protected $switched_data = [];

	/**
	 * Documents manager constructor.
	 *
	 * Initializing the Elementor documents manager.
	 *
	 * @since 2.0.0
	 * @access public
	 */
	public function __construct() {
		$this->register_default_types();

		add_action( 'elementor/ajax/register_actions', [ $this, 'register_ajax_actions' ] );
	}

	/**
	 * Register ajax actions.
	 *
	 * Process ajax action handles when saving data and discarding changes.
	 *
	 * Fired by `elementor/ajax/register_actions` action.
	 *
	 * @since 2.0.0
	 * @access public
	 *
	 * @param Ajax_Manager $ajax_manager An instance of the ajax manager.
	 */
	public function register_ajax_actions( $ajax_manager ) {
		$ajax_manager->register_ajax_action( 'save_builder', [ $this, 'ajax_save' ] );
		$ajax_manager->register_ajax_action( 'discard_changes', [ $this, 'ajax_discard_changes' ] );
	}

	/**
	 * Register default types.
	 *
	 * Registers the default document types.
	 *
	 * @since 2.0.0
	 * @access public
	 */
	public function register_default_types() {
		$default_types = [
			'post' => Post::get_class_full_name(),
		];

		foreach ( $default_types as $type => $class ) {
			$this->register_document_type( $type, $class );
		}

		/**
		 * Register Elementor documents.
		 *
		 * Fires after Elementor registers the default document types.
		 *
		 * @since 2.0.0
		 *
		 * @param Documents_Manager $this The document manager instance.
		 */
		do_action( 'elementor/documents/register', $this );
	}

	/**
	 * Register document type.
	 *
	 * Registers a single document.
	 *
	 * @since 2.0.0
	 * @access public
	 *
	 * @param string $type  Document type name.
	 * @param string $class The name of the class that registers the document type.
	 *                      Full name with the namespace.
	 *
	 * @return Documents_Manager The updated document manager instance.
	 */
	public function register_document_type( $type, $class ) {
		$this->types[ $type ] = $class;
		return $this;
	}

	/**
	 * Get document.
	 *
	 * Retrieve the document data based on a post ID.
	 *
	 * @since 2.0.0
	 * @access public
	 *
	 * @param int  $post_id    Post ID.
	 * @param bool $from_cache Optional. Whether to retrieve cached data. Default is true.
	 *
	 * @return false|Document Document data or false if post ID was not entered.
	 */
	public function get( $post_id, $from_cache = true ) {
		if ( ! $post_id ) {
			return false;
		}
		if ( $from_cache || ! isset( $this->documents[ $post_id ] ) ) {
			$doc_type = get_post_meta( $post_id, Document::TYPE_META_KEY, true );

			$doc_type_class = $this->get_document_type( $doc_type );
			$this->documents[ $post_id ] = new $doc_type_class( [
				'post_id' => $post_id,
			] );
		}

		return $this->documents[ $post_id ];
	}

	public function get_doc_or_auto_save( $id = 0, $user_id = 0 ) {
		if ( ! $id ) {
			$id = get_the_ID();
		}

		$document = $this->get( $id );
		if ( $document && $document->get_autosave_id( $user_id ) ) {
			$document = $document->get_autosave( $user_id );
		}

		return $document;
	}

	public function get_doc_for_frontend( $post_id = 0 ) {
		// TODO: remove on release 2.0.0.
		if ( 0 === $post_id ) {
			$post_id = get_the_ID();
		}

		if ( is_preview() || Plugin::$instance->preview->is_preview_mode() ) {
			$document = $this->get_doc_or_auto_save( $post_id, get_current_user_id() );
		} else {
			$document = $this->get( $post_id );
		}

		return $document;
	}

	public function get_document_type( $type ) {
		return isset( $this->types[ $type ] ) ? $this->types[ $type ] : $this->types['post'];
	}

	/**
	 * @return Document[]
	 */
	public function get_document_types() {
		return $this->types;
	}

	/**
	 * @param string $type
	 * @param array $post_data
	 * @param array $meta_data
	 *
	 * @return Document
	 */
	public function create( $type, $post_data = [], $meta_data = [] ) {
		if ( ! isset( $this->types[ $type ] ) ) {
			wp_die( sprintf( 'Type %s does not exist.', $type ) );
		}

		if ( empty( $post_data['post_title'] ) ) {
			$post_data['post_title'] = __( 'Elementor', 'elementor' );
			if ( 'post' !== $type ) {
				$post_data['post_title'] .= ' ' . call_user_func( $this->types[ $type ], 'get_title' );
			}
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

		/** @var Document $document */

		$class_name = $this->types[ $type ];

		$document = new $class_name( [
			'post_id' => $post_id,
		] );

		$document->save_type();

		return $document;
	}

	/**
	 * @since 2.0.0
	 * @access public
	 *
	 * @param $request
	 *
	 * @return array
	 * @throws \Exception If current user don't have permissions to edit the post or the post is not using Elementor.
	 */
	public function ajax_save( $request ) {
		$document = $this->get( $request['editor_post_id'] );

		if ( ! $document->is_built_with_elementor() || ! $document->is_editable_by_current_user() ) {
			throw new \Exception( 'Access denied.' );
		}

		$this->switch_to_document( $document );

		// Set the post as global post.
		Plugin::$instance->db->switch_to_post( $document->get_post()->ID );

		$status = DB::STATUS_DRAFT;

		if ( isset( $request['status'] ) && in_array( $request['status'], [ DB::STATUS_PUBLISH, DB::STATUS_PRIVATE, DB::STATUS_PENDING, DB::STATUS_AUTOSAVE ] , true ) ) {
			$status = $request['status'];
		}

		if ( DB::STATUS_AUTOSAVE === $status ) {
			// If the post is a draft - save the `autosave` to the original draft.
			// Allow a revision only if the original post is already published.
			if ( in_array( $document->get_post()->post_status, [ DB::STATUS_PUBLISH, DB::STATUS_PRIVATE ], true ) ) {
				$document = $document->get_autosave( 0, true );
			}
		}

		$data = [
			'elements' => $request['elements'],
			'settings' => $request['settings'],
		];

		$document->save( $data );

		// Refresh after save.
		$document = $this->get( $document->get_post()->ID, false );

		$return_data = [
			'config' => [
				'last_edited' => $document->get_last_edited(),
				'wp_preview' => [
					'url' => $document->get_wp_preview_url(),
				],
			],
		];

		/**
		 * Returned documents ajax saved data.
		 *
		 * Filters the ajax data returned when saving the post on the builder.
		 *
		 * @since 2.0.0
		 *
		 * @param array    $return_data The returned data. Default is an empty array.
		 * @param Document $document    The document instance.
		 */
		$return_data = apply_filters( 'elementor/documents/ajax_save/return_data', $return_data, $document );

		return $return_data;
	}

	public function ajax_discard_changes( $request ) {
		$document = $this->get( $request['editor_post_id'] );

		$autosave = $document->get_autosave();

		if ( $autosave ) {
			$success = $autosave->delete();
		} else {
			$success = true;
		}

		return $success;
	}

	/**
	 * Switch to document.
	 *
	 * Change the document to a new document type.
	 *
	 * @since 2.0.0
	 * @access public
	 *
	 * @param Document $document The document to switch to.
	 */
	public function switch_to_document( $document ) {
		// If is already switched, or is the same post, return.
		if ( $this->current_doc === $document ) {
			$this->switched_data[] = false;
			return;
		}

		$this->switched_data[] = [
			'switched_doc' => $document,
			'original_doc' => $this->current_doc, // Note, it can be null if the global isn't set
		];

		$this->current_doc = $document;
	}

	/**
	 * Restore document.
	 *
	 * Rollback to the original document.
	 *
	 * @since 2.0.0
	 * @access public
	 */
	public function restore_document() {
		$data = array_pop( $this->switched_data );

		// If not switched, return.
		if ( ! $data ) {
			return;
		}

		$this->current_doc = $data['original_doc'];
	}

	/**
	 * Get current document.
	 *
	 * Retrieve the current document.
	 *
	 * @since 2.0.0
	 * @access public
	 *
	 * @return Document The current document.
	 */
	public function get_current() {
		return $this->current_doc;
	}

	/**
	 * Register group.
	 *
	 * Registers a single document group.
	 *
	 * @since 2.0.0
	 * @access public
	 *
	 * @param string $id   Group ID.
	 * @param array  $args Group data.
	 *
	 * @return Documents_Manager The updated document manager instance.
	 */
	public function register_group( $id, $args ) {
		$this->groups[ $id ] = $args;
		return $this;
	}

	/**
	 * Get groups.
	 *
	 * Retrieve the list of all the registered document groups.
	 *
	 * @since 2.0.0
	 * @access public
	 *
	 * @return array list of all the registered document groups.
	 */
	public function get_groups() {
		return $this->groups;
	}
}
