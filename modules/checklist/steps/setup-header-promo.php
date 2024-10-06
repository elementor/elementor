<?php

namespace Elementor\Modules\Checklist\Steps;

use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Setup_Header_Promo extends Setup_Header {
	public function is_visible() : bool {
		if ( Utils::has_pro() ) {
			return false;
		}

		return parent::is_visible();
	}
}
