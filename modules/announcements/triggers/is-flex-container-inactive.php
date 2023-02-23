<?php

namespace Elementor\Modules\Announcements\Triggers;

use Elementor\Modules\Announcements\Classes\Trigger_Base;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class IsFlexContainerInactive extends Trigger_Base {
	/**
	 * @var string
	 */
	protected string $name = 'is-flex-container-inactive';
	const USER_META_KEY = 'announcements_user_counter';

	/**
	 * @return int
	 */
	protected function get_view_count(): int {
		$user_counter = get_user_meta( get_current_user_id(), self::USER_META_KEY, true );

		return ! empty( $user_counter ) ? (int) $user_counter : 0;
	}

	/**
	 * @return void
	 */
	public function after_triggered(): void {
		$new_counter = $this->get_view_count() + 1;
		update_user_meta( get_current_user_id(), self::USER_META_KEY, $new_counter );
	}

	/**
	 * @return bool
	 */
	public function is_inactive(): bool {
		$is_feature_active = Plugin::$instance->experiments->is_feature_active( 'container' );
		$counter = (int) get_user_meta( get_current_user_id(), self::USER_META_KEY, true );

		return ! $is_feature_active && $counter < 1;
	}
}
