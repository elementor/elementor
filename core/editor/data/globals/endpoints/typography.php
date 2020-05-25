<?php
namespace Elementor\Core\Editor\Data\Globals\Endpoints;

use Elementor\Data\Base\Endpoint;
use Elementor\Plugin;
use Elementor\Utils;

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

	protected function create_items( $request ) {
		$result = [
			'success' => false,
		];

		$data = $request->get_json_params();

		if ( isset( $data['args'] ) && isset( $data['args']['data'] ) ) {
			$data = $data['args'] ['data'];
			$data['_id'] = Utils::generate_random_string();

			$kit = Plugin::$instance->kits_manager->get_active_kit();

			$kit->add_repeater_row( 'typography', $data );

			$result = [
				'id' => $data['_id'],
				'success' => true,
			];
		}

		return $result;
	}
}
