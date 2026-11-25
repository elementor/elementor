<?php

namespace Elementor\Core\Kits;

use Elementor\Core\Base\Document;
use Elementor\Core\Kits\Documents\Kit;
use Elementor\Core\Settings\Page\Manager as PageManager;
use Elementor\Core\Utils\Api\Error_Builder;
use Elementor\Core\Utils\Api\Response_Builder;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Active_Kit_Rest_Api {
	const API_NAMESPACE = 'elementor/v1';
	const API_BASE = 'kits/active/settings';

	public function register_hooks() {
		add_action( 'rest_api_init', fn() => $this->register_routes() );
	}

	private function register_routes() {
		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE, [
			[
				'methods' => 'GET',
				'callback' => fn( $request ) => $this->route_wrapper( fn() => $this->get_settings( $request ) ),
				'permission_callback' => fn() => $this->can_manage_active_kit(),
				'args' => [
					'keys' => [
						'type' => 'array',
						'items' => [ 'type' => 'string' ],
						'required' => false,
					],
				],
			],
			[
				'methods' => 'POST, PUT, PATCH',
				'callback' => fn( $request ) => $this->route_wrapper( fn() => $this->update_settings( $request ) ),
				'permission_callback' => fn() => $this->can_manage_active_kit(),
				'args' => [
					'settings' => [
						'type' => 'object',
						'required' => true,
					],
				],
			],
		] );
	}

	private function can_manage_active_kit(): bool {
		$kit = $this->get_active_kit();

		return $kit && $kit->is_editable_by_current_user();
	}

	private function get_active_kit(): ?Kit {
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		return $kit && $kit->get_main_id() ? $kit : null;
	}

	private function reload_kit( Kit $kit ): Kit {
		$fresh = Plugin::$instance->documents->get( $kit->get_main_id(), false );

		return $fresh instanceof Kit ? $fresh : $kit;
	}

	private function get_stored_settings( Kit $kit ): array {
		$settings = $kit->get_meta( PageManager::META_KEY );

		return is_array( $settings ) ? $settings : [];
	}

	private function get_settings( \WP_REST_Request $request ) {
		$kit = $this->get_active_kit();

		if ( ! $kit ) {
			return $this->kit_not_found();
		}

		$settings = $this->reload_kit( $kit )->get_settings();
		$keys = $request->get_param( 'keys' );

		if ( is_array( $keys ) && ! empty( $keys ) ) {
			$settings = array_intersect_key( $settings, array_flip( $keys ) );
		}

		return Response_Builder::make( (object) $settings )
			->set_meta( [ 'kit_id' => $kit->get_main_id() ] )
			->build();
	}

	private function update_settings( \WP_REST_Request $request ) {
		$kit = $this->get_active_kit();

		if ( ! $kit ) {
			return $this->kit_not_found();
		}

		$new_settings = $request->get_param( 'settings' );

		if ( ! is_array( $new_settings ) || empty( $new_settings ) ) {
			return Error_Builder::make( 'invalid_settings' )
				->set_status( 400 )
				->set_message( __( 'settings must be a non-empty object.', 'elementor' ) )
				->build();
		}

		$settings = array_replace( $this->get_stored_settings( $kit ), $new_settings );
		$settings['post_status'] = Document::STATUS_PUBLISH;

		if ( ! $kit->save( [ 'settings' => $settings ] ) ) {
			return Error_Builder::make( 'persist_failed' )
				->set_status( 500 )
				->set_message( __( 'Failed to save kit settings.', 'elementor' ) )
				->build();
		}

		$updated = $this->reload_kit( $kit )->get_settings();

		return Response_Builder::make( (object) array_intersect_key( $updated, $new_settings ) )
			->set_meta( [ 'kit_id' => $kit->get_main_id() ] )
			->build();
	}

	private function kit_not_found() {
		return Error_Builder::make( 'kit_not_found' )
			->set_status( 404 )
			->set_message( __( 'Active kit not found.', 'elementor' ) )
			->build();
	}

	private function route_wrapper( callable $callback ) {
		try {
			return $callback();
		} catch ( \Throwable $e ) {
			return Error_Builder::make( 'kit_settings_error' )
				->set_status( 500 )
				->set_message( __( 'Something went wrong', 'elementor' ) )
				->build();
		}
	}
}
