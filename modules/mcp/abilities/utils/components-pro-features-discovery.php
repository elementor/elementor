<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Modules\Components\Components_Access_Controller;
use Elementor\Modules\Components\Widgets\Component_Instance;
use Elementor\Modules\Mcp\Utils\Pro_Features_Discovery;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Components_Pro_Features_Discovery implements Widget_Pro_Features_Discovery {

	const UPGRADE_URL = 'https://go.elementor.com/go-pro-mcp-upgrade-components/';

	const ACTION_ADD_TO_PAGE = 'add_to_page';

	public static function supports_widget( string $widget_type ): bool {
		return Component_Instance::get_element_type() === $widget_type && ! Components_Access_Controller::can_add_to_page();
	}

	public static function for_widget(): \WP_Error {
		return self::for_action( self::ACTION_ADD_TO_PAGE );
	}

	public static function for_action( string $action ): \WP_Error {
		return Pro_Features_Discovery::error(
			__( 'Creating components needs Elementor Pro, so nothing was changed. What Pro gives the user: this block becomes a reusable component. They can place it on any page, change its content per instance, and update the design once for all copies.', 'elementor' ),
			__( 'Free path: build the block with native widgets and a global class so the styling stays consistent. Tell the user each copy will be edited separately.', 'elementor' ),
			self::UPGRADE_URL,
			[
				'action' => $action,
				'tier' => Components_Access_Controller::get_access_tier(),
			]
		);
	}
}
