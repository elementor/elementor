<?php

namespace Elementor\Modules\SiteNavigation\Rest_Fields;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Page_User_Can {
	public function register_rest_field() {
		if ( ! isset( $_GET['_fields'] ) ) {
			return;
		}

		$fields = sanitize_text_field( wp_unslash( $_GET['_fields'] ) );
		$array_fields = explode( ',', $fields );

		if ( ! in_array( 'user_can', $array_fields ) ) {
			return;
		}

		register_rest_field(
			'page',
			'user_can',
			array(
				'get_callback' => array( $this, 'get_callback' ),
				'schema' => array(
					'description' => __( 'Whether the current user can edit or delete this post', 'elementor' ),
					'type' => 'array',
				),
			)
		);
	}

	public function get_callback( $post ) {
		$can_edit = current_user_can( 'edit_post', $post['id'] );
		$can_delete = current_user_can( 'delete_post', $post['id'] );

		return array(
			'edit' => $can_edit,
			'delete' => $can_delete,
		);
	}
}
