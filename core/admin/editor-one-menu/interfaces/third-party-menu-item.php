<?php

namespace Elementor\Core\Admin\EditorOneMenu\Interfaces;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

interface Third_Party_Menu_Item {

	public function get_id(): string;

	public function get_label(): string;

	public function get_capability(): string;

	public function get_target_url(): string;

	public function get_owner(): string;

	public function get_icon(): string;

	public function is_visible(): bool;
}
