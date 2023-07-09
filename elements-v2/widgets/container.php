<?php

namespace Elementor\ElementsV2\Widgets;

use Elementor\ElementsV2\Elements_Utils;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Container extends Base {

	public function get_name() {
		return 'container';
	}

	public function get_defaults() {
		return [
			'html_tag' => 'div',
			'content_width' => 'boxed',
			'container_type' => 'flex',
			'link' => [
				'url' => '',
			],
		];
	}

	public function get_html() {
		$settings = $this->get_settings();

		$children = $this->get_children_html();

		if ( 'boxed' === $settings['content_width'] ) {
			$children = [
				Elements_Utils::create_element( 'div', [ 'class' => 'e-con-inner' ], $children ),
			];
		}

		return Elements_Utils::create_element(
			$settings['html_tag'],
			[
				'class' => Elements_Utils::classes( [
					'e-con',
					'elementor-element',
					'elementor-element-' . $this->get_id(),
					! empty( $settings['link']['url'] ) ? 'e-con-link' : null,
					! empty( $settings['content_width'] ) ? 'e-con-' . $settings['content_width'] : null,
					! empty( $settings['container_type'] ) ? 'e-' . $settings['container_type'] : null,
				] ),
				'data-id' => $this->get_id(),
				'data-element_type' => 'container',
				'href' => $settings['link']['url'] ?? null,
			],
			$children
		);
	}
}
