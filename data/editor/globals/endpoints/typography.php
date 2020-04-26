<?php
namespace Elementor\Data\Editor\Globals\Endpoints;

use Elementor\Data\Base\Endpoint;

class Typography extends Endpoint {
	private static $fake_data = [
		'primary' => [
			'typography' => 'custom',
			'font_family' => 'Over the Rainbow',
			'font_weight' => '900',
			'font_size' => [
				'unit' => 'px',
				'size' => 121,
			],
		],
	];

	public function get_name() {
		return 'typography';
	}

	protected function register() {
		parent::register();

		$this->register_item_route();
		$this->register_items_route( \WP_REST_Server::CREATABLE );
	}

	protected function get_items( $request ) {
		return self::$fake_data;
	}

	protected function get_item( $id, $request ) {
		if ( isset( self::$fake_data[ $id ] ) ) {
			return self::$fake_data[ $id ];
		}

		return false;
	}
}
