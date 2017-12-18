<?php
namespace Elementor\Core;

use Elementor\Core\Base\Document;
use Elementor\Core\DocumentTypes\Post;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Documents_Manager {

	private $types = [];

	/**
	 * @var Document[]
	 */
	private $documents = [];

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
	}

	public function get( $post_id ) {
		if ( ! isset( $this->documents[ $post_id ] ) ) {
			$doc_type = get_post_meta( $post_id, '_elementor_type', true );
			$doc_type_class = $this->get_document_type( $doc_type );
			$this->documents[ $post_id ] = new $doc_type_class( [
				'post_id' => $post_id,
			] );
		}

		return $this->documents[ $post_id ];
	}
}
