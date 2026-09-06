<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers;

use Elementor\Core\Page_Assets\Data_Managers\Font_Icon_Svg\Manager as Font_Icon_Svg_Data_Manager;
use Elementor\Core\Utils\Svg\Svg_Sanitizer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Font_Awesome_7_Icon_Resolver;
use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Icon_Transformer extends Transformer_Base {
	const SVG_INLINE_STYLES = 'width: 100%; height: 100%; overflow: unset;';

	const FA7_SVG_INLINE_STYLES = 'width: 100%; height: 100%; overflow: visible;';

	public function transform( $value, Props_Resolver_Context $context ) {
		$icon = [
			'value' => $value['value'] ?? '',
			'library' => $value['library'] ?? '',
		];

		if ( Font_Awesome_7_Icon_Resolver::is_supported_library( $icon['library'] ) ) {
			return $this->transform_font_awesome_7( $icon );
		}

		return $this->transform_managed_icon( $icon );
	}

	private function transform_font_awesome_7( array $icon ): array {
		$icon_data = Font_Awesome_7_Icon_Resolver::resolve( $icon['value'], $icon['library'] );

		if ( ! $icon_data || empty( $icon_data['paths'] ) ) {
			return [
				'html' => '',
				'url' => null,
			];
		}

		return [
			'html' => $this->build_fa7_svg( $icon_data ),
			'url' => null,
		];
	}

	private function transform_managed_icon( array $icon ): array {
		$icon['font_family'] = Font_Icon_Svg_Data_Manager::get_font_family( $icon['library'] );

		if ( ! $icon['font_family'] ) {
			return [
				'html' => '',
				'url' => null,
			];
		}

		$icon_data = Font_Icon_Svg_Data_Manager::get_font_icon_svg_data( $icon );

		return [
			'html' => $this->build_managed_svg( $icon_data ),
			'url' => null,
		];
	}

	private function build_fa7_svg( array $icon_data ): string {
		$attributes = [
			'viewBox' => '0 0 ' . $icon_data['width'] . ' ' . $icon_data['height'],
			'xmlns' => 'http://www.w3.org/2000/svg',
			'aria-hidden' => 'true',
		];

		$paths_markup = '';

		foreach ( $icon_data['paths'] as $path ) {
			$paths_markup .= '<path d="' . esc_attr( $path ) . '"></path>';
		}

		$svg = '<svg ' . Utils::render_html_attributes( $attributes ) . '>' . $paths_markup . '</svg>';

		return $this->process_svg( $svg, self::FA7_SVG_INLINE_STYLES );
	}

	private function build_managed_svg( $icon_data ): string {
		if ( empty( $icon_data['path'] ) ) {
			return '';
		}

		$paths = is_array( $icon_data['path'] ) ? $icon_data['path'] : [ $icon_data['path'] ];

		$attributes = [
			'viewBox' => '0 0 ' . $icon_data['width'] . ' ' . $icon_data['height'],
			'xmlns' => 'http://www.w3.org/2000/svg',
		];

		$paths_markup = '';

		foreach ( $paths as $path ) {
			if ( ! is_string( $path ) || '' === $path ) {
				continue;
			}

			$paths_markup .= '<path d="' . esc_attr( $path ) . '"></path>';
		}

		if ( '' === $paths_markup ) {
			return '';
		}

		$svg = '<svg ' . Utils::render_html_attributes( $attributes ) . '>' . $paths_markup . '</svg>';

		return $this->process_svg( $svg, self::SVG_INLINE_STYLES );
	}

	private function process_svg( string $content, string $inline_styles ): string {
		$svg = new \WP_HTML_Tag_Processor( $content );

		if ( ! $svg->next_tag( 'svg' ) ) {
			return '';
		}

		$svg->set_attribute( 'fill', 'currentColor' );
		$this->merge_inline_styles( $svg, $inline_styles );

		return ( new Svg_Sanitizer() )->sanitize( $svg->get_updated_html() );
	}

	private function merge_inline_styles( \WP_HTML_Tag_Processor $svg, string $inline_styles ): void {
		$existing = trim( (string) $svg->get_attribute( 'style' ) );

		$merged = empty( $existing )
			? $inline_styles
			: rtrim( $existing, ';' ) . '; ' . $inline_styles;

		$svg->set_attribute( 'style', $merged );
	}
}
