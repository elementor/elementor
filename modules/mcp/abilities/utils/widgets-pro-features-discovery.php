<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Modules\Mcp\Module as Mcp_Module;
use Elementor\Modules\Mcp\Utils\Pro_Features_Discovery;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Widgets_Pro_Features_Discovery {

	const UPGRADE_URL = Mcp_Module::MCP_PROMOTION_UPGRADE_URL;

	public static function for_widget( string $widget_type ): \WP_Error {
		return Pro_Features_Discovery::error(
			sprintf(
				/* translators: %s: widget type. */
				__( 'The %1$s widget needs Elementor Pro, which isn\'t installed, so it was not added. What Pro gives the user: the %1$s widget ready to use, styled like the rest of the site.', 'elementor' ),
				$widget_type
			),
			__( 'Free path: build the closest result with native Free widgets if one fits the request; otherwise say plainly that Free can\'t do this.', 'elementor' ),
			self::UPGRADE_URL,
			[ 'widget_type' => $widget_type ]
		);
	}
}
