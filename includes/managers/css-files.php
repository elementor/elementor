<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor posts CSS manager.
 *
 * Elementor posts CSS manager handler class is responsible for creating custom
 * CSS file for posts.
 *
 * @since 1.2.0
 */
class Posts_CSS_Manager {

	/**
	 * Posts CSS manager constructor.
	 *
	 * Initializing the Elementor posts CSS manager.
	 *
	 * @since 1.2.0
	 * @access public
	 */
	public function __construct() {
		$this->init();
		$this->register_actions();
	}

	/**
	 * Init.
	 *
	 * Initialize Elementor posts CSS manager and create the css directory, if
	 * it doesn't exist.
	 *
	 * @since 1.2.0
	 * @access public
	 */
	public function init() {
		$wp_upload_dir = wp_upload_dir( null, false );

		$css_path = $wp_upload_dir['basedir'] . CSS_File::FILE_BASE_DIR;

		// Create the css directory, if it doesn't exist.
		if ( ! is_dir( $css_path ) ) {
			wp_mkdir_p( $css_path );
		}
	}

	/**
	 * On post delete.
	 *
	 * Delete post CSS immediately after a post is deleted from the database.
	 *
	 * Fired by `deleted_post` action.
	 *
	 * @since 1.2.0
	 * @access public
	 *
	 * @param string $post_id Post ID.
	 */
	public function on_delete_post( $post_id ) {
		if ( ! Utils::is_post_type_support( $post_id ) ) {
			return;
		}

		$css_file = new Post_CSS_File( $post_id );

		$css_file->delete();
	}

	/**
	 * On export post meta.
	 *
	 * When exporting data using WXR, skip post CSS file meta key. This way the
	 * export won't contain the post CSS file data used by Elementor.
	 *
	 * Fired by `wxr_export_skip_postmeta` filter.
	 *
	 * @since 1.2.0
	 * @access public
	 *
	 * @param bool   $skip     Whether to skip the current post meta.
	 * @param string $meta_key Current meta key.
	 *
	 * @return bool Whether to skip the post CSS meta.
	 */
	public function on_export_post_meta( $skip, $meta_key ) {
		if ( Post_CSS_File::META_KEY === $meta_key ) {
			$skip = true;
		}

		return $skip;
	}

	/**
	 * Clear cache.
	 *
	 * Delete post meta containing the post CSS file data. And delete the actual
	 * CSS files from the upload directory.
	 *
	 * @since 1.2.0
	 * @access public
	 *
	 * @return array Errors, if had files could not be deleted.
	 */
	public function clear_cache() {
		$errors = [];

		// Delete post meta.
		global $wpdb;

		$wpdb->delete(
			$wpdb->postmeta, [
				'meta_key' => Post_CSS_File::META_KEY,
			]
		);

		$wpdb->delete(
			$wpdb->options, [
				'option_name' => Global_CSS_File::META_KEY,
			]
		);

		// Delete files.
		$wp_upload_dir = wp_upload_dir( null, false );

		$path = sprintf( '%s%s%s*', $wp_upload_dir['basedir'], CSS_File::FILE_BASE_DIR, '/' );

		foreach ( glob( $path ) as $file ) {
			$deleted = unlink( $file );

			if ( ! $deleted ) {
				$errors['files'] = 'Cannot delete files cache';
			}
		}

		/**
		 * Elementor clear CSS files.
		 *
		 * Fires after Elementor clears CSS files
		 *
		 * @since 2.0.8
		 */
		do_action( 'elementor/css-file/clear_cache' );

		return $errors;
	}

	/**
	 * Register actions.
	 *
	 * Register filters and actions for the posts CSS manager.
	 *
	 * @since 1.2.0
	 * @access private
	 */
	private function register_actions() {
		add_action( 'deleted_post', [ $this, 'on_delete_post' ] );
		add_filter( 'wxr_export_skip_postmeta', [ $this, 'on_export_post_meta' ], 10, 2 );
	}
}
