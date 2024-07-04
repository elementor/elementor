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
		return [
			Atomic_Control::bind_to( 'tag' )
				->set_label( __( 'Tag', 'elementor' ) )
				->set_type( Select_Control::KEY )
				->set_props( Select_Control::make()
					->set_options([
						'h1' => 'H1',
						'h2' => 'H2',
						'h3' => 'H3',
						'h4' => 'H4',
						'h5' => 'H5',
						'h6' => 'H6',
					])
					->get_props()
				),
			Atomic_Control::bind_to( 'title' )
				->set_label( __( 'Title', 'elementor' ) )
				->set_type( Text_Control::KEY )
				->set_props( Text_Control::make()
					->set_placeholder( __( 'Enter your heading text', 'elementor' ) )
					->get_props()
				),
		];
	}
}
