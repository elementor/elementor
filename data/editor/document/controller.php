<?php
namespace Elementor\Data\Editor\Document;

use Elementor\Data\Base\Controller as Controller_Base;

class Controller extends Controller_Base {
	public function get_name() {
		return 'document';
	}

	public function register_endpoints() {
		$this->register_endpoint( Endpoints\Elements::class );
	}

	public function permission_callback( $request ) {
		if ( 'GET' === $request->get_method() ) {
			$document_id = $request->get_param( 'document_id' );

			if ( ! $document_id ) {
				return parent::permission_callback( $request );
			}

			return current_user_can( 'read_post', $document_id );
		}

		return false;
	}
}
