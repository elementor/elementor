<?php
namespace Elementor\Modules\WpCli;

use Elementor\Api;
use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * Elementor Page Builder cli tools.
 */
class Command extends \WP_CLI_Command {

	/**
	 * Flush the Elementor Page Builder CSS Cache.
	 *
	 * [--network]
	 *      Flush CSS Cache for all the sites in the network.
	 *
	 * ## EXAMPLES
	 *
	 *  1. wp elementor flush-css
	 *      - This will flush the CSS files for elementor page builder.
	 *
	 *  2. wp elementor flush-css --network
	 *      - This will flush the CSS files for elementor page builder for all the sites in the network.
	 *
	 * @alias flush-css
	 */
	public function flush_css( $args, $assoc_args ) {
		$network = ! empty( $assoc_args['network'] ) && is_multisite();

		if ( $network ) {
			/** @var \WP_Site[] $blogs */
			$blogs = get_sites();

			foreach ( $blogs as $keys => $blog ) {
				// Cast $blog as an array instead of  object
				$blog_id = $blog->blog_id;

				switch_to_blog( $blog_id );

				Plugin::$instance->files_manager->clear_cache();

				\WP_CLI::success( 'Flushed the Elementor CSS Cache for site - ' . get_option( 'home' ) );

				restore_current_blog();
			}
		} else {
			Plugin::$instance->files_manager->clear_cache();

			\WP_CLI::success( 'Flushed the Elementor CSS Cache' );
		}
	}

	/**
	 * Replace old URLs to new URLs in all Elementor pages data.
	 *
	 * ## EXAMPLES
	 *
	 *  1. wp elementor search-replace <from> <to>
	 *      - This will replace all <from> URLs with the <to> URL.
	 *
	 * @alias replace-urls
	 */

	public function replace_urls( $args, $assoc_args ) {
		if ( empty( $args[0] ) ) {
			\WP_CLI::error( 'Please set the `from` URL' );
		}

		if ( empty( $args[1] ) ) {
			\WP_CLI::error( 'Please set the `to` URL' );
		}

		try {
			$results = Utils::replace_urls( $args[0], $args[1] );
			\WP_CLI::success( $results );
		} catch ( \Exception $e ) {
			\WP_CLI::error( $e->getMessage() );
		}
	}

	/**
	 * Sync Elementor Library.
	 *
	 * ## EXAMPLES
	 *
	 *  1. wp elementor sync-library
	 *      - This will sync the library with Elementor Server library.
	 *
	 * @alias sync-library
	 */
	public function sync_library( $args, $assoc_args ) {
		$data = Api::get_library_data( true );

		if ( empty( $data ) ) {
			\WP_CLI::error( 'Cannot sync library.' );
		}

		\WP_CLI::success( 'Library has been synced.' );
	}
}
