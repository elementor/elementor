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
	 * Register actions
	 *
	 * @return void
	 */
	public function register() {
		$post_type = Source_Local::CPT;

		add_filter( "rest_{$post_type}_item_schema", function ( $schema ) {
			return $this->extend_rest_schema( $schema );
		} );

		add_action( "rest_after_insert_{$post_type}", function ( \WP_Post $post, \WP_REST_Request $request ) {
			$this->after_insert_post( $post, $request );
		}, 10, 2 );
	}

	/**
	 * Extend the schema by adding template library related stuff.
	 *
	 * @param $schema
	 *
	 * @return array
	 */
	protected function extend_rest_schema( $schema ) {
		$document_types = Plugin::$instance->documents->get_document_types( [
			'show_in_library' => true,
		] );

		$schema['properties']['document_type'] = [
			'description' => __( 'Elementor document type.', 'elementor' ),
			'type' => 'string',
			'required' => true,
			'enum' => array_keys( $document_types ),
		];

		return $schema;
	}

	/**
	 * Update post by adding elementor related stuff.
	 *
	 * @param \WP_Post         $post
	 * @param \WP_REST_Request $request
	 *
	 * @return void
	 */
	protected function after_insert_post( \WP_Post $post, \WP_REST_Request $request ) {
		$document = Plugin::$instance->documents->get( $post->ID );

		if ( ! $document ) {
			return;
		}

		$document
			->set_is_built_with_elementor( true )
			->update_meta( Document::TYPE_META_KEY, $request->get_param( 'document_type' ) );
	}
}
