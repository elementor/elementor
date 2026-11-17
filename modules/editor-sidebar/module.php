<?php

namespace Elementor\Modules\EditorSidebar;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\Module as AtomicWidgetsModule;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseModule {

	const EXPERIMENT_NAME = 'e_editor_sidebar';

	const ATOMIC_ELEMENTS_PANEL_PACKAGES = [ 'editor-atomic-elements-panel' ];

	public function get_name(): string {
		return 'editor-sidebar';
	}

	public function __construct() {
		parent::__construct();

		add_filter( 'elementor/editor/v2/packages', fn( $packages ) => $this->add_packages( $packages ) );
	}

	private function add_packages( $packages ) {
		if ( ! self::is_active() || ! Plugin::$instance->experiments->is_feature_active( AtomicWidgetsModule::EXPERIMENT_NAME ) ) {
			return $packages;
		}

		return array_merge( $packages, self::ATOMIC_ELEMENTS_PANEL_PACKAGES );
	}

	public static function get_experimental_data() {
		return [
			'name' => self::EXPERIMENT_NAME,
			'title' => esc_html__( 'Editor Sidebar', 'elementor' ),
			'description' => esc_html__( 'Editor sidebar with the relocated top bar controls.', 'elementor' ),
			'default' => Experiments_Manager::STATE_INACTIVE,
			'release_status' => Experiments_Manager::RELEASE_STATUS_DEV,
		];
	}

	public static function is_active(): bool {
		return Plugin::$instance->experiments->is_feature_active( self::EXPERIMENT_NAME );
	}
}
