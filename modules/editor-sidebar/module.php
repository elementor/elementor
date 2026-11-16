<?php

namespace Elementor\Modules\EditorSidebar;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\EditorOne\Module as EditorOneModule;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseModule {

	const EXPERIMENT_NAME = 'e_editor_sidebar';

	const PACKAGES = [
		'editor-sidebar',
	];

	public function __construct() {
		parent::__construct();

		if ( ! self::is_active() ) {
			return;
		}

		add_filter( 'elementor/editor/v2/packages', fn( $packages ) => array_merge( $packages, self::PACKAGES ) );
	}

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
		];
	}

	public static function is_active(): bool {
		return Plugin::$instance->experiments->is_feature_active( self::EXPERIMENT_NAME )
			&& EditorOneModule::is_editor_one_active();
	}
}
