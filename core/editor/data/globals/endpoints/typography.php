<?php
namespace Elementor\Core\Editor\Data\Globals\Endpoints;

use Elementor\Data\Base\Endpoint;
use Elementor\Plugin;
use Elementor\Utils;

class Typography extends Endpoint {
	public static function get_format() {
		return '{id}';
	}

	private static $fake_data = [
		'primary' => [
			'id' => 'primary',
			'title' => 'Primary',
			'value' => [
				'typography' => 'custom',
				'font_family' => 'Over the Rainbow',
				'font_weight' => '900',
				'font_size' => [
					'unit' => 'px',
					'size' => 121,
				],
			],
		],
		'secondary' => [
			'id' => 'secondary',
			'title' => 'Secondary',
			'value' => [
				'typography' => 'custom',
				'font_family' => 'Tahoma',
				'font_weight' => '500',
				'font_size' => [
					'unit' => 'px',
					'size' => 40,
				],
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

	public function get_items( $request ) {
		return $this->get_kit_items();
	}

	public function get_item( $id, $request ) {
		$items = $this->get_kit_items();

		if ( isset( $items[ $id ] ) ) {
			return $items[ $id ];
		}

		return false;
	}

	public function create_items( $request ) {
		$item = $request->get_json_params();

		if ( ! isset( $item['title'] ) ) {
			return new \WP_Error( 'invalid_title', 'Invalid title' );
		}

		$item['_id'] = Utils::generate_random_string();

		$kit = Plugin::$instance->kits_manager->get_active_kit();

		$kit->add_repeater_row( 'typography', $item );

		return $item;
	}

	private function get_kit_items() {
		$kit = Plugin::$instance->kits_manager->get_active_kit_for_fronend();

		// TODO: Remove 'fake-data'.
		$result = self::$fake_data;
		$items = $kit->get_settings_for_display( 'typography' );

		if ( ! $items ) {
			$items = [];
		}

		foreach ( $items as $index => &$item ) {
			foreach ( $item as $setting => $value ) {
				$new_setting = str_replace( 'typography_', '', $setting, $count );
				if ( $count ) {
					$item[ $new_setting ] = $value;
					unset( $item[ $setting ] );
				}
			}

			$id = $item['_id'];
			$result[ $id ] = [
				'title' => $item['title'],
				'id' => $id,
			];
			unset( $item['_id'], $item['title'] );

			$result[ $id ]['value'] = $item;
		}

		return $result;
	}

}
