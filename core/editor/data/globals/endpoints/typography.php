<?php
namespace Elementor\Core\Editor\Data\Globals\Endpoints;

use Elementor\Data\Base\Endpoint;
use Elementor\Plugin;
use Elementor\Utils;

class Typography extends Endpoint {
	public static function get_format() {
		return '{id}';
	}

	public function get_name() {
		return 'typography';
	}

	protected function register() {
		parent::register();

		$this->register_item_route();
		$this->register_item_route( \WP_REST_Server::CREATABLE );
		$this->register_item_route( \WP_REST_Server::DELETABLE );
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

	public function create_item( $id, $request ) {
		$item = $request->get_json_params();

		if ( ! isset( $item['title'] ) ) {
			return new \WP_Error( 'invalid_title', 'Invalid title' );
		}

		$item['_id'] = $id;

		$kit = Plugin::$instance->kits_manager->get_active_kit();

		$kit->add_repeater_row( 'custom_typography', $item );

		return $item;
	}

	private function get_kit_items() {
		$result = [];

		$kit = Plugin::$instance->kits_manager->get_active_kit_for_frontend();

		$system_items = $kit->get_settings_for_display( 'system_typography' );
		$custom_items = $kit->get_settings_for_display( 'custom_typography' );

		if ( ! $system_items ) {
			$system_items = [];
		}

		if ( ! $custom_items ) {
			$custom_items = [];
		}

		$items = array_merge( $system_items, $custom_items );

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
