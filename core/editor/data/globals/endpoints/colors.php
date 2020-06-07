<?php
namespace Elementor\Core\Editor\Data\Globals\Endpoints;

use Elementor\Data\Base\Endpoint;
use Elementor\Plugin;

class Colors extends Endpoint {
	public static function get_format() {
		return '{id}';
	}

	public function get_name() {
		return 'colors';
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

		$kit->add_repeater_row( 'custom_colors', $item );

		unset( $item['_id'] );
		$item['id'] = $id;

		return $item;
	}

	public function delete_item( $id, $request ) {
		$success = false;

		$item = $this->get_item( $id, $request );

		if ( ! $item ) {
			return new \WP_Error( 'invalid_item', 'Invalid item' );
		}

		$kit = Plugin::$instance->kits_manager->get_active_kit_for_frontend();
		
		return [ 'success' => $success ];
	}

	private function get_kit_items() {
		$result = [];
		$kit = Plugin::$instance->kits_manager->get_active_kit_for_frontend();

		$system_items = $kit->get_settings_for_display( 'system_colors' );
		$custom_items = $kit->get_settings_for_display( 'custom_colors' );

		if ( ! $system_items ) {
			$system_items = [];
		}

		if ( ! $custom_items ) {
			$custom_items = [];
		}

		$items = array_merge( $system_items, $custom_items );

		foreach ( $items as $index => $item ) {
			$id = $item['_id'];
			$result[ $id ] = [
				'id' => $id,
				'title' => $item['title'],
				'value' => $item['color'],
			];
		}

		return $result;
	}
}
