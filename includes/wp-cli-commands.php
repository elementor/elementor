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
	 * ## EXAMPLES
	 *
	 *  1. wp elementor regenerate-css
	 *      - This will regenerate the CSS files for elementor page builder.
	 * 
	 * @alias regenerate-css
	 *
	*/
	public function regenerate_css( $args, $assoc_args ) {
		Plugin::$instance->posts_css_manager->clear_cache();
		\WP_CLI::success( 'Regenerated the Elementor CSS' );
	}
}

if ( class_exists( '\WP_CLI' ) ) {
	\WP_CLI::add_command( 'elementor', '\Elementor\WP_CLI_Commands' );
}