<?php
namespace Elementor\Templates;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Type_Local extends Type_Base {

	const CPT = 'elementor_tmpl';

	public function get_id() {
		return 'local';
	}

	public function get_title() {
		return __( 'Local', 'elementor' );
	}

	public function register_data() {
		$labels = [
			'name' => __( 'Templates', 'elementor' ),
			'singular_name' => __( 'Template', 'elementor' ),
			'add_new' => __( 'Add New', 'elementor' ),
			'add_new_item' => __( 'Add New Template', 'elementor' ),
			'edit_item' => __( 'Edit Template', 'elementor' ),
			'new_item' => __( 'New Template', 'elementor' ),
			'all_items' => __( 'All Templates', 'elementor' ),
			'view_item' => __( 'View Template', 'elementor' ),
			'search_items' => __( 'Search Template', 'elementor' ),
			'not_found' => __( 'No Templates found', 'elementor' ),
			'not_found_in_trash' => __( 'No Templates found in Trash', 'elementor' ),
			'parent_item_colon' => '',
			'menu_name' => __( 'Templates', 'elementor' ),
		];

		$args = [
			'labels' => $labels,
			'public' => true,
			'rewrite' => false,
			'show_ui' => true,
			'show_in_menu' => false,
			'capability_type' => 'post',
			'hierarchical' => false,
			'supports' => [ 'title', 'thumbnail', 'author' ],
		];

		register_post_type(
			self::CPT,
			apply_filters( 'elementor/templates/types/local/register_post_type_args', $args )
		);
	}

	public function get_items() {
		// Write the query to get all local templates
	}
}
