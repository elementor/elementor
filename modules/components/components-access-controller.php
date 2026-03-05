<?php

namespace Elementor\Modules\Components;

use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Components_Access_Controller {
	const TIER_CORE = 'core';
	const TIER_EXPIRED = 'expired';
	const TIER_PRO = 'pro';

	public static function get_access_tier(): string {
		if ( ! Utils::has_pro() ) {
			return self::TIER_CORE;
		}

		return apply_filters( 'elementor/components/access_tier', self::TIER_CORE );
	}

	public static function is_pro_tier(): bool {
		return self::TIER_PRO === self::get_access_tier();
	}

	public static function is_expired_or_pro_tier(): bool {
		$tier = self::get_access_tier();

		return self::TIER_EXPIRED === $tier || self::TIER_PRO === $tier;
	}

	public static function can_create(): bool {
		return self::is_pro_tier();
	}

	public static function can_delete(): bool {
		return self::is_pro_tier();
	}

	public static function can_rename(): bool {
		return self::is_pro_tier();
	}

	public static function can_publish(): bool {
		return self::is_pro_tier();
	}

	public static function can_add_to_page(): bool {
		return self::is_pro_tier();
	}

	public static function can_edit_source(): bool {
		return self::is_expired_or_pro_tier();
	}

	public static function can_add_overrides(): bool {
		return self::is_expired_or_pro_tier();
	}

	public static function can_lock(): bool {
		return self::is_expired_or_pro_tier();
	}
}
