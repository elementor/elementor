<?php

namespace Elementor\Core\Admin\Menu\Interfaces;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

interface Renderable_Admin_Menu_Item extends Admin_Menu_Item {
	public function callback();
}
