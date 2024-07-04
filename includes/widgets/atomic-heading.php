<?php

namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Widget_Atomic_Heading extends Atomic_Widget_Base {
	public function get_icon() {
		return 'eicon-t-letter';
	}

	public function get_title() {
		return 'Atomic Heading';
	}

	public function get_name() {
		return 'a-heading';
	}

	protected function render() {
		$tag = $this->get_settings()['tag'] ?? 'h2';
		$content = $this->get_settings()['title'] ?? 'Hello, World!';

		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		echo "<$tag>$content</$tag>";
	}

	public function get_atomic_controls(): array {
		return [];
	}
}
