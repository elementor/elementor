<?php

namespace Elementor\ElementsV2\Widgets;

use Elementor\ElementsV2\Elements_Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Button extends Base {

	public function get_name() {
		return 'button';
	}

	protected function is_widget() {
		return true;
	}

	public function get_defaults() {
		return [
			'text' => '',
			'size' => '',
			'shape' => '',
			'effect' => '',
			'button_type' => 'primary',
			'link' => [
				'url' => '',
				'is_external' => false,
				'nofollow' => false,
			],
		];
	}

	public function get_html() {
		$settings = $this->get_settings();

		$text_content = Elements_Utils::create_element(
			'span',
			[ 'class' => 'elementor-button-content-wrapper' ],
			[
				Elements_Utils::create_element(
					'span',
					[ 'class' => 'elementor-button-text' ],
					[ $settings['text'] ]
				),
			]
		);

		$link = Elements_Utils::create_element(
			'a',
			[
				'class' => Elements_Utils::classes( [
					'elementor-button',
					'elementor-size-' . $settings['size'],
					'elementor-shape-' . $settings['shape'],
					'elementor-effect-' . $settings['effect'],
					'elementor-button-' . $settings['button_type'],
				] ),
				'href' => $settings['link']['url'],
				'target' => $settings['link']['is_external'] ? '_blank' : '_self',
				'rel' => $settings['link']['nofollow'] ? 'nofollow' : null,
			],
			[ $text_content ]
		);

		return Elements_Utils::create_element(
			'div',
			[
				'class' => Elements_Utils::classes( [
					'elementor-element',
					'elementor-element-' . $this->get_id(),
					'elementor-widget',
					'elementor-widget-' . $this->get_name(),
				] ),
				'data-id' => $this->get_id(),
				'data-element_type' => 'widget',
				'data-widget_type' => "{$this->get_name()}.default",
			],
			[
				Elements_Utils::create_element(
					'div',
					[ 'class' => 'elementor-button-wrapper' ],
					[ $link ]
				),
			]
		);
	}
}
