<?php

namespace Elementor\Core\Admin;


use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Button extends \Elementor\Core\Base\Module {

	private $options;

	public function __construct( $options ) {
		$this->options = $options;
	}

	static public function get_default_options(): array {
		return [
			'class' => 'e-button',
			'icon' => '',
			'new_tab' => false,
			'text' => '',
			'type' => '',
			'url' => '',
			'variant' => '',
		];
	}

	private function get_options( $option = false ) {
		if ( isset( $this->options[ $option ] ) && array_search( $option, $this->get_default_options()  ) ) {
			return $this->options[ $option ];
		}

		return $this->options;
	}

	public function print_button() {
		$default_options = $this->get_default_options();
		$options = $this->get_options();

		if ( empty( $options['text'] ) ) {
			return;
		}

		$html_tag = ! empty( $link ) ? 'a' : 'button';
		$icon = '';
		$attributes = [];

		if ( ! empty( $options['icon'] ) ) {
			$icon = '<i class="' . $options['icon'] . '"></i>';
		}

		$classes[] = $default_options['class'];

		if ( ! empty( $options['class'] ) ) {
			$classes[] = sanitize_html_class( $options['class'] );
		}

		if ( ! empty( $options['type'] ) ) {
			$classes[] = 'e-button--' . sanitize_html_class( $options['type'] );
		}

		if ( ! empty( $options['variant'] ) ) {
			$classes[] = 'e-button--' . sanitize_html_class( $options['variant'] );
		}

		if ( ! empty( $link ) ) {
			$attributes['href'] = $link;
			if ( isset( $options['new_tab'] ) ) {
				$attributes['target'] = "_blank";
			}
		}

		$attributes['class'] = $classes;

		$html = '<' . $html_tag . ' ' . Utils::render_html_attributes( $attributes ) . '>';
		$html .= $icon;
		$html .= '<span>' . sanitize_text_field( $options['text'] ) . '</span>';
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
