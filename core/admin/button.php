<?php

namespace Elementor\Core\Admin;


use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Button extends \Elementor\Core\Base\Module {
	public function __construct() {

	}

	static public function get_default_options(): array {
		return [
			'callback' => '',
			'class' => 'e-button',
			'icon' => '',
			'new_tab' => false,
			'text' => '',
			'type' => '',
			'url' => '',
			'variant' => '',
		];
	}

	public function print_button( array $options ) {
		if ( empty( $options['text'] ) ) {
			return;
		}

		$html_tag = ! empty( $link ) ? 'a' : 'button';
		$icon = ! empty( $options['icon'] ) ? '<i class="' . $options['icon'] . '"></i>' : '';
		$attributes = [];

		$classes = [ '' ];

		if ( ! empty( $options['type'] ) ) {
			$classes[] = 'e-notice--' . sanitize_html_class( $options['type'] );
		}

		if ( ! empty( $options['variant'] ) ) {
			$classes[] = 'e-notice--' . sanitize_html_class( $options['variant'] );
		}

		if ( ! empty( $link ) ) {
			$attributes['href'] = $link;
			if ( isset( $options['new_tab'] ) ) {
				$attributes['target'] = "_blank";
			}
		}

		$attributes['class'] = $classes;

		$html = '<' . $html_tag . Utils::render_html_attributes( $attributes ) . '>';
		$html .= $icon;
		$html .= sanitize_text_field( $options['text'] );
		$html .= '</' . $html_tag . '>';

		echo $html;
	}

	/**
	 * @inheritDoc
	 */
	public function get_name() : string {
		return 'admin-button';
	}
}
