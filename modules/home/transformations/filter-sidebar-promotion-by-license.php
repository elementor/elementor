<?php
namespace elementor\modules\home\transformations;

use Elementor\Modules\Home\Transformations\Base\Transformations_Abstract;
use Elementor\Core\Common\Modules\Connect\Module as ConnectModule;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Filter_Sidebar_Promotion_By_License extends Transformations_Abstract {

	public function transform( array $home_screen_data ): array {
		$user_tier = $this->get_tier();

		$new_sidebar_promotion = array_filter( $home_screen_data['sidebar_promotion_variants'], function( $item ) use ( $user_tier ) {
			return $this->is_enabled( $item ) && $this->is_tier_acceptable( $item, $user_tier );
		});

		if ( empty( $new_sidebar_promotion ) ) {
			unset( $home_screen_data['sidebar_promotion_variants'] );

			return $home_screen_data;
		}

		$home_screen_data['sidebar_promotion_variants'] = reset( $new_sidebar_promotion );

		return $home_screen_data;
	}

	private function get_tier() {
		$license = Utils::has_pro() ? ConnectModule::ACCESS_TIER_PRO_LEGACY : ConnectModule::ACCESS_TIER_FREE;

		return apply_filters( 'elementor/admin/homescreen_promotion_tier', $license );
	}

	private function is_enabled( $item ) {
		return ! empty( $item['is_enabled'] ) && 'true' === $item['is_enabled'];
	}

	private function is_tier_acceptable( $item, $user_tier ) {
		return ! empty( $item['license'] ) && in_array( $user_tier, $item['license'] );
	}
}
