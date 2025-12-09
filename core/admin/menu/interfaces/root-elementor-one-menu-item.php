<?php

namespace Elementor\Core\Admin\Menu\Interfaces;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

interface Root_Elementor_One_Menu_Item {
	public function get_capability();

	public function get_label();

	public function get_icon_url();

	public function get_position();

	public function is_visible();
}

