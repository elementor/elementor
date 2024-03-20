<?php
namespace Elementor\Modules\Home\Transformations;

use Elementor\Modules\Home\Transformations\Base\Transformations_Abstract;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Remove_Sidebar_Upgrade_For_Pro_Users extends Transformations_Abstract {

	public function transform(): array {
		if ( $this->isPro() ) {
			unset( $this->home_screen_data['sidebar_upgrade'] );
		}

		return $this->home_screen_data;
	}

	public function isPro(): bool {
		return Utils::has_pro();
	}
}
