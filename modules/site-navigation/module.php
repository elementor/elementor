<?php

namespace Elementor\Modules\SiteNavigation;

use Elementor\Core\Base\Module as Module_Base;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\SiteNavigation\Data\Controller;
use Elementor\Plugin;
use Elementor\Utils;


if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends Module_Base {
	const PAGES_PANEL_EXPERIMENT_NAME = 'pages_panel';

	/**
	 * Initialize the Site navigation module.
	 * @return void
	 * @throws \Exception
	 */
	public function __construct() {
		Plugin::$instance->data_manager_v2->register_controller( new Controller() );

		$is_tests = Utils::is_elementor_tests();
		$is_v2_experiment_on = Plugin::$instance->experiments->is_feature_active( 'editor_v2' );
		if ( ! $is_v2_experiment_on && ! $is_tests ) {
			return;
		}

		$this->register_pages_panel_experiment();

		if ( Plugin::$instance->experiments->is_feature_active( self::PAGES_PANEL_EXPERIMENT_NAME ) ) {
			add_filter( 'elementor/editor/v2/scripts/env', function ( $env ) {
				$env['@elementor/editor-site-navigation'] = [
					'is_pages_panel_active' => true,
				];

				return $env;
			} );
		}
	}

	/**
	 * Retrieve the module name.
	 *
	 * @return string
	 */
	public function get_name() {
		return 'site-navigation';
	}

	/**
	 * Register Experiment
	 *
	 * @since 3.16.0
	 *
	 * @return void
	 * @throws \Exception
	 */
	private function register_pages_panel_experiment() {
		Plugin::$instance->experiments->add_feature( [
			'name' => self::PAGES_PANEL_EXPERIMENT_NAME,
			'title' => esc_html__( 'Pages Panel', 'elementor' ),
			'release_status' => Experiments_Manager::RELEASE_STATUS_ALPHA,
			'default' => Experiments_Manager::STATE_INACTIVE,
			'hidden' => true,
			'dependencies' => [
				'editor_v2',
			],
		] );
	}
}
