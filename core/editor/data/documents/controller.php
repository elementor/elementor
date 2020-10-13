<?php
namespace Elementor\Core\Editor\Data\Documents;

use Elementor\Data\Base\Controller as Controller_Base;
use Elementor\Plugin;

class Controller extends Controller_Base {

	public function get_name() {
		return 'documents';
	}

	public function register_endpoints() {
		// Bypass, use internal endpoints.
	}

	public function get_item( $request ) {
		$document_id = $request->get_param( 'id' );
		$document = Plugin::$instance->documents->get( $document_id );

		if ( ! $document ) {
			return new \WP_Error( 'invalid_document_id', 'Invalid document id' );
		}

		return $document->get_data();
	}
}
