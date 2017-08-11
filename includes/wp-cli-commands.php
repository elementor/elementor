<?php
namespace Elementor;

/**
* WP ClI Commands for Elementor
*/
class WP_CLI_Commands extends \WP_CLI_Command
{
	
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

		$network = false;

		if ( isset( $assoc_args['network'] ) && $assoc_args['network'] == true && is_multisite() ) {
			$network = true;
		}

		if ( true == $network ) {

			if ( function_exists( 'get_sites' ) ) {
				$blogs = get_sites();
			} else {
				$blogs = wp_get_sites();
			}

			foreach ( $blogs as $keys => $blog ) {
				// Cast $blog as an array instead of WP_Site object
				if ( is_object( $blog ) ) {
					$blog = (array) $blog;
				}
				$blog_id = $blog['blog_id'];
				switch_to_blog( $blog_id );

				Plugin::$instance->posts_css_manager->clear_cache();
				\WP_CLI::success( 'Regenerated the Elementor CSS for site - ' . get_option( 'home' ) );

				restore_current_blog();
			}
		} else {

			Plugin::$instance->posts_css_manager->clear_cache();
			\WP_CLI::success( 'Regenerated the Elementor CSS' );
		}
	}
}

if ( class_exists( '\WP_CLI' ) ) {
	\WP_CLI::add_command( 'elementor', '\Elementor\WP_CLI_Commands' );
}