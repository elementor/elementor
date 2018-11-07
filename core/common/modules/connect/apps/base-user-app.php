<?php
namespace Elementor\Core\Common\Modules\Connect\Apps;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Base_User_App extends Base_App {

	protected function update_settings() {
		update_user_meta( get_current_user_id(), $this->get_option_name(), $this->data );
	}

	protected function init_data() {
		$this->data = get_user_meta( get_current_user_id(), $this->get_option_name(), true );

		if ( ! $this->data ) {
			$this->data = [];
		}
	}
}
