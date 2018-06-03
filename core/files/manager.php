<?php
namespace Elementor\Core\Files;

use Elementor\Core\Files\CSS\Post as Post_CSS;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor files manager.
 *
 * Elementor files manager handler class is responsible for creating files.
 *
 * @since 1.2.0
 */
class Manager {

	/**
	 * Files manager constructor.
	 *
	 * Initializing the Elementor files manager.
	 *
	 * @since 1.2.0
	 * @access public
	 */
	public function __construct() {
		$this->register_actions();
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

		$css_file = new Post_CSS( $post_id );

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
		if ( '_elementor_css' === $meta_key ) {
			$skip = true;
		}

		return $skip;
	}

	/**
	 * Clear cache.
	 *
	 * Delete all meta containing files data. And delete the actual
	 * files from the upload directory.
	 *
	 * @since 1.2.0
	 * @access public
	 */
	public function clear_cache() {
		$files_classes = [
			'post' => 'Files\CSS\Post',
			'global' => 'Files\CSS\Global_CSS',
			'custom' => 'Responsive\Files\Frontend',
		];

		// Delete files.
		$path = Base::get_base_uploads_dir() . Base::DEFAULT_FILES_DIR . '*';

		foreach ( glob( $path ) as $file_path ) {
			$file_name = basename( $file_path );

			preg_match( '/^[a-z]+/', $file_name, $file_prefix );

			$file_prefix = $file_prefix[0];

			$class = 'Elementor\Core\\' . $files_classes[ $file_prefix ];

			if ( 'post' === $file_prefix ) {
				preg_match( '/[0-9]+/', $file_name, $post_id_match );

				$file_name = $post_id_match[0];
			}

			/** @var Base $file */
			$file = new $class( $file_name );

			$file->delete();
		}

		/**
		 * Elementor clear files.
		 *
		 * Fires after Elementor clears files
		 *
		 * @since 2.0.8
		 * @deprecated 2.1.0 Use `elementor/core/files/clear_cache` instead
		 */
		do_action_deprecated( 'elementor/css-file/clear_cache', [], '2.1.0', 'elementor/core/files/clear_cache' );

		/**
		 * Elementor clear files.
		 *
		 * Fires after Elementor clears files
		 *
		 * @since 2.1.0
		 */
		do_action( 'elementor/core/files/clear_cache' );
	}

	/**
	 * Register actions.
	 *
	 * Register filters and actions for the files manager.
	 *
	 * @since 1.2.0
	 * @access private
	 */
	private function register_actions() {
		add_action( 'deleted_post', [ $this, 'on_delete_post' ] );
		add_filter( 'wxr_export_skip_postmeta', [ $this, 'on_export_post_meta' ], 10, 2 );
	}
}
