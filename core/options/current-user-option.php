<?php

namespace Elementor\Core\Options;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Current_User_Option extends User_Option {
	public function __construct() {
		parent::__construct( wp_get_current_user()->ID );
	}
}
