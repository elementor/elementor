<?php
namespace Elementor\Data\Editor\Document\Endpoints;

use Elementor\Data\Base\Endpoint;
use Elementor\Plugin;
use ElementorPro\Modules\Forms\Module;
use WP_Error;

class Elements extends Endpoint {
	public function get_name() {
		return 'elements';
	}

	protected function get_items( $request ) {
		$document_id  = $request->get_param( 'document_id' );

		if ( ! $document_id ) {
			return new WP_Error( 'invalid_document_id', 'invalid document id' );
		}

		$document = Plugin::$instance->documents->get( $document_id );

		if ( ! $document ) {
			return new WP_Error( 'document_not_exist', 'document not exist' );
		}

		$element_id  = $request->get_param( 'element_id' );

		if ( $element_id ) {
			$element = Module::find_element_recursive( $document->get_elements_data(), $element_id );

			if ( ! $element ) {
				return new WP_Error( 'element_not_exist', 'element not exist' );
			}

			return $element;
		}

		return $document->get_elements_data();
	}
}
