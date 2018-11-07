<?php
namespace Elementor\Core\Common\Modules\Connect\Apps;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Common_App extends Base_User_App {

	protected static $common_data = null;

	public function get_option_name() {
		return static::OPTION_NAME_PREFIX . 'common_data';
	}

	protected function init_data() {
		if ( is_null( self::$common_data ) ) {
			self::$common_data = get_user_meta( get_current_user_id(), static::get_option_name(), true );

			if ( ! self::$common_data ) {
				self::$common_data = [];
			};
		}

		$this->data = & self::$common_data;
	}
}
