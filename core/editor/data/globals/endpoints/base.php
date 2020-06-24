<?php
namespace Elementor\Core\Editor\Data\Globals\Endpoints;

use Elementor\Data\Base\Endpoint;
use Elementor\Plugin;

abstract class Base extends Endpoint {
	public static function get_format() {
		return '{id}';
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
		$item = $request->get_body_params();

		if ( ! isset( $item['title'] ) ) {
			return new \WP_Error( 'invalid_title', 'Invalid title' );
		}

		$kit = Plugin::$instance->kits_manager->get_active_kit();

		$item['id'] = $id;

		$db_item = $this->convert_db_format( $item );

		$kit->add_repeater_row( 'custom_' . $this->get_name(), $db_item );

		return $item;
	}

	abstract protected function get_kit_items();

	/**
	 * @param array $item frontend format.
	 * @return array backend format.
	 */
	abstract protected function convert_db_format( $item );
}
