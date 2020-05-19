<?php
namespace Elementor\Data\Editor\Documents\Endpoints;

use Elementor\Data\Base\Endpoint;
use Elementor\Plugin;

class Index extends Endpoint {
	public function get_name() {
		return 'index';
	}

	public static function get_format_suffix() {
		return ':document_id';
	}

	protected function register() {
		parent::register();

		$this->register_sub_endpoint( '(?P<document_id>[\w]+)/', SubEndpoints\Elements::class );

		$this->register_item_route( [
			'id' => [
				'description' => 'Document id.',
				'type' => 'string',
			],
		]);
	}

	protected function get_item( $document_id, $request ) {
		$document = Plugin::$instance->documents->get( $document_id );

		if ( ! $document ) {
			return new \WP_Error( 'invalid_document_id', 'Invalid document id' );
		}

		$result = $document->get_data();

		$result['elements'] = Plugin::$instance->documents->get( $document_id )->get_elements_data();

		foreach ( $result['elements'] as $key => $element ) {
			$result['elements'][ $element['id'] ] = $element;

			unset( $result['elements'][ $key ] );
		}

		return $result;
	}
}
