<?php

namespace Elementor\Modules\ProSetupPromotion;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Dismissal {

	const USER_META_KEY = 'elementor_pro_setup_promotion_dismissed_at';

	const DISMISS_ID = 'pro_setup_panel_promotion';

	const COOLDOWN_SECONDS = 14 * DAY_IN_SECONDS;

	public static function is_within_cooldown(): bool {
		$dismissed_at = get_user_meta( get_current_user_id(), self::USER_META_KEY, true );

		if ( empty( $dismissed_at ) ) {
			return false;
		}

		$elapsed = time() - (int) $dismissed_at;

		return $elapsed < self::COOLDOWN_SECONDS;
	}

	public static function record_dismissal(): void {
		update_user_meta( get_current_user_id(), self::USER_META_KEY, time() );
	}
}
