<?php

namespace Elementor\Core\Config;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Site_Internal_Config_Base extends WP_Option_Base {

	public static function should_autoload(): bool {
		return false;
	}
}
