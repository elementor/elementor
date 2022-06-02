<?php
namespace Elementor\Includes\TemplateLibrary;

use Elementor\Plugin;
use Elementor\Core\Base\Document;
use Elementor\TemplateLibrary\Source_Local;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class REST_API {
	/**
	 * Add the document type field to elementor-templates rest endpoints.
	 *
	 * @return void
	 */
	public function on_rest_api_init() {
		register_rest_field(
			Source_Local::CPT,
			'document_type',
			[
				'get_callback' => $this->get_document_type_get_callback(),
				'update_callback' => $this->get_document_type_update_callback(),
				'schema' => $this->get_document_type_schema(),
			]
		);
	}

	/**
	 * @return \Closure
	 */
	private function get_document_type_get_callback() {
		return function ( array $object ) {
			return get_post_meta( $object['id'], Document::TYPE_META_KEY, true );
		};
	}

	/**
	 * @return \Closure
	 */
	private function get_document_type_update_callback() {
		return function ( $value, \WP_Post $object ) {
			Plugin::$instance
				->documents
				->get( $object->ID, false )
				->set_is_built_with_elementor( true )
				->update_meta( Document::TYPE_META_KEY, $value );
		};
	}

	/**
	 * @return array
	 */
	private function get_document_type_schema() {
		$document_types = Plugin::$instance->documents->get_document_types( [
			'show_in_library' => true,
		] );

		return [
			'description' => __( 'Elementor document type.', 'elementor' ),
			'type' => 'string',
			'required' => true,
			'enum' => array_keys( $document_types ),
		];
	}
}
