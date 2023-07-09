<?php

namespace Elementor\ElementsV2\Widgets;

use Elementor\ElementsV2\Elements_Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Heading extends Base {

	public function get_name() {
		return 'heading';
	}

	protected function is_widget() {
		return true;
	}

	public function get_defaults() {
		return [
			'title' => '',
			'size' => '',
			'header_size' => 'h2',
			'link' => [
				'url' => '',
			],
		];
	}

	public function get_html() {
		$settings = $this->get_settings();

		if ( '' === $settings['title'] ) {
			return '';
		}

		$content = empty( $settings['link']['url'] )
			? $settings['title']
			: Elements_Utils::create_element( 'a', [ 'href' => $settings['link']['url'] ], [ $settings['title'] ] );

		$heading = Elements_Utils::create_element(
			$settings['header_size'],
			[
				'class' => Elements_Utils::classes( [
					'elementor-heading-title',
					! empty( $settings['size'] ) ? "elementor-size-{$settings['size']}" : null,
				] ),
			],
			[ $content ]
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
			[ $heading ]
		);
	}
}
