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
	 * Register actions.
	 *
	 * @return void
	 */
	public function register() {
		add_action( 'rest_api_init', function () {
			$this->add_document_type_rest_field();
		} );
	}

	/**
	 * Add the document type field to elementor-templates rest endpoints.
	 *
	 * @return void
	 */
	private function add_document_type_rest_field() {
		$document_types = Plugin::$instance->documents->get_document_types( [
			'show_in_library' => true,
		] );

		register_rest_field(
			Source_Local::CPT,
			'document_type',
			[
				'get_callback' => function ( array $object ) {
					return get_post_meta( $object['id'], Document::TYPE_META_KEY, true );
				},
				'update_callback' => function ( $value, \WP_Post $object ) {
					$document = Plugin::$instance->documents->get( $object->ID );

					if ( ! $document ) {
						return;
					}

					$document
						->set_is_built_with_elementor( true )
						->update_meta( Document::TYPE_META_KEY, $value );
				},
				'schema' => [
					'description' => __( 'Elementor document type.', 'elementor' ),
					'type' => 'string',
					'required' => true,
					'enum' => array_keys( $document_types ),
				],
			]
		);
	}
}
