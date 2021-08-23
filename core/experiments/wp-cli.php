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
	 */
	public function activate( $args ) {
		if ( empty( $args[ 0 ] ) ) {
			\WP_CLI::error( 'Please specify an experiment.' );
		}

		try {
			$experiments_manager = Plugin::instance()->experiments;
			$option = $experiments_manager->get_feature_option_key( $args[ 0 ] );

			update_option( $option, Experiments_Manager::STATE_ACTIVE );

			\WP_CLI::success( 'Experiment activated successfully.' );
		} catch ( \Exception $e ) {
			\WP_CLI::error( 'Cannot activate experiment.' );
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
	 */
	public function deactivate( $args ) {
		if ( empty( $args[ 0 ] ) ) {
			\WP_CLI::error( 'Please specify an experiment.' );
		}

		try {
			$experiments_manager = Plugin::instance()->experiments;
			$option = $experiments_manager->get_feature_option_key( $args[ 0 ] );

			update_option( $option, Experiments_Manager::STATE_INACTIVE );

			\WP_CLI::success( 'Experiment deactivated successfully.' );
		} catch ( \Exception $e ) {
			\WP_CLI::error( 'Cannot deactivate experiment.' );
		}
	}
}
