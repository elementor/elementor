<?php

namespace Elementor\Modules\EditorOne\Classes\Menu;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

interface Menu_Item_Interface {

	public function get_capability();

	public function get_label();

	public function get_parent_slug();

	public function is_visible();

	public function get_position();

	public function get_slug();

	public function get_group_id();
}
