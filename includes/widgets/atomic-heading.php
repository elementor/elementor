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
		return esc_html__( 'Atomic Heading', 'elementor' );
	}

	public function get_name() {
		return 'a-heading';
	}

	protected function render() {
		$tag = $this->get_settings( 'tag' ) ?? 'h2';
		$title = $this->get_settings( 'title' ) ?? 'Hello, World!';

		$escaped_tag = Utils::validate_html_tag( $tag );
		$escaped_title = esc_html( $title );

		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		echo "<$escaped_tag>$escaped_title</$escaped_tag>";
	}

	public function get_atomic_controls(): array {
		return [];
	}
}
