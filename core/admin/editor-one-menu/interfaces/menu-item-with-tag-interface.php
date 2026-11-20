<?php

namespace Elementor\Core\Admin\EditorOneMenu\Interfaces;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

interface Menu_Item_With_Tag_Interface {

	public function get_tag(): string;
}
