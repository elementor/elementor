<?php

namespace Elementor\Modules\SiteNavigation;

use Elementor\Core\Base\Module as Module_Base;
use Elementor\Core\Experiments\Exceptions\Dependency_Exception;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\SiteNavigation\Data\Controller;
use Elementor\Modules\SiteNavigation\Rest_Fields\Page_User_Can;
use Elementor\Plugin;
use Elementor\Utils;


if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends Module_Base {
	const PAGES_PANEL_EXPERIMENT_NAME = 'pages_panel';

	/**
	 * Initialize the Site navigation module.
	 *
	 * @return void
	 * @throws \Exception If the experiment registration fails.
	 */
	public function __construct() {
		Plugin::$instance->data_manager_v2->register_controller( new Controller() );

		$is_tests = Utils::is_elementor_tests();
		$is_v2_experiment_on = Plugin::$instance->experiments->is_feature_active( 'editor_v2' );
		if ( ! $is_v2_experiment_on && ! $is_tests ) {
			return;
		}

		if ( Plugin::$instance->experiments->is_feature_active( self::PAGES_PANEL_EXPERIMENT_NAME ) ) {
			add_filter( 'elementor/editor/v2/scripts/env', function( $env ) {
				$env['@elementor/editor-site-navigation'] = [
					'is_pages_panel_active' => true,
				];

				return $env;
			} );
			$this->register_rest_fields();
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

	public static function get_experimental_data(): array {
		return [
			'name' => self::PAGES_PANEL_EXPERIMENT_NAME,
			'title' => esc_html__( 'Pages Panel', 'elementor' ),
			'release_status' => Experiments_Manager::RELEASE_STATUS_ALPHA,
			'default' => Experiments_Manager::STATE_INACTIVE,
			'hidden' => true,
			'dependencies' => [
				'editor_v2',
			],
		];
	}

	private function register_rest_fields() {
		add_action( 'rest_api_init', function() {
			( new Page_User_Can() )->register_rest_field();
		} );
	}
}
