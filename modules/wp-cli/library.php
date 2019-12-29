<?php
namespace Elementor\Modules\WpCli;

use Elementor\Api;
use Elementor\Plugin;
use Elementor\TemplateLibrary\Source_Local;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * Elementor Page Builder cli tools.
 */
class Library extends \WP_CLI_Command {

	/**
	 * Sync Elementor Library.
	 *
	 * [--network]
	 *      Sync library in all the sites in the network.
	 *
	 * [--force]
	 *      Force sync even if it's looks like that the library is already up to date.
	 *
	 * ## EXAMPLES
	 *
	 *  1. wp elementor library sync
	 *      - This will sync the library with Elementor cloud library.
	 *
	 *  2. wp elementor library sync --force
	 *      - This will sync the library with Elementor cloud even if it's looks like that the library is already up to date.
	 *
	 *  3. wp elementor library sync --network
	 *      - This will sync the library with Elementor cloud library for each site in the network if needed.
	 *
	 * @since 2.8.0
	 * @access public
	 */
	public function sync( $args, $assoc_args ) {
		$network = isset( $assoc_args['network'] ) && is_multisite();

		if ( $network ) {
			/** @var \WP_Site[] $sites */
			$sites = get_sites();

			foreach ( $sites as $keys => $blog ) {
				// Cast $blog as an array instead of  object
				$blog_id = $blog->blog_id;

				switch_to_blog( $blog_id );

				\WP_CLI::line( 'Site #' . $blog_id . ' - ' . get_option( 'blogname' ) );

				$this->do_sync( isset( $assoc_args['force'] ) );

				\WP_CLI::success( 'Done! - ' . get_option( 'home' ) );

				restore_current_blog();
			}
		} else {
			$this->do_sync( isset( $assoc_args['force'] ) );
		}
	}

	/**
	 * Import template files to the Library.
	 *
	 * ## EXAMPLES
	 *
	 *  1. wp elementor library import <file-path>
	 *      - This will import a file or a zip of multiple files to the library.
	 *
	 * @param $args
	 * @param $assoc_args
	 *
	 * @since  2.8.0
	 * @access public
	 */
	public function import( $args ) {
		if ( empty( $args[0] ) ) {
			\WP_CLI::error( 'Please set file path.' );
		}

		$file = $args[0];

		/** @var Source_Local $source */
		$source = Plugin::$instance->templates_manager->get_source( 'local' );

		$imported_items = $source->import_template( basename( $file ), $file );

		if ( is_wp_error( $imported_items ) ) {
			\WP_CLI::error( $imported_items->get_error_message() );
		}

		\WP_CLI::success( count( $imported_items ) . ' item(s) has been imported.' );
	}

	/**
	 * Connect site to Elementor Library.
	 * (Network is not supported)
	 *
	 * --user
	 *      The user to connect <id|login|email>
	 *
	 * --token
	 *      A connect token from Elementor Account Dashboard.
	 *
	 * ## EXAMPLES
	 *
	 *  1. wp elementor library connect --user=admin --token=<connect-cli-token>
	 *      - This will connect the admin to Elementor library.
	 *
	 * @param $args
	 * @param $assoc_args
	 *
	 * @since  2.8.0
	 * @access public
	 */
	public function connect( $args, $assoc_args ) {
		if ( ! get_current_user_id() ) {
			\WP_CLI::error( 'Please set user to connect (--user=<id|login|email>).' );
		}

		if ( empty( $assoc_args['token'] ) ) {
			\WP_CLI::error( 'Please set connect token.' );
		}

		$_REQUEST['mode'] = 'cli';
		$_REQUEST['token'] = $assoc_args['token'];

		$app = $this->get_library_app();

		$app->action_authorize();

		$app->action_get_token();
	}

	/**
	 * Disconnect site from Elementor Library.
	 *
	 * --user
	 *      The user to disconnect <id|login|email>
	 *
	 * ## EXAMPLES
	 *
	 *  1. wp elementor library disconnect --user=admin
	 *      - This will disconnect the admin from Elementor library.
	 *
	 * @param $args
	 * @param $assoc_args
	 *
	 * @since  2.8.0
	 * @access public
	 */
	public function disconnect() {
		if ( ! get_current_user_id() ) {
			\WP_CLI::error( 'Please set user to connect (--user=<id|login|email>).' );
		}

		$_REQUEST['mode'] = 'cli';

		$this->get_library_app()->action_disconnect();
	}

	/**
	 * @return \Elementor\Core\Common\Modules\Connect\Apps\Library
	 */
	private function get_library_app() {
		$connect = Plugin::$instance->common->get_component( 'connect' );
		$app = $connect->get_app( 'library' );
		// Before init.
		if ( ! $app ) {
			$connect->init();
			$app = $connect->get_app( 'library' );
		}

		return $app;
	}
}
