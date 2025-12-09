<?php

namespace Elementor\Core\Admin\Menu\Interfaces;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

interface Elementor_One_Menu_Item_With_Page {
	public function get_page_title();

	public function render();
}

