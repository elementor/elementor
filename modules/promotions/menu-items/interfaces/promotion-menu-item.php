<?php

namespace Elementor\Modules\Promotions\MenuItems\Interfaces;

use Elementor\Core\Admin\Menu\Interfaces\Renderable_Admin_Menu_Item;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

interface Promotion_Menu_Item extends Renderable_Admin_Menu_Item {
	public function get_image_url();

	public function get_promotion_title();

	public function render_promotion_description();

	public function get_cta_text();

	public function get_cta_url();
}
