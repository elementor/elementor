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

	static public function get_default_options() {
		return [
			'callback' => '',
			'class' => 'e-button',
			'icon_classes' => '',
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
		$options = $this->get_options();

		if ( empty( $options['text'] ) ) {
			return;
		}

		$html_tag = ! empty( $link ) ? 'a' : 'button';
		$icon = '';
		$attributes = [];

		if ( ! empty( $options['icon_classes'] ) ) {
			$icon = '<i class="' . $options['icon_classes'] . '"></i>';
		}

		$classes = ['e-button'];

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
