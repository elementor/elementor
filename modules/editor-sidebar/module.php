<?php

namespace Elementor\Modules\EditorSidebar;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseModule {

	const EXPERIMENT_NAME = 'e_editor_sidebar';

	public function get_name(): string {
		return 'editor-sidebar';
	}

	public static function get_experimental_data() {
		return [
			'name' => self::EXPERIMENT_NAME,
			'title' => esc_html__( 'Editor Sidebar', 'elementor' ),
			'description' => esc_html__( 'Editor sidebar with the relocated top bar controls.', 'elementor' ),
			'default' => Experiments_Manager::STATE_INACTIVE,
			'release_status' => Experiments_Manager::RELEASE_STATUS_DEV,
			'hidden' => true,
		];
	}

	public static function is_active(): bool {
		return Plugin::$instance->experiments->is_feature_active( self::EXPERIMENT_NAME );
	}
}
