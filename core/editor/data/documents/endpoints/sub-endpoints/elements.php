<?php
namespace Elementor\Core\Editor\Data\Documents\Endpoints\SubEndpoints;

use Elementor\Data\Base\SubEndpoint;
use Elementor\Plugin;
use Elementor\Utils;

class Elements extends SubEndpoint {
	public function get_name() {
		return 'elements';
	}

	public static function get_format() {
		return '{element_id}';
	}

	protected function register() {
		parent::register();

		$this->register_item_route();
	}

	public function get_items( $request ) {
		$elements = [];
		$document_id = $request->get_param( 'document_id' );

		if ( $document_id ) {
			$elements = Plugin::$instance->documents->get( $document_id )->get_elements_data();
		}

		foreach ( $elements as $key => $element ) {
			$elements[ $element['id'] ] = $element;

			unset( $elements[ $key ] );
		}

		return $elements;
	}

	public function get_item( $element_id, $request ) {
		$element = [];
		$document_id = $request->get_param( 'document_id' );

		if ( $document_id ) {
			$document = Plugin::$instance->documents->get( $document_id );
			$element = Utils::find_element_recursive( $document->get_elements_data(), $element_id );
		}

		return $element;
	}
}
