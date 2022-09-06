<?php

namespace Elementor\Modules\Promotions;

use Elementor\Core\Base\Module as Base_Module;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends Base_Module {

	public static function is_active() {
		return ! Utils::has_pro();
	}

	public function get_name() {
		return 'promotions';
	}
}
