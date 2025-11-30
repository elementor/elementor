<?php

namespace Elementor\Core\Admin\Menu\Interfaces;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

interface Admin_Menu_Item_With_Children extends Admin_Menu_Item {

	public function get_children_group_id();
}

