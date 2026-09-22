<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers;

use Elementor\Core\Page_Assets\Data_Managers\Font_Icon_Svg\Manager as Font_Icon_Svg_Data_Manager;
use Elementor\Core\Utils\Svg\Svg_Sanitizer;
use Elementor\Icons_Manager;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Svg\Atomic_Svg;
use Elementor\Modules\AtomicWidgets\Icon_Library_Editor_Config;
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

		$managed_icon = $this->transform_managed_icon( $icon );

		if ( '' !== $managed_icon['html'] ) {
			return $managed_icon;
		}

		return $this->transform_custom_library_icon( $icon );
	}

	private function transform_custom_library_icon( array $icon ): array {
		/**
		 * Filters inline SVG markup for a custom icon library value.
		 *
		 * @param string $html Sanitizable SVG markup. Default empty.
		 * @param array  $icon {
		 *     @type string $value   Saved icon class.
		 *     @type string $library Icon library key.
		 * }
		 */
		$html = apply_filters( 'elementor/atomic-widgets/icon/svg-html', '', $icon );

		if ( is_string( $html ) && '' !== $html ) {
			return [
				'html' => $this->process_svg( $html, self::SVG_INLINE_STYLES ),
				'url' => null,
			];
		}

		$library_svg = $this->fetch_registered_custom_library_svg( $icon );

		if ( $library_svg ) {
			return [
				'html' => $this->process_svg( $library_svg, self::SVG_INLINE_STYLES ),
				'url' => null,
			];
		}

		if ( $this->is_deleted_custom_icon_library( $icon ) ) {
			return $this->transform_default_svg();
		}

		return [
			'html' => '',
			'url' => null,
		];
	}

	private function fetch_registered_custom_library_svg( array $icon ): ?string {
		$tab = $this->get_registered_icon_library_tab( $icon['library'] );

		if ( ! $tab ) {
			return null;
		}

		$fetch_json = $tab['fetchJson'] ?? '';

		if ( ! is_string( $fetch_json ) || '' === $fetch_json ) {
			return null;
		}

		foreach ( $this->get_custom_icon_file_names( $icon['value'], $tab ) as $name ) {
			foreach ( $this->get_custom_icon_svg_urls( $fetch_json, $name ) as $url ) {
				$content = $this->read_svg_url( $url );

				if ( $content ) {
					return $content;
				}
			}
		}

		return null;
	}

	private function get_registered_icon_library_tab( string $library ): ?array {
		foreach ( Icons_Manager::get_icon_manager_tabs() as $name => $tab ) {
			if ( ! is_array( $tab ) ) {
				continue;
			}

			if ( $name === $library || ( $tab['name'] ?? '' ) === $library ) {
				return $tab;
			}
		}

		return null;
	}

	private function get_custom_icon_file_names( string $value, array $tab ): array {
		$prefix = is_string( $tab['prefix'] ?? null ) ? $tab['prefix'] : '';
		$display_prefix = is_string( $tab['displayPrefix'] ?? null ) ? $tab['displayPrefix'] : rtrim( $prefix, '-' );
		$remaining = trim( $value );
		$names = [ $remaining ];

		if ( '' !== $display_prefix && 0 === strpos( $remaining, $display_prefix . ' ' ) ) {
			$remaining = trim( substr( $remaining, strlen( $display_prefix ) + 1 ) );
			$names[] = $remaining;
		}

		if ( '' !== $prefix && 0 === strpos( $remaining, $prefix ) ) {
			$names[] = substr( $remaining, strlen( $prefix ) );
		} elseif ( '' !== $prefix ) {
			$names[] = $prefix . $remaining;
		}

		return array_values( array_unique( array_filter( $names ) ) );
	}

	private function get_custom_icon_svg_urls( string $fetch_json, string $name ): array {
		$directory = trailingslashit( dirname( $fetch_json ) );
		$encoded = rawurlencode( $name );

		return [
			$directory . $encoded . '.svg',
			$directory . 'svg/' . $encoded . '.svg',
		];
	}

	private function read_svg_url( string $url ): ?string {
		$local_path = $this->resolve_local_svg_path( $url );

		if ( $local_path ) {
			$content = Utils::file_get_contents( $local_path );

			return $content ? $content : null;
		}

		$response = wp_safe_remote_get( $url );

		if ( is_wp_error( $response ) || \WP_Http::OK !== (int) wp_remote_retrieve_response_code( $response ) ) {
			return null;
		}

		$body = wp_remote_retrieve_body( $response );

		return $body ? $body : null;
	}

	private function resolve_local_svg_path( string $url ): ?string {
		$site_url = site_url();

		if ( 0 !== strpos( $url, $site_url ) ) {
			return null;
		}

		$path = ABSPATH . ltrim( substr( $url, strlen( $site_url ) ), '/' );

		return file_exists( $path ) ? $path : null;
	}

	private function is_deleted_custom_icon_library( array $icon ): bool {
		$library = $icon['library'];
		$value = $icon['value'];

		if ( '' === $library || '' === $value ) {
			return false;
		}

		if ( false === strpos( $value, $library ) ) {
			return false;
		}

		if ( in_array( $library, Icon_Library_Editor_Config::SKIPPED_TAB_NAMES, true ) ) {
			return false;
		}

		if ( Font_Icon_Svg_Data_Manager::get_font_family( $library ) ) {
			return false;
		}

		return ! $this->get_registered_icon_library_tab( $library );
	}

	private function transform_default_svg(): array {
		return ( new Svg_Src_Transformer() )->transform(
			[
				'id' => null,
				'url' => Atomic_Svg::DEFAULT_SVG_URL,
			],
			Props_Resolver_Context::make()
		);
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
