<?php

namespace Elementor\Core\Admin\EditorOneMenu\Interfaces;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

interface Menu_Item_Third_Level_Interface extends Menu_Item_Interface {

	public function get_icon(): string;

	public function has_children(): bool;
}
