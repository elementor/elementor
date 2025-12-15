<?php

namespace Elementor\Core\Admin\Menu\Interfaces;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

interface Flyout_Editor_Elementor_One_Menu_Item {
	public function get_capability();

	public function get_label();

	public function get_parent_slug();

	public function is_visible();
}

