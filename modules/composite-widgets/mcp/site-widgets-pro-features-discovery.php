<?php

namespace Elementor\Modules\CompositeWidgets\Mcp;

use Elementor\Modules\CompositeWidgets\Site\Site_Widgets_Access_Controller;
use Elementor\Modules\Mcp\Module as Mcp_Module;
use Elementor\Modules\Mcp\Utils\Pro_Features_Discovery;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Site_Widgets_Pro_Features_Discovery {
	const UPGRADE_URL = Mcp_Module::MCP_PROMOTION_UPGRADE_URL;
	const PRO_FEATURE = 'site_widgets';
	const ACTION_ADD_TO_PAGE = 'add_to_page';

	public static function for_manage( string $action ): \WP_Error {
		return Pro_Features_Discovery::error(
			self::PRO_FEATURE,
			__( 'Saving and managing widgets on the site needs Elementor Pro, so nothing was changed. What Pro gives the user: the block saved once as a widget, placed on any page with the same structure and design, with its own simple content and style controls.', 'elementor' ),
			__( 'Free path: build the block with native widgets and a global class so the styling stays consistent. Tell the user each copy will be edited separately.', 'elementor' ),
			self::UPGRADE_URL,
			[
				'action' => $action,
				'access' => Site_Widgets_Access_Controller::get_access(),
			]
		);
	}

	public static function for_add_to_page(): \WP_Error {
		return Pro_Features_Discovery::error(
			self::PRO_FEATURE,
			__( 'Adding a saved site widget needs an active Elementor Pro license, so it was skipped. What Pro gives the user: the widgets saved on their site, placed on any page with the same structure and design.', 'elementor' ),
			__( 'Free path: build the block with native widgets and a global class so the styling stays consistent.', 'elementor' ),
			self::UPGRADE_URL,
			[
				'action' => self::ACTION_ADD_TO_PAGE,
				'access' => Site_Widgets_Access_Controller::get_access(),
			]
		);
	}
}
