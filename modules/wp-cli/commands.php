<?php
namespace Elementor\Modules\WpCli;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Commands extends \WP_CLI_Command {

	/**
	 * Regenerate the Elementor Page Builder CSS.
	 *
	 * [--network]
	 *      Regenerate CSS of for all the sites in the network.
	 *
	 * ## EXAMPLES
	 *
	 *  1. wp elementor regenerate-css
	 *      - This will regenerate the CSS files for elementor page builder.
	 *
	 *  2. wp elementor regenerate-css --network
	 *  	- This will regenerate the CSS files for elementor page builder on all the sites in network.
	 *
	 * @alias regenerate-css
	 */
	public function regenerate_css( $args, $assoc_args ) {
		$network = ! empty( $assoc_args['network'] ) && is_multisite();

		if ( $network ) {
			/** @var \WP_Site[] $blogs */
			$blogs = get_sites();

			foreach ( $blogs as $keys => $blog ) {
				// Cast $blog as an array instead of  object
				$blog_id = $blog->blog_id;

				switch_to_blog( $blog_id );

				Plugin::$instance->files_manager->clear_cache();

				\WP_CLI::success( 'Regenerated the Elementor CSS for site - ' . get_option( 'home' ) );

				restore_current_blog();
			}
		} else {
			Plugin::$instance->files_manager->clear_cache();

			\WP_CLI::success( 'Regenerated the Elementor CSS' );
		}
	}
}
