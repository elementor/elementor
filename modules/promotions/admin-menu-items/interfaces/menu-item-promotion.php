<?php

namespace Elementor\Modules\Promotions\AdminMenuItems\Interfaces;

use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_With_Page;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

interface Menu_Item_Promotion extends Admin_Menu_Item_With_Page {
	public function get_promotion_title();

	public function set_list();

	public function get_cta_text();

	public function get_cta_url();

	public function get_video_url();
}
