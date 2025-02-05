<?php
namespace elementor\modules\home\transformations;

use Elementor\Modules\Home\Transformations\Base\Transformations_Abstract;
use Elementor\Core\Common\Modules\Connect\Module as ConnectModule;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Filter_Sidebar_Upgrade_By_License extends Transformations_Abstract {

	public function transform( array $home_screen_data ): array {
		$user_tier = $this->get_tier();

		$new_sidebar_upgrade = array_filter( $home_screen_data['sidebar_upgrade'], function( $item ) use ( $user_tier ) {
			return $this->is_enabled( $item ) && $this->is_tier_acceptable( $item, $user_tier );
		});

		if ( empty( $new_sidebar_upgrade ) ) {
			unset( $home_screen_data['sidebar_upgrade'] );

			return $home_screen_data;
		}

		$home_screen_data['sidebar_upgrade'] = reset( $new_sidebar_upgrade );

		return $home_screen_data;
	}

	private function get_tier() {
		$license = Utils::has_pro();

		if ( ! $license ) {
			return ConnectModule::ACCESS_TIER_FREE;
		}

		return apply_filters( 'elementor/admin/homescreen_promotion_tier', ConnectModule::ACCESS_TIER_PRO_LEGACY );
	}

	private function is_enabled( $item ) {
		return ! empty( $item['is_enabled'] ) && 'true' === $item['is_enabled'];
	}

	private function is_tier_acceptable( $item, $user_tier ) {
		return ! empty( $item['license'] ) && in_array( $user_tier, $item['license'] );
	}
}
