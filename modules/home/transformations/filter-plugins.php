<?php
namespace Elementor\Modules\Home\Transformations;

use Elementor\Modules\Home\Transformations\Base\Transformations_Abstract;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Filter_Plugins extends Transformations_Abstract {

	public function transform( array $home_screen_data ): array {
		return $home_screen_data;
	}
}
