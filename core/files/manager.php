<?php
namespace Elementor\Core\Files;

use Elementor\Core\Base\Document as Document_Base;
use Elementor\Core\Base\Elements_Iteration_Actions\Assets;
use Elementor\Core\Common\Modules\Ajax\Module as Ajax;
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
	 * Whether an automatic (non-explicit) purge already ran once during the current
	 * request, across both `invalidate_cache()` and `clear_cache()`.
	 *
	 * Only consulted when the `e_optimized_css_files` experiment is active, to
	 * collapse the multiple purges a single genuine update can trigger (e.g.
	 * Elementor's own DB upgrade purges at both upgrade-start and
	 * upgrade-complete, on top of the `upgrader_process_complete` hook).
	 *
	 * @var bool
	 */
	private $has_purged_cache_this_request = false;

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
		$this->register_site_changed_hooks();
	}

	public function get( $class_name, $args ) {
		$id = $class_name . '-' . wp_json_encode( $args );

		if ( ! isset( $this->files[ $id ] ) ) {
			// Create an instance from dynamic args length.
			$reflection_class = new \ReflectionClass( $class_name );
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
	 * Invalidate cache.
	 *
	 * Delete all meta containing files data, WITHOUT touching the actual files on
	 * disk. Used for the "automatic" purge path (site-change hooks, DB upgrades,
	 * experiment toggles): the meta is cleared so the next render regenerates and
	 * overwrites the file in place, but nothing goes missing in the meantime.
	 *
	 * When the `e_optimized_css_files` experiment is active, repeated calls to
	 * `invalidate_cache()` or `clear_cache()` within the same request are collapsed
	 * into a single purge (see `$has_purged_cache_this_request`).
	 *
	 * @since 3.33.0
	 * @access public
	 */
	public function invalidate_cache() {
		if ( $this->is_optimized_css_files_active() ) {
			if ( $this->has_purged_cache_this_request ) {
				return;
			}

			$this->has_purged_cache_this_request = true;
		}

		$this->invalidate_cache_meta();
	}

	/**
	 * Clear cache.
	 *
	 * Delete all meta containing files data. And delete the actual
	 * files from the upload directory.
	 *
	 * When the `e_optimized_css_files` experiment is active, repeated calls to
	 * `clear_cache()` or `invalidate_cache()` within the same request are collapsed
	 * into a single purge (see `$has_purged_cache_this_request`).
	 *
	 * @since 1.2.0
	 * @access public
	 */
	public function clear_cache() {
		if ( $this->is_optimized_css_files_active() ) {
			if ( $this->has_purged_cache_this_request ) {
				return;
			}

			$this->has_purged_cache_this_request = true;
		}

		$this->invalidate_cache_meta();

		// Delete files.
		$path = Base::get_base_uploads_dir() . Base::DEFAULT_FILES_DIR . '*';

		$file_paths = glob( $path );

		if ( is_array( $file_paths ) ) {
			foreach ( $file_paths as $file_path ) {
				// A file that vanished between `glob()` and `unlink()` (e.g. a concurrent
				// purge) is not an error, so guard with `is_file()` instead of letting
				// `unlink()` emit a PHP warning.
				if ( is_file( $file_path ) ) {
					unlink( $file_path );
				}
			}
		}

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
	 * Delete all meta containing files data, without any dedup guard or action hook.
	 * Shared by `invalidate_cache()` and `clear_cache()`, each of which applies its
	 * own per-request dedup before calling this.
	 *
	 * @since 3.33.0
	 * @access private
	 */
	private function invalidate_cache_meta() {
		delete_post_meta_by_key( Post_CSS::META_KEY );
		delete_post_meta_by_key( Document_Base::CACHE_META_KEY );
		delete_post_meta_by_key( Assets::ASSETS_META_KEY );

		delete_option( Frontend::META_KEY );

		$this->reset_assets_data();

		/**
		 * Elementor invalidate files cache.
		 *
		 * Fires after Elementor invalidates the files cache meta, without deleting any
		 * files from disk.
		 *
		 * @since 3.33.0
		 */
		do_action( 'elementor/core/files/invalidate_cache' );
	}

	public function clear_custom_image_sizes() {
		if ( ! defined( 'BFITHUMB_UPLOAD_DIR' ) ) {
			return;
		}

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

		add_action( 'rest_api_init', [ $this, 'register_endpoints' ] );
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

	/**
	 * Register site-changed hooks.
	 *
	 * Purge the files cache whenever the site's plugins, theme or Elementor's
	 * own element-cache TTL setting change. Relocated here (from the
	 * `element-cache` module) because the module's Performance-tab setting
	 * does not actually govern this purge - it is a files/assets concern.
	 *
	 * Ungated: this registration is behaviour-neutral regardless of the
	 * `e_optimized_css_files` experiment. The routing decision (invalidate vs.
	 * hard delete) happens inside `on_site_changed()` / `on_upgrader_process_complete()`.
	 *
	 * @since 3.33.0
	 * @access private
	 */
	private function register_site_changed_hooks() {
		add_action( 'activated_plugin', [ $this, 'on_site_changed' ] );
		add_action( 'deactivated_plugin', [ $this, 'on_site_changed' ] );
		add_action( 'switch_theme', [ $this, 'on_site_changed' ] );
		add_action( 'upgrader_process_complete', [ $this, 'on_upgrader_process_complete' ], 10, 2 );

		add_action( 'update_option_elementor_element_cache_ttl', [ $this, 'on_site_changed' ] );
	}

	/**
	 * On site changed.
	 *
	 * Automatic, non-user-triggered purge fired by hooks that indicate a site
	 * change happened (plugin/theme activation or deactivation, the element-cache
	 * TTL setting changing). Never fired by an explicit user action.
	 *
	 * When the `e_optimized_css_files` experiment is active, invalidate the cache
	 * meta only: files stay on disk, so there is no window in which page-cached
	 * HTML points at a stylesheet that no longer exists. When the experiment is
	 * inactive, keep today's behavior (hard delete).
	 *
	 * @since 3.33.0
	 * @access public
	 */
	public function on_site_changed() {
		$this->automatic_purge();
	}

	/**
	 * On upgrader process complete.
	 *
	 * Fired by the `upgrader_process_complete` action, which WordPress also fires on
	 * mere update checks, translation updates, and bulk-update submissions with an
	 * empty item queue - none of which changed anything Elementor needs to purge for.
	 *
	 * When the `e_optimized_css_files` experiment is active, those false alarms are
	 * skipped, and a genuine update invalidates the cache meta only (see
	 * `automatic_purge()`). When inactive, behaviour is unchanged: always hard-delete.
	 *
	 * WordPress passes the `hook_extra` array directly as the second argument to this
	 * action (see `WP_Upgrader::run()`), NOT nested under a `hook_extra` key - do not
	 * confuse this with `WP_Upgrader::$result['hook_extra']` accessed elsewhere.
	 *
	 * @since 3.33.0
	 * @access public
	 *
	 * @param \WP_Upgrader|false $upgrader   The upgrader instance, or false.
	 * @param array              $hook_extra The upgrade payload (`action`, `type`, `plugins`/`themes`/`plugin`/`theme`, `translations`, ...).
	 */
	public function on_upgrader_process_complete( $upgrader, $hook_extra ) {
		if ( $this->is_optimized_css_files_active() && ! $this->is_genuine_update( $hook_extra ) ) {
			return;
		}

		$this->automatic_purge();
	}

	/**
	 * Whether the `upgrader_process_complete` payload represents a genuine plugin,
	 * theme or core update (as opposed to an update check, a translation update, or
	 * a bulk-update form submitted with nothing selected).
	 *
	 * @since 3.33.0
	 * @access private
	 *
	 * @param array $hook_extra The upgrade payload passed as the hook's second argument.
	 *
	 * @return bool
	 */
	private function is_genuine_update( $hook_extra ) {
		if ( empty( $hook_extra ) || ! is_array( $hook_extra ) ) {
			return false;
		}

		if ( 'translation' === ( $hook_extra['type'] ?? null ) || ! empty( $hook_extra['translations'] ) ) {
			return false;
		}

		if ( 'update' === ( $hook_extra['action'] ?? null ) && 'core' !== ( $hook_extra['type'] ?? null ) ) {
			$has_queued_items = ! empty( $hook_extra['plugins'] )
				|| ! empty( $hook_extra['themes'] )
				|| ! empty( $hook_extra['plugin'] )
				|| ! empty( $hook_extra['theme'] );

			if ( ! $has_queued_items ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Automatic purge routing.
	 *
	 * Shared by every non-explicit purge trigger (site-change hooks, genuine
	 * upgrader completions). When the `e_optimized_css_files` experiment is active,
	 * invalidate cache meta only. Otherwise, hard-delete as before. Explicit,
	 * user-triggered purges (Tools, admin bar, REST `DELETE /elementor/v1/cache`,
	 * WP-CLI `flush-css`) call `clear_cache()` directly and never go through here.
	 *
	 * @since 3.33.0
	 * @access private
	 */
	private function automatic_purge() {
		if ( $this->is_optimized_css_files_active() ) {
			$this->invalidate_cache();

			return;
		}

		$this->clear_cache();
	}

	/**
	 * Whether the `e_optimized_css_files` experiment is active.
	 *
	 * @since 3.33.0
	 * @access private
	 *
	 * @return bool
	 */
	private function is_optimized_css_files_active() {
		return Plugin::$instance->experiments->is_feature_active( 'e_optimized_css_files' );
	}

	/**
	 * Generate CSS.
	 *
	 * Generates CSS for all posts built with Elementor.
	 *
	 * @since 3.25.0
	 * @access public
	 */
	public function generate_css() {
		$batch_size = apply_filters( 'elementor/core/files/generate_css/batch_size', 100 );
		$processed_posts = 0;

		while ( true ) {
			$args = [
				'post_type' => get_post_types(),
				'posts_per_page' => $batch_size,
				'meta_query' => [
					[
						'key' => Document_Base::BUILT_WITH_ELEMENTOR_META_KEY,
						'compare' => 'EXISTS',
					],
				],
				'offset' => $processed_posts,
				'fields' => 'ids',
			];

			$query = new \WP_Query( $args );

			if ( empty( $query->posts ) ) {
				break;
			}

			foreach ( $query->posts as $post_id ) {
				$document = Plugin::$instance->documents->get_doc_for_frontend( $post_id );

				if ( $document ) {
					$css_file = Post_CSS::create( $post_id );
					$css_file->update();
				}
			}

			$processed_posts += $batch_size;
		}

		/**
		 * Elementor Generate CSS files.
		 *
		 * Fires after Elementor generates new CSS files
		 *
		 * @since 3.25.0
		 */
		do_action( 'elementor/core/files/after_generate_css' );
	}

	public function register_endpoints() {
		register_rest_route(
			'elementor/v1',
			'/cache',
			[
				'methods' => \WP_REST_Server::DELETABLE,
				'callback' => [ $this, 'clear_cache' ],
				'permission_callback' => function() {
					return current_user_can( 'manage_options' );
				},
			]
		);
	}
}
