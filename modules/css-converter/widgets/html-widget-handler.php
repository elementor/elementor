<?php
namespace Elementor\Modules\CssConverter\Widgets;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Html_Widget_Handler {
	public function handle( $element ) {
		$tag = isset( $element['tag'] ) ? $element['tag'] : null;
		$css = isset( $element['css'] ) ? $element['css'] : '';
		$children = isset( $element['children'] ) ? $element['children'] : [];

		return [
			'tag' => $tag,
			'widget' => 'html',
			'html' => [
				'css' => $css,
				'children' => $children,
			],
		];
	}
}
