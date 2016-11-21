<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Control_Tabs extends Control_Base {

	public function get_type() {
		return 'tabs';
	}

	public function content_template() {}

	protected function get_default_settings() {
		return [
			'separator' => 'none',
		];
	}
}
