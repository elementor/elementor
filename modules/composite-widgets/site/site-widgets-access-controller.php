<?php

namespace Elementor\Modules\CompositeWidgets\Site;

use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Site widgets are a Pro feature. Core only decides what shows: an active license inserts copies, an
 * expired one keeps them working, and without access they're not shown.
 * Elementor Pro answers through the filter, so a change in which license unlocks site widgets is a
 * Pro-only change; without Pro, Core's license helpers answer.
 */
class Site_Widgets_Access_Controller {
	const ACCESS_FILTER = 'elementor/composite-widgets/site-widgets/access';
	const ACCESS_ACTIVE = 'active';
	const ACCESS_EXPIRED = 'expired';
	const ACCESS_NONE = 'none';

	public static function can_add_to_page(): bool {
		return self::ACCESS_ACTIVE === self::get_access();
	}

	public static function can_display(): bool {
		return in_array( self::get_access(), [ self::ACCESS_ACTIVE, self::ACCESS_EXPIRED ], true );
	}

	public static function get_access(): string {
		return (string) apply_filters( self::ACCESS_FILTER, self::get_license_access() );
	}

	private static function get_license_access(): string {
		if ( Utils::is_license_active() ) {
			return self::ACCESS_ACTIVE;
		}

		return Utils::is_license_expired() ? self::ACCESS_EXPIRED : self::ACCESS_NONE;
	}
}
