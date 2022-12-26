<?php
namespace Elementor\Includes\TemplateLibrary\Data\Endpoints;

use Elementor\Data\V2\Base\Endpoint;
use Elementor\Plugin;
use Elementor\TemplateLibrary\Source_Local;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Templates extends Endpoint {

	protected function register() {
		parent::register();

		$document_types = Plugin::$instance->documents->get_document_types( [
			'show_in_library' => true,
		] );

		$this->register_route( '', \WP_REST_Server::CREATABLE, [
			'is_multi' => true,
			'title' => [
				'required' => false,
				'type' => 'string',
				'description' => 'The title of the document',
			],
			'type' => [
				'required' => true,
				'description' => 'The document type.',
				'type' => 'string',
				'enum' => array_keys( $document_types ),
			],
			'content' => [
				'required' => false,
				'description' => 'Elementor data object',
				'type' => 'object',
			],
		] );
	}

	public function get_name() {
		return 'templates';
	}

	public function get_format() {
		return 'template-library/templates';
	}

	public function get_items( $request ) {
		return Plugin::$instance->templates_manager->get_library_data( [ 'filter_sources' => [ $request->get_param( 'source' ) ] ] );
	}

	public function create_items( $request ) {
		/** @var Source_Local $source */
		$source = Plugin::$instance->templates_manager->get_source( 'local' );

		$result = $source->save_item( [
			'title' => $request->get_param( 'title' ),
			'type' => $request->get_param( 'type' ),
			'content' => $request->get_param( 'content' ),
			'page_settings' => $request->get_param( 'page_settings' ),
		] );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return $source->get_item( $result );
	}
}
