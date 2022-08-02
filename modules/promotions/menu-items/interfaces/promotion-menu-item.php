<?php

namespace Elementor\Modules\Promotions\MenuItems\Interfaces;

use Elementor\Core\Admin\Menu\Interfaces\Renderable_Admin_Menu_Item;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

interface Promotion_Menu_Item extends Renderable_Admin_Menu_Item {
	public function image_url();

	public function promotion_title();

	public function promotion_description();

	public function cta_text();

	public function cta_url();
}
