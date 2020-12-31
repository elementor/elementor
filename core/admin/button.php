<?php

namespace Elementor\Core\Admin;


use Elementor\Core\Base\Base_Object;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Button extends Base_Object {

	private $options;

	public function __construct( array $options ) {
		$this->options = $this->merge_properties( $this->get_default_options(), $options );
	}

	/**
	 * @return array
	 */
	private function get_default_options() {
		return [
			'class' => [ 'e-button' ],
			'icon' => '',
			'new_tab' => false,
			'text' => '',
			'type' => '',
			'url' => '',
			'variant' => '',
		];
	}

	/**
	 * @param string $option Optional default is null
	 * @return array|mixed
	 */
	private function get_options( $option = null ) {
		return $this->get_items( $this->options, $option );
	}

	public function print_button() {
		$options = $this->get_options();

		if ( empty( $options['text'] ) ) {
			return;
		}

		$html_tag = ! empty( $options['link'] ) ? 'a' : 'button';
		$icon = '';
		$attributes = [];

		if ( ! empty( $options['icon'] ) ) {
			$icon = '<i class="' . $options['icon'] . '"></i>';
		}

		$classes[] = $options['class'];

		if ( ! empty( $options['type'] ) ) {
			$classes[] = 'e-button--' . $options['type'];
		}

		if ( ! empty( $options['variant'] ) ) {
			$classes[] = 'e-button--' . $options['variant'];
		}

		if ( ! empty( $options['link'] ) ) {
			$attributes['href'] = $options['link'];
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
	public function get_name() {
		return 'admin-button';
	}
}
