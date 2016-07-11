<?php
namespace Elementor\Templates;

use Elementor\DB;
use Elementor\Plugin;
use Elementor\Utils;

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
			'export_link' => $this->_get_export_link( $item_id ),
		];
	}

	public function get_template( $item_id ) {
		// TODO: Valid the data (in JS too!)
		$data = Plugin::instance()->db->get_builder( $item_id );

		return Plugin::instance()->db->iterate_data( $data, function( $element ) {
			$element['id'] = Utils::generate_random_string();
			return $element;
		} );
	}

	public function delete_template( $item_id ) {
		wp_delete_post( $item_id, true );
	}

	public function export_template( $item_id ) {
		$template_data = $this->get_template( $item_id );
		if ( empty( $template_data ) )
			wp_die( 'The template does not exist', 'elementor' );

		// TODO: More fields to export?
		$export_data = [
			'version' => DB::DB_VERSION,
			'title' => get_the_title( $item_id ),
			'data' => $template_data,
		];

		$filename = 'elementor-' . $item_id . '-' . date( 'Y-m-d' ) . '.json';
		$template_contents = wp_json_encode( $export_data );
		$filesize = strlen( $template_contents );

		// Headers to prompt "Save As"
		header( 'Content-Type: application/octet-stream' );
		header( 'Content-Disposition: attachment; filename=' . $filename );
		header( 'Expires: 0' );
		header( 'Cache-Control: must-revalidate' );
		header( 'Pragma: public' );
		header( 'Content-Length: ' . $filesize );

		// Clear buffering just in case
		@ob_end_clean();
		flush();

		// Output file contents
		echo $template_contents;
		die;
	}

	public function import_template() {
		$import_file = $_FILES['file']['tmp_name'];

		if ( empty( $import_file ) )
			wp_send_json_error( [ 'message' => 'Please upload a file to import' ] );

		$content = json_decode( file_get_contents( $import_file ), true );
		$is_invalid_file = empty( $content ) || empty( $content['data'] ) || ! is_array( $content['data'] );
		if ( $is_invalid_file )
			wp_send_json_error( [ 'message' => 'Invalid file' ] );

		$template_title = isset( $content['title'] ) ? $content['title'] : '';
		$item_id = $this->save_item( $content['data'], $template_title );

		if ( is_wp_error( $item_id ) )
			wp_send_json_error( [ 'message' => $item_id->get_error_message() ] );

		wp_send_json_success( [ 'item' => $this->get_item( $item_id ) ] );
	}

	private function _get_export_link( $item_id ) {
		return add_query_arg(
			[
				'action' => 'elementor_export_template',
				'type' => $this->get_id(),
				'item_id' => $item_id,
			],
			admin_url( 'admin-ajax.php' )
		);
	}
}
