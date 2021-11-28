<?php

namespace Elementor\Core\Options;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Current_User_Option extends User_Option {

	public static function set_current_user() {
		static::$user_id = get_current_user_id();
	}
}
