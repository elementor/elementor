<?php

namespace Elementor\Modules\OptimizationDetective;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {
	const EXPERIMENT_NAME = 'optimization_detective';

	public function get_name() {
		return 'optimization-detective';
	}

	public function __construct() {
		parent::__construct();

		$this->register_experiment();

		if ( Plugin::$instance->experiments->is_feature_active( self::EXPERIMENT_NAME ) ) {
			include_once __DIR__ . '/plugins/optimization-detective/load.php';
			include_once __DIR__ . '/plugins/image-prioritizer/load.php';
			include_once __DIR__ . '/plugins/embed-optimizer/load.php';

			/*
			 * The following foreach loop was not intended to be required as each of the plugins are supposed to bootstrap
			 * themselves simply by including the main plugin files (as done above). However, the bootstrap logic is
			 * designed with the assumption that the plugin code has loaded before the after_setup_theme action, which
			 * is not the case for Elementor. This will be accounted for in future versions of the above plugins and
			 * the foreach loop can be removed at that time.
			 * TODO: Remove this once https://github.com/WordPress/performance/pull/1373 is merged and released.
			 */
			$pending_plugin_variables = array(
				'optimization_detective_pending_plugin',
				'image_prioritizer_pending_plugin',
				'embed_optimizer_pending_plugin',
			);
			foreach ( $pending_plugin_variables as $pending_plugin_variable ) {
				if (
					isset( $GLOBALS[ $pending_plugin_variable ]['load'], $GLOBALS[ $pending_plugin_variable ]['version'] )
					&&
					is_callable( $GLOBALS[ $pending_plugin_variable ]['load'] )
					&&
					is_string( $GLOBALS[ $pending_plugin_variable ]['version'] )
				) {
					$GLOBALS[ $pending_plugin_variable ]['load']( $GLOBALS[ $pending_plugin_variable ]['version'] );
				}
			}

			// TODO: Uncomment this once https://github.com/westonruter/elementor-lcp-background-image-preloader has been completed.
			// include_once __DIR__ . '/plugins/elementor-lcp-background-image-preloader/elementor-lcp-background-image-preloader.php';
		}
	}

	private function register_experiment() {
		Plugin::$instance->experiments->add_feature( [
			'name' => self::EXPERIMENT_NAME,
			'title' => esc_html__( 'Optimization Detective', 'elementor' ),
			'description' => esc_html__( 'Leverage real user metrics to detect optimizations to apply on the frontend to improve page performance.', 'elementor' ),
			'hidden' => true,
			'default' => Experiments_Manager::STATE_INACTIVE,
			'release_status' => Experiments_Manager::RELEASE_STATUS_ALPHA,
		] );
	}
}
