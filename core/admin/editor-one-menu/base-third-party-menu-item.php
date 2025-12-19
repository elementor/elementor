<?php

namespace Elementor\Core\Admin\EditorOneMenu;

use Elementor\Core\Admin\EditorOneMenu\Interfaces\Third_Party_Menu_Item;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class Base_Third_Party_Menu_Item implements Third_Party_Menu_Item {

	public function is_visible(): bool {
		return current_user_can( $this->get_capability() );
	}

	public function get_icon(): string {
		return 'admin-plugins';
	}

	abstract public function get_id(): string;

	abstract public function get_label(): string;

	abstract public function get_capability(): string;

	abstract public function get_target_url(): string;

	abstract public function get_owner(): string;
}
