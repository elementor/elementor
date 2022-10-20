<?php
namespace Elementor\Modules\KitElementsDefaults\Data;

use Elementor\Plugin;
use Elementor\Data\V2\Base\Exceptions\Error_404;
use Elementor\Modules\KitElementsDefaults\Module;
use Elementor\Data\V2\Base\Controller as Base_Controller;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Controller extends Base_Controller {
	public function get_name() {
		return 'kit-elements-defaults';
	}

	public function register_endpoints() {
		$type_validate_callback = function ( $param ) {
			$types = array_keys( Plugin::$instance->widgets_manager->get_widget_types() );

			return in_array( $param, $types, true );
		};

		$this->index_endpoint->register_item_route(\WP_REST_Server::CREATABLE, [
			'id_arg_name' => 'type',
			'id_arg_type_regex' => '[\w\-]+',
			'type' => [
				'type' => 'string',
				'description' => 'The type of the element.',
				'required' => true,
				'validate_callback' => $type_validate_callback,
			],
			'kit_id' => [
				'description' => 'Kit ID',
				'type' => 'integer',
				'required' => false,
			],
			'settings' => [
				'description' => 'All the default values for the requested type',
				'required' => true,
				'type' => 'object',
			],
		] );

		$this->index_endpoint->register_item_route(\WP_REST_Server::DELETABLE, [
			'id_arg_name' => 'type',
			'id_arg_type_regex' => '[\w\-]+',
			'type' => [
				'type' => 'string',
				'description' => 'The type of the element.',
				'required' => true,
				'validate_callback' => $type_validate_callback,
			],
			'kit_id' => [
				'description' => 'Kit ID',
				'type' => 'integer',
				'required' => false,
			],
		] );
	}

	public function get_collection_params() {
		return [
			'kit_id' => [
				'description' => 'Kit ID',
				'type' => 'integer',
				'required' => false,
			],
		];
	}

	public function get_items( $request ) {
		$kit = $this->get_kit(
			$request->get_param( 'kit_id' )
		);

		return (object) $kit->get_json_meta( Module::META_KEY );
	}

	public function create_item( $request ) {
		$kit = $this->get_kit(
			$request->get_param( 'kit_id' )
		);

		$data = $kit->get_json_meta( Module::META_KEY );

		$data[ $request->get_param( 'type' ) ] = $request->get_param( 'settings' );

		$kit->update_meta(
			Module::META_KEY,
			wp_json_encode( $data )
		);

		return (object) [];
	}

	public function delete_item( $request ) {
		$kit = $this->get_kit(
			$request->get_param( 'kit_id' )
		);

		$data = $kit->get_json_meta( Module::META_KEY );

		unset( $data[ $request->get_param( 'type' ) ] );

		$kit->update_meta(
			Module::META_KEY,
			wp_json_encode( $data )
		);

		return (object) [];
	}

	public function get_items_permissions_check( $request ) {
		return current_user_can( 'edit_posts' );
	}

	/**
	 * TODO: Remove it and check in the infra why it is needed.
	 */
	public function get_item_permissions_check( $request ) {
		return current_user_can( 'edit_posts' );
	}

	public function create_item_permissions_check( $request ) {
		return current_user_can( 'manage_options' );
	}

	public function delete_item_permissions_check( $request ) {
		return current_user_can( 'manage_options' );
	}

	/**
	 * @param $kit_id
	 *
	 * @return \Elementor\Core\Kits\Documents\Kit|false
	 * @throws Error_404
	 */
	private function get_kit( $kit_id ) {
		$kit = Plugin::$instance->kits_manager->get_kit(
			$kit_id
				? $kit_id
				: Plugin::$instance->kits_manager->get_active_id()
		);

		if ( ! $kit ) {
			throw new Error_404( 'Kit not found' );
		}

		return $kit;
	}
}
