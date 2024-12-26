<?php

namespace Elementor\Modules\WpRest\Classes;

use Elementor\Plugin;
use Elementor\Utils;

defined( 'ABSPATH' ) || exit;

class ElementorPostMeta {

	public function register() :void {
		$post_types = get_post_types_by_support( 'elementor' );

		foreach ( $post_types as $post_type ) {
			register_meta($post_type, '_elementor_edit_mode', [
				'type' => 'string',
				'label' => 'Elementor edit mode',
				'description' => 'Elementor edit mode, `builder` is required for Elementor editing',
				'single' => true,
				'show_in_rest' => true,
				'auth_callback' => [ $this, 'check_edit_permission' ],
			]);

			$document_types = Plugin::$instance->documents->get_document_types();

			register_meta($post_type, '_elementor_template_type', [
				'type' => 'string',
				'label' => 'Elementor template type',
				'single' => true,
				'show_in_rest' => [
					'schema' => [
						'description' => 'Elementor document type',
						'type' => 'string',
						'enum' => array_keys( $document_types ),
						'context' => [ 'view', 'edit' ],
					],
				],
				'auth_callback' => [ $this, 'check_edit_permission' ],
			]);

			register_meta($post_type, '_elementor_data', [
				'single' => true,
				'show_in_rest' => [
					'schema' => [
						'description' => 'Elementor JSON as a string',
						'type' => 'string',
						'context' => [ 'view', 'edit' ],
					],
				],
				'auth_callback' => [ $this, 'check_edit_permission' ],
			]);

			register_meta($post_type, '_elementor_page_settings', [
				'type' => 'object',
				'title' => 'Elementor page settings',
				'description' => 'Elementor page level settings',
				'single' => true,
				'show_in_rest' => [
					'schema' => [
						'description' => 'Elementor page level settings',
						'type' => 'object',
						'properties' => [
							'hide_title' => [
								'type' => 'string',
								'enum' => [ 'yes', 'no' ],
							],
						],
						'additionalProperties' => true,
						'context' => [ 'view', 'edit' ],
					],
				],
				'auth_callback' => [ $this, 'check_edit_permission' ],
			]);

			if ( Utils::has_pro() ) {
				register_meta($post_type, '_elementor_conditions', [
					'type' => 'object',
					'title' => 'Elementor conditions',
					'description' => 'Elementor conditions',
					'single' => true,
					'show_in_rest' => [
						'schema' => [
							'description' => 'Elementor conditions',
							'type' => 'array',
							'additionalProperties' => true,
							'context' => [ 'view', 'edit' ],
						],
					],
					'auth_callback' => [ $this, 'check_edit_permission' ],
				]);
			}
		}
	}

	/**
	 * Check if current user has permission to edit the specific post with elementor
	 *
	 * @param bool $allowed Whether the user can add the post meta. Default false.
	 * @param string $meta_key The meta key.
	 * @param int $post_id Post ID.
	 * @return bool
	 * @since 3.27.0
	 */
	public function check_edit_permission( bool $allowed, string $meta_key, int $post_id ) : bool {
		$document = Plugin::$instance->documents->get( $post_id );

		return $document && $document->is_built_with_elementor() && $document->is_editable_by_current_user();
	}
}
