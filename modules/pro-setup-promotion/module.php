<?php

namespace Elementor\Modules\ProSetupPromotion;

use Elementor\Core\Base\Module as Base_Module;
use Elementor\Modules\ProSetupPromotion\Data\Controller;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends Base_Module {

	public function get_name() {
		return 'pro-setup-promotion';
	}

	public static function is_active() {
		return true;
	}

	public function __construct() {
		parent::__construct();

		Plugin::$instance->data_manager_v2->register_controller( new Controller() );

		add_filter( 'elementor/editor/localize_settings', [ $this, 'add_editor_config' ], 150 );
	}

	public function add_editor_config( array $settings ): array {
		$config = Setup_State::get_editor_config();

		if ( null === $config ) {
			return $settings;
		}

		$settings['proSetupPromotion'] = $config;

		return $settings;
	}
}
