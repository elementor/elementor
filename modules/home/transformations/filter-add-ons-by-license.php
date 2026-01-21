<?php
namespace Elementor\Modules\Home\Transformations;

use Elementor\Modules\Home\Transformations\Base\Transformations_Abstract;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Filter_Add_Ons_By_License extends Transformations_Abstract {

	public function transform( array $home_screen_data ): array {
		if ( ! isset( $home_screen_data['add_ons'] ) ) {
			return $home_screen_data;
		}

		$user_tier = $this->get_tier();
		$hide_section = $home_screen_data['add_ons']['hide_section'] ?? [];

		if ( in_array( $user_tier, $hide_section, true ) ) {
			unset( $home_screen_data['add_ons'] );
		}

		return $home_screen_data;
	}
}
