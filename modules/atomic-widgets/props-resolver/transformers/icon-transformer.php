<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers;

use Elementor\Core\Page_Assets\Data_Managers\Font_Icon_Svg\Manager as Font_Icon_Svg_Data_Manager;
use Elementor\Core\Utils\Svg\Svg_Sanitizer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Icon_Transformer extends Transformer_Base {
	const SVG_INLINE_STYLES = 'width: 100%; height: 100%; overflow: unset;';

	public function transform( $value, Props_Resolver_Context $context ) {
		$icon = [
			'value' => $value['value'] ?? '',
			'library' => $value['library'] ?? '',
		];

		$icon['font_family'] = Font_Icon_Svg_Data_Manager::get_font_family( $icon['library'] );

		if ( ! $icon['font_family'] ) {
			return [
				'html' => '',
				'url' => null,
			];
		}

		$icon_data = Font_Icon_Svg_Data_Manager::get_font_icon_svg_data( $icon );
		$html = $this->build_svg( $icon_data );

		return [
			'html' => $html,
			'url' => null,
		];
	}

	private function build_svg( $icon_data ): string {
		if ( empty( $icon_data['path'] ) ) {
			return '';
		}

		$attributes = [
			'viewBox' => '0 0 ' . $icon_data['width'] . ' ' . $icon_data['height'],
			'xmlns' => 'http://www.w3.org/2000/svg',
		];

		$svg = '<svg ' . Utils::render_html_attributes( $attributes ) . '>' .
			'<path d="' . esc_attr( $icon_data['path'] ) . '"></path>' .
			'</svg>';

		return $this->process_svg( $svg );
	}

	private function process_svg( string $content ): string {
		$svg = new \WP_HTML_Tag_Processor( $content );

		if ( ! $svg->next_tag( 'svg' ) ) {
			return '';
		}

		$svg->set_attribute( 'fill', 'currentColor' );
		$this->merge_inline_styles( $svg );

		return ( new Svg_Sanitizer() )->sanitize( $svg->get_updated_html() );
	}

	private function merge_inline_styles( \WP_HTML_Tag_Processor $svg ): void {
		$existing = trim( (string) $svg->get_attribute( 'style' ) );

		$merged = empty( $existing )
			? self::SVG_INLINE_STYLES
			: rtrim( $existing, ';' ) . '; ' . self::SVG_INLINE_STYLES;

		$svg->set_attribute( 'style', $merged );
	}
}
