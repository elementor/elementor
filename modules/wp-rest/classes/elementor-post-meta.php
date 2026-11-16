<?php

namespace Elementor\Modules\WpRest\Classes;

use Elementor\Modules\AtomicWidgets\PropTypes\Link_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Url_Prop_Type;
use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Elementor_Post_Meta {

	public function register(): void {
		$post_types = get_post_types_by_support( 'elementor' );

		foreach ( $post_types as $post_type ) {
			$this->register_edit_mode_meta( $post_type );
			$this->register_template_type_meta( $post_type );
			$this->register_elementor_data_meta( $post_type );
			$this->register_page_settings_meta( $post_type );

			if ( Utils::has_pro() ) {
				$this->register_conditions_meta( $post_type );
			}
		}
	}

	private function register_edit_mode_meta( string $post_type ): void {
		register_meta( 'post', '_elementor_edit_mode', [
			'single' => true,
			'object_subtype' => $post_type,
			'show_in_rest' => [
				'schema' => [
					'title' => 'Elementor edit mode',
					'description' => 'Elementor edit mode, `builder` is required for Elementor editing',
					'type' => 'string',
					'enum' => [ '', 'builder' ],
					'default' => '',
					'context' => [ 'edit' ],
				],
			],
			'auth_callback' => [ $this, 'check_edit_permission' ],
		]);
	}

	private function register_template_type_meta( string $post_type ): void {
		$document_types = Plugin::$instance->documents->get_document_types();

		register_meta( 'post', '_elementor_template_type', [
			'single' => true,
			'object_subtype' => $post_type,
			'show_in_rest' => [
				'schema' => [
					'title' => 'Elementor template type',
					'description' => 'Elementor document type',
					'type' => 'string',
					'enum' => array_merge( array_keys( $document_types ), [ '' ] ),
					'default' => '',
					'context' => [ 'edit' ],
				],
			],
			'auth_callback' => [ $this, 'check_edit_permission' ],
		]);
	}

	private function register_elementor_data_meta( string $post_type ): void {
		register_meta( 'post', '_elementor_data', [
			'single' => true,
			'object_subtype' => $post_type,
			'show_in_rest' => [
				'schema' => [
					'title' => 'Elementor data',
					'description' => 'Elementor JSON as a string',
					'type' => 'string',
					'default' => '',
					'context' => [ 'edit' ],
				],
			],
			'auth_callback' => [ $this, 'check_edit_permission' ],
			'sanitize_callback' => [ $this, 'sanitize_elementor_data' ],
		]);
	}

	public function sanitize_elementor_data( $value ) {
		if ( current_user_can( 'unfiltered_html' ) ) {
			return $value;
		}

		if ( ! is_string( $value ) ) {
			return $this->sanitize_stored_links( Utils::kses_post_deep( $value ) );
		}

		$elementor_data = json_decode( $value, true );

		if ( JSON_ERROR_NONE !== json_last_error() || empty( $elementor_data ) ) {
			// Not valid Elementor JSON (or empty): treat the whole string as HTML to be safe.
			return wp_kses_post( $value );
		}

		return wp_json_encode( $this->sanitize_stored_links( Utils::kses_post_deep( $elementor_data ) ) );
	}

	private function sanitize_stored_links( $data ) {
		if ( ! is_array( $data ) ) {
			return $data;
		}

		if ( Link_Prop_Type::get_key() === ( $data['$$type'] ?? null ) && isset( $data['value']['destination'] ) ) {
			$data['value']['destination'] = $this->sanitize_link_destination( $data['value']['destination'] );
		}

		foreach ( $data as $key => $item ) {
			if ( is_array( $item ) ) {
				$data[ $key ] = $this->sanitize_stored_links( $item );
			}
		}

		return $data;
	}

	private function sanitize_link_destination( $destination ) {
		if ( is_string( $destination ) && ! is_numeric( $destination ) ) {
			return esc_url_raw( $destination );
		}

		if ( Url_Prop_Type::get_key() === ( $destination['$$type'] ?? null ) && is_string( $destination['value'] ?? null ) ) {
			return Url_Prop_Type::make()->sanitize( $destination );
		}

		return $destination;
	}

	private function register_page_settings_meta( string $post_type ): void {
		register_meta( 'post', '_elementor_page_settings', [
			'single' => true,
			'object_subtype' => $post_type,
			'type' => 'object',
			'show_in_rest' => [
				'schema' => [
					'title' => 'Elementor page settings',
					'description' => 'Elementor page level settings',
					'type' => 'object',
					'properties' => [
						'hide_title' => [
							'type' => 'string',
							'enum' => [ 'yes', 'no' ],
							'default' => '',
						],
					],
					'default' => '{}',
					'additionalProperties' => true,
					'context' => [ 'edit' ],
				],
			],
			'auth_callback' => [ $this, 'check_edit_permission' ],
			'sanitize_callback' => [ $this, 'sanitize_page_settings' ],
		]);
	}

	public function sanitize_page_settings( $value ) {
		if ( current_user_can( 'unfiltered_html' ) ) {
			return $value;
		}

		return Utils::kses_post_deep( $value );
	}

	private function register_conditions_meta( string $post_type ): void {
		register_meta( 'post', '_elementor_conditions', [
			'object_subtype' => $post_type,
			'type' => 'object',
			'title' => 'Elementor conditions',
			'description' => 'Elementor conditions',
			'single' => true,
			'show_in_rest' => [
				'schema' => [
					'description' => 'Elementor conditions',
					'type' => 'array',
					'additionalProperties' => true,
					'default' => [],
					'context' => [ 'edit' ],
				],
			],
			'auth_callback' => [ $this, 'check_edit_permission' ],
		]);
	}

	/**
	 * Check if current user has permission to edit the specific post with elementor
	 *
	 * @param bool   $allowed Whether the user can add the post meta. Default false.
	 * @param string $meta_key The meta key.
	 * @param int    $post_id Post ID.
	 * @return bool
	 * @since 3.27.0
	 */
	public function check_edit_permission( bool $allowed, string $meta_key, int $post_id ): bool {
		$document = Plugin::$instance->documents->get( $post_id );

		return $document && $document->is_editable_by_current_user();
	}
}
