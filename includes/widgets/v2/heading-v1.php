<?php

namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Widget_Heading_V1 extends Widget_Base_V2 {
	public function get_v2_controls() {
		return [
			'blabla' => 'blabla',
		];
	}

	public function get_icon() {
		return 'eicon-t-letter';
	}

	public function get_title() {
		return 'Heading V1.5';
	}

	public function get_name() {
		return 'heading-v1';
	}

	protected function render() {
		echo '<h2>' . 'Heading  V1' . '</h2>';
	}
}

