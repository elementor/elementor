<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Posts_CSS_Manager {

	public function __construct() {
		$this->init();
		$this->register_actions();
	}

	public function init() {
		// Create the css directory if it's not exist
		$wp_upload_dir = wp_upload_dir( null, false );

		$css_path = $wp_upload_dir['basedir'] . CSS_File::FILE_BASE_DIR;

		if ( ! is_dir( $css_path ) ) {
			wp_mkdir_p( $css_path );
		}
	}

	public function on_delete_post( $post_id ) {
		if ( ! Utils::is_post_type_support( $post_id ) ) {
			return;
		}

		$css_file = new Post_CSS_File( $post_id );

		$css_file->delete();
	}

	/**
	 * @param bool $skip
	 * @param string $meta_key
	 *
	 * @return bool
	 */
	public function on_export_post_meta( $skip, $meta_key ) {
		if ( Post_CSS_File::META_KEY === $meta_key ) {
			$skip = true;
		}

		return $skip;
	}

	public function clear_cache() {
		$errors = [];

		// Delete post meta
		global $wpdb;

		$wpdb->delete( $wpdb->postmeta, [ 'meta_key' => Post_CSS_File::META_KEY ] );

		$wpdb->delete( $wpdb->options, [ 'option_name' => Global_CSS_File::META_KEY ] );

		// Delete files
		$wp_upload_dir = wp_upload_dir( null, false );

		$path = sprintf( '%s%s%s*', $wp_upload_dir['basedir'], CSS_File::FILE_BASE_DIR, '/' );

		foreach ( glob( $path ) as $file ) {
			$deleted = unlink( $file );

			if ( ! $deleted ) {
				$errors['files'] = 'Cannot delete files cache';
			}
		}

		return $errors;
	}

	private function register_actions() {
		add_action( 'deleted_post', [ $this, 'on_delete_post' ] );

		add_filter( 'wxr_export_skip_postmeta', [ $this, 'on_export_post_meta' ], 10, 2 );
	}
}
