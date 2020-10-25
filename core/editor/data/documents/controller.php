<?php
namespace Elementor\Core\Editor\Data\Documents;

use Elementor\Data\Base\Controller as Controller_Base;
use Elementor\Plugin;

class Controller extends Controller_Base {

	public function get_name() {
		return 'documents';
	}

	public function register_endpoints() {
		$this->index_endpoint->register_item_route( \WP_REST_Server::READABLE, [
			'id_arg_name' => 'document_id',
		] );
	}

	public function get_item( $request ) {
		$document_id = $request->get_param( 'document_id' );
		$document = Plugin::$instance->documents->get( $document_id );

		if ( ! $document ) {
			return new \WP_Error( 'invalid_document_id', 'Invalid document id' );
		}

		return $document->get_data();
	}
}
