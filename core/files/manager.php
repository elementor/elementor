<?php
namespace Elementor\Core\Files;

use Elementor\Core\Base\Document as Document_Base;
use Elementor\Core\Common\Modules\Ajax\Module as Ajax;
use Elementor\Core\Files\CSS\Global_CSS;
use Elementor\Core\Files\CSS\Post as Post_CSS;
use Elementor\Core\Page_Assets\Data_Managers\Base as Page_Assets_Data_Manager;
use Elementor\Core\Responsive\Files\Frontend;
use Elementor\Plugin;
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

	private $files = [];

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

	public function get( $class, $args ) {
		$id = $class . '-' . wp_json_encode( $args );

		if ( ! isset( $this->files[ $id ] ) ) {
			// Create an instance from dynamic args length.
			$reflection_class = new \ReflectionClass( $class );
			$this->files[ $id ] = $reflection_class->newInstanceArgs( $args );
		}

		return $this->files[ $id ];
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
		if ( ! Utils::is_post_support( $post_id ) ) {
			return;
		}

		$css_file = Post_CSS::create( $post_id );

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
		if ( Post_CSS::META_KEY === $meta_key ) {
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
		// Delete files.
		$path = Base::get_base_uploads_dir() . Base::DEFAULT_FILES_DIR . '*';

		foreach ( glob( $path ) as $file_path ) {
			unlink( $file_path );
		}

		delete_post_meta_by_key( Post_CSS::META_KEY );
		delete_post_meta_by_key( Document_Base::CACHE_META_KEY );

		delete_option( Global_CSS::META_KEY );
		delete_option( Frontend::META_KEY );

		$this->reset_assets_data();

		/**
		 * Elementor clear files.
		 *
		 * Fires after Elementor clears files
		 *
		 * @since 2.1.0
		 */
		do_action( 'elementor/core/files/clear_cache' );
	}

	public function clear_custom_image_sizes() {
		$upload_info = wp_upload_dir();
		$upload_dir = $upload_info['basedir'] . '/' . BFITHUMB_UPLOAD_DIR;

		$path = $upload_dir . '/*';

		foreach ( glob( $path ) as $file_path ) {
			unlink( $file_path );
		}
	}

	/**
	 * Register Ajax Actions
	 *
	 * Deprecated - use the Uploads Manager instead.
	 *
	 * @deprecated 3.5.0
	 *
	 * @param Ajax $ajax
	 */
	public function register_ajax_actions( Ajax $ajax ) {
		Plugin::$instance->modules_manager->get_modules( 'dev-tools' )->deprecation->deprecated_function( __METHOD__, '3.5.0' );

		Plugin::$instance->uploads_manager->register_ajax_actions( $ajax );
	}

	/**
	 * Ajax Unfiltered Files Upload
	 *
	 * Deprecated - use the Uploads Manager instead.
	 *
	 * @deprecated 3.5.0
	 */
	public function ajax_unfiltered_files_upload() {
		Plugin::$instance->modules_manager->get_modules( 'dev-tools' )->deprecation->deprecated_function( __METHOD__, '3.5.0' );

		Plugin::$instance->uploads_manager->enable_unfiltered_files_upload();
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

		add_action( 'update_option_home', function () {
			$this->reset_assets_data();
		} );

		add_action( 'update_option_siteurl', function () {
			$this->reset_assets_data();
		} );
	}

	/**
	 * Reset Assets Data.
	 *
	 * Reset the page assets data.
	 *
	 * @since 3.3.0
	 * @access private
	 */
	private function reset_assets_data() {
		delete_option( Page_Assets_Data_Manager::ASSETS_DATA_KEY );
	}
}
