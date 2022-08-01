<?php

namespace Elementor\Core\Admin\Menu\Interfaces;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

interface Admin_Menu_Item {
	public function is_visible();

	public function parent_slug();

	public function label();

	public function page_title();

	public function position();

	public function capability();

	public function callback();
}
