<?php

namespace Elementor\Modules\WpRest\Classes;

defined( 'ABSPATH' ) || exit;

class ElementorUserMeta {

	public function register() : void {
		register_meta('user', 'elementor_introduction', [
			'single' => true,
			'show_in_rest' => [
				'schema' => [
					'description' => 'State of modals and confirm dialogs the user has seen',
					'type' => 'object',
					'properties' => [
						'ai_get_started' => [
							'type' => 'boolean',
						],
					],
					'context' => [ 'view', 'edit' ],
				],
			],
			'sanitize_callback' => function ( $value, $key, $type ) {
				$request = isset( $_SERVER['REQUEST_METHOD'] ) ? sanitize_key( $_SERVER['REQUEST_METHOD'] ) : '';

				// on patch request, we need to merge the existing data with the new data
				if ( 'PATCH' === $request ) {
					$existing = get_metadata( $type, get_current_user_id(), $key, true );

					if ( is_array( $existing ) && is_array( $value ) ) {
						return array_merge( $existing, $value );
					}

					return $value;
				}

				return $value;
			},
			'auth_callback' => function () {
				return current_user_can( 'edit_users' );
			},
		] );
	}
}
