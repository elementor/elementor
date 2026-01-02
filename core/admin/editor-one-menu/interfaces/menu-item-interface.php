<?php

namespace Elementor\Core\Admin\EditorOneMenu\Interfaces;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

interface Menu_Item_Interface {

	public function get_capability(): string;

	public function get_label(): string;

	public function get_parent_slug(): string;

	public function is_visible(): bool;

	public function get_position(): int;

	public function get_slug(): string;

	public function get_group_id(): string;
}
