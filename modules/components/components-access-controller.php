<?php

namespace Elementor\Modules\Components;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Components_Access_Controller {
	const TIER_CORE = 'core';
	const TIER_EXPIRED = 'expired';
	const TIER_PRO = 'pro';

	public static function get_access_tier(): string {
		if ( ! class_exists( '\ElementorPro\License\API' ) ) {
			return self::TIER_CORE;
		}

		if ( \ElementorPro\License\API::is_license_active() ) {
			return self::TIER_PRO;
		}

		if ( \ElementorPro\License\API::is_license_expired() ) {
			return self::TIER_EXPIRED;
		}

		return self::TIER_CORE;
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
		return self::is_expired_or_pro_tier();
	}

	public static function can_add_to_page(): bool {
		return self::is_pro_tier();
	}

	public static function can_edit(): bool {
		return self::is_expired_or_pro_tier();
	}

	public static function can_lock(): bool {
		return self::is_expired_or_pro_tier();
	}
}
