<?php

namespace Elementor\Modules\EditorOne\Classes;

use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item;
use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_Has_Position;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

interface Elementor_One_Menu_Item_Fourth_Level extends Admin_Menu_Item, Admin_Menu_Item_Has_Position {
	public function get_parent_slug();
}