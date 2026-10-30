<?php

namespace Elementor\Modules\ProSetupPromotion;

use Elementor\Core\Base\Module as Base_Module;
use Elementor\Core\Utils\Promotions\Filtered_Promotions_Manager;
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
		add_filter( Filtered_Promotions_Manager::EDITOR_PANEL_STICKY_FILTER, [ $this, 'suppress_sticky_upgrade_promotion' ], 20 );
		add_filter( 'elementor/navigator/custom_promotion', [ $this, 'suppress_navigator_upgrade_promotion' ], 20 );
		add_filter( 'elementor/notice-bar/custom_promotion', [ $this, 'suppress_notice_bar_upgrade_promotion' ], 20 );
	}

	public function add_editor_config( array $settings ): array {
		$config = Setup_State::get_editor_config();

		if ( null === $config ) {
			return $settings;
		}

		$settings['proSetupPromotion'] = $config;

		if ( Setup_State::should_suppress_upgrade_promotions() ) {
			$settings['editingPanelStickyPromotion'] = null;
		}

		return $settings;
	}

	public function suppress_sticky_upgrade_promotion( array $promotion_data ): array {
		if ( ! Setup_State::should_suppress_upgrade_promotions() ) {
			return $promotion_data;
		}

		return [
			'url' => '',
			'message' => '',
			'button_text' => '',
		];
	}

	public function suppress_navigator_upgrade_promotion( array $promotion_data ): array {
		if ( ! Setup_State::should_suppress_upgrade_promotions() ) {
			return $promotion_data;
		}

		return [
			'text' => '',
			'url_label' => '',
			'url' => '',
		];
	}

	public function suppress_notice_bar_upgrade_promotion( array $promotion_data ): array {
		if ( ! Setup_State::should_suppress_upgrade_promotions() ) {
			return $promotion_data;
		}

		return [
			'description' => '',
			'upgrade_text' => '',
			'upgrade_url' => '',
		];
	}
}
