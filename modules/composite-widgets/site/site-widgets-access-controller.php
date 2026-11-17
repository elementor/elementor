<?php

namespace Elementor\Modules\CompositeWidgets\Site;

use Elementor\Modules\Components\Components_Access_Controller;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Site widgets are a Pro feature with the same license tiers as Components. Core only decides what
 * shows without Pro: an active license inserts copies, an expired one keeps them working, and
 * without Pro (not installed, or no license) they're not shown.
 */
class Site_Widgets_Access_Controller {
	public static function can_add_to_page(): bool {
		return Components_Access_Controller::is_pro_tier();
	}

	public static function can_display(): bool {
		return Components_Access_Controller::is_expired_or_pro_tier();
	}
}
