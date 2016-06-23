<?php
namespace Elementor\Templates;

use Elementor\DB;
use Elementor\Plugin;

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
		$templates_query = new \WP_Query(
			[
				'post_type' => self::CPT,
				'post_status' => 'publish',
				'posts_per_page' => -1,
				'orderby' => 'title',
				'order' => 'ASC',
			]
		);

		$templates = [];
		if ( $templates_query->have_posts() ) {
			foreach ( $templates_query->get_posts() as $post ) {
				$templates[] = $this->get_item( $post->ID );
			}
		}
		return $templates;
	}

	public function save_item( $template_data = [], $template_title = '' ) {
		$post_id = wp_insert_post(
			[
				'post_title' => ! empty( $template_title ) ? $template_title : __( '(no title)', 'elementor' ),
				'post_status' => 'publish',
				'post_type' => self::CPT,
			]
		);

		if ( is_wp_error( $post_id ) ) {
			return $post_id;
		}

		Plugin::instance()->db->save_builder( $post_id, $template_data );

		return $post_id;
	}

	/**
	 * @param int $item_id
	 *
	 * @return array
	 */
	public function get_item( $item_id ) {
		$post = get_post( $item_id );

		$user = get_user_by( 'id', $post->post_author );
		return [
			'id' => $post->ID,
			'type' => $this->get_id(),
			'title' => $post->post_title,
			'thumbnail' => get_the_post_thumbnail_url( $post ),
			'date' => mysql2date( get_option( 'date_format' ), $post->post_date ),
			'author' => $user->display_name,
			'categories' => [],
			'keywords' => [],
		];
	}
}
