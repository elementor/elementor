<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Custom_Icon_Svg;

use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Availability {
	const FILTER_NAME = 'elementor/atomic-widgets/custom-icon-libraries/enabled';

	public static function is_enabled(): bool {
		return (bool) apply_filters( self::FILTER_NAME, Utils::is_license_active() );
	}
}
