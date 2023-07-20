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
	 * Initialize the Container-Converter module.
	 *
	 * @return void
	 */
	public function __construct() {
		Plugin::$instance->data_manager_v2->register_controller( new Controller() );

		if ( Plugin::$instance->experiments->is_feature_active( self::PAGES_PANEL_EXPERIMENT_NAME ) ) {
			add_filter( 'elementor/editor-v2/packages/client-env', function ( $env ) {
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
	 * Determine whether the module is active.
	 *
	 * @return bool
	 */
	public static function is_active() {
		if ( Utils::is_elementor_tests() ) {
			return true;
		}

		return Plugin::$instance->experiments->is_feature_active( 'editor_v2' );
	}

	/**
	 * Get Experimental Data
	 *
	 * @since 3.16.0
	 *
	 * @return array
	 */
	public static function get_experimental_data() {
		return [
			'name' => self::PAGES_PANEL_EXPERIMENT_NAME,
			'title' => esc_html__( 'Pages Panel', 'elementor' ),
			'release_status' => Experiments_Manager::RELEASE_STATUS_BETA,
			'default' => Experiments_Manager::STATE_INACTIVE,
			'hidden' => true,
			'dependencies' => [
				'editor_v2',
			],
		];
	}

}
