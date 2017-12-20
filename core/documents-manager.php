<?php
namespace Elementor\Core;

use Elementor\Core\Base\Document;
use Elementor\Core\DocumentTypes\Post;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Documents_Manager {

	protected $types = [];

	/**
	 * @var Document[]
	 */
	protected $documents = [];

	public function __construct() {
		$this->register_default_types();
	}

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
			$doc_type = get_post_meta( $post_id, '_elementor_template_type', true );
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
		$post_id = wp_insert_post( $post_data );

		add_post_meta( $post_id, '_elementor_edit_mode', 'builder' );

		foreach ( $meta_data as $key => $value ) {
			add_post_meta( $post_id, $key, $value );
		}

		$document = new $class_name( [
			'post_id' => $post_id,
		] );

		return $document;
	}
}
