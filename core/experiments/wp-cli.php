<?php

namespace Elementor\Core\Experiments;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Wp_Cli extends \WP_CLI_Command {

	/**
	 * Activate an Experiment
	 *
	 * ## EXAMPLES
	 *
	 * 1. wp elementor experiments activate container
	 *      - This will activate the Container experiment.
	 *
	 * @param array $args
	 * @param array|null $assoc_args - Arguments from WP CLI command.
	 */
	public function activate( $args, $assoc_args ) {
		if ( empty( $args[0] ) ) {
			\WP_CLI::error( 'Please specify an experiment.' );
		}

		$is_network = $this->is_network( $assoc_args );

		// Activate experiment callback.
		$activate = function ( $site = '', $id = null ) use ( $args, $is_network ) {
			$success = 'Experiment activated successfully';
			$error = 'Cannot activate experiment';

			if ( $is_network ) {
				$success .= " for site {$site}";
				$error .= " for site {$site}";
			}

			$experiments_manager = Plugin::instance()->experiments;
			$option = $experiments_manager->get_feature_option_key( $args[0] );

			update_option( $option, Experiments_Manager::STATE_ACTIVE );

			try {
				\WP_CLI::success( $success );
			} catch ( \Exception $e ) {
				\WP_CLI::error( $error );
			}
		};

		if ( $is_network ) {
			$this->foreach_sites( $activate );
		} else {
			$activate();
		}
	}

	/**
	 * Deactivate an Experiment
	 *
	 * ## EXAMPLES
	 *
	 * 1. wp elementor experiments deactivate container
	 *      - This will deactivate the Container experiment.
	 *
	 * @param array $args
	 * @param array|null $assoc_args - Arguments from WP CLI command.
	 */
	public function deactivate( $args, $assoc_args ) {
		if ( empty( $args[0] ) ) {
			\WP_CLI::error( 'Please specify an experiment.' );
		}

		$is_network = $this->is_network( $assoc_args );

		// Activate experiment callback.
		$activate = function ( $site = '' ) use ( $args, $is_network ) {
			$success = 'Experiment deactivated successfully';
			$error = 'Cannot deactivate experiment';

			if ( $is_network ) {
				$success .= " for site {$site}";
				$error .= " for site {$site}";
			}

			$experiments_manager = Plugin::instance()->experiments;
			$option = $experiments_manager->get_feature_option_key( $args[0] );

			update_option( $option, Experiments_Manager::STATE_INACTIVE );

			try {
				\WP_CLI::success( $success );
			} catch ( \Exception $e ) {
				\WP_CLI::error( $error );
			}
		};

		if ( $is_network ) {
			$this->foreach_sites( $activate );
		} else {
			$activate();
		}
	}

	/**
	 * Experiment Status
	 *
	 * ## EXAMPLES
	 *
	 * 1. wp elementor experiments status container
	 *      - This will return the status of Container experiment. (active/inactive)
	 *
	 * @param array $args
	 */
	public function status( $args ) {
		if ( empty( $args[0] ) ) {
			\WP_CLI::error( 'Please specify an experiment.' );
		}

		$experiments_manager = Plugin::$instance->experiments;
		$experiments_status = $experiments_manager->is_feature_active( $args[0] ) ? 'active' : 'inactive';

		\WP_CLI::line( $experiments_status );
	}

	/**
	 * Determine if the current website is a multisite.
	 *
	 * @param array|null $assoc_args - Arguments from WP CLI command.
	 *
	 * @return bool
	 */
	private function is_network( $assoc_args ) {
		return ! empty( $assoc_args['network'] ) && is_multisite();
	}

	/**
	 * Iterate over network sites and execute a callback.
	 *
	 * @param callable $callback - Callback to execute. Gets the site name & id as parameters.
	 *
	 * @return void
	 */
	private function foreach_sites( callable $callback ) {
		$blog_ids = get_sites( [
			'fields' => 'ids',
			'number' => 0,
		] );

		foreach ( $blog_ids as $blog_id ) {
			switch_to_blog( $blog_id );

			$callback( get_option( 'home' ), $blog_id );

			restore_current_blog();
		}
	}
}
