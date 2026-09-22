<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver;

use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Custom_Icon_Library_Svg_Resolver {
	const DEFAULT_UNITS_PER_EM = 1000;

	public function resolve( array $icon, array $tab ): ?string {
		$names = $this->get_icon_names( $icon['value'] ?? '', $tab );
		$directory_urls = $this->get_directory_urls( $tab );

		foreach ( $directory_urls as $directory ) {
			$from_config = $this->resolve_from_config( $directory, $names );

			if ( $from_config ) {
				return $from_config;
			}
		}

		$css_url = is_string( $tab['url'] ?? null ) ? $tab['url'] : '';

		if ( '' === $css_url && ! empty( $tab['enqueue'][0] ) && is_string( $tab['enqueue'][0] ) ) {
			$css_url = $tab['enqueue'][0];
		}

		if ( '' === $css_url ) {
			return null;
		}

		return $this->resolve_from_svg_font( $css_url, $names, is_string( $tab['prefix'] ?? null ) ? $tab['prefix'] : '' );
	}

	private function get_directory_urls( array $tab ): array {
		$sources = [];

		if ( ! empty( $tab['fetchJson'] ) && is_string( $tab['fetchJson'] ) ) {
			$sources[] = $tab['fetchJson'];
		}

		if ( ! empty( $tab['url'] ) && is_string( $tab['url'] ) ) {
			$sources[] = $tab['url'];
		}

		$directories = [];

		foreach ( $sources as $source ) {
			$directories[] = trailingslashit( dirname( $source ) );
		}

		$post_id = isset( $tab['custom_icon_post_id'] ) ? (int) $tab['custom_icon_post_id'] : 0;

		if ( $post_id ) {
			$upload_dir = wp_upload_dir();
			$upload_base = trailingslashit( $upload_dir['baseurl'] ) . 'elementor/custom-icons/';
			$directories[] = $upload_base . $post_id . '/';

			$library_name = $tab['name'] ?? '';
			if ( '' !== $library_name ) {
				$directories[] = $upload_base . $library_name . '/';
			}
		}

		return array_values( array_unique( array_filter( $directories ) ) );
	}

	private function get_icon_names( string $value, array $tab ): array {
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

	private function resolve_from_config( string $directory, array $names ): ?string {
		foreach ( [ 'config.json', 'selection.json' ] as $file ) {
			$payload = $this->read_json( $directory . $file );

			if ( ! $payload ) {
				continue;
			}

			$svg = $this->build_svg_from_config( $payload, $names );

			if ( $svg ) {
				return $svg;
			}
		}

		return null;
	}

	private function build_svg_from_config( array $payload, array $names ): ?string {
		$units = isset( $payload['units_per_em'] ) && is_numeric( $payload['units_per_em'] )
			? (int) $payload['units_per_em']
			: self::DEFAULT_UNITS_PER_EM;

		if ( ! empty( $payload['glyphs'] ) && is_array( $payload['glyphs'] ) ) {
			foreach ( $payload['glyphs'] as $glyph ) {
				if ( ! is_array( $glyph ) || empty( $glyph['css'] ) || ! in_array( $glyph['css'], $names, true ) ) {
					continue;
				}

				$path = $glyph['svg']['path'] ?? '';

				if ( ! is_string( $path ) || '' === $path ) {
					continue;
				}

				$width = isset( $glyph['svg']['width'] ) && is_numeric( $glyph['svg']['width'] )
					? (int) $glyph['svg']['width']
					: $units;

				return $this->build_svg( [ $path ], $width, $units );
			}
		}

		if ( ! empty( $payload['icons'] ) && is_array( $payload['icons'] ) ) {
			foreach ( $payload['icons'] as $icon ) {
				$name = $icon['properties']['name'] ?? '';

				if ( ! is_string( $name ) || ! in_array( $name, $names, true ) ) {
					continue;
				}

				$paths = $icon['icon']['paths'] ?? [];

				if ( ! is_array( $paths ) || empty( $paths ) ) {
					continue;
				}

				$width = isset( $icon['icon']['width'] ) && is_numeric( $icon['icon']['width'] )
					? (int) $icon['icon']['width']
					: $units;

				return $this->build_svg( $paths, $width, $units );
			}
		}

		return null;
	}

	private function resolve_from_svg_font( string $css_url, array $names, string $prefix ): ?string {
		$css = $this->read_text( $css_url );

		if ( ! $css ) {
			return null;
		}

		$unicode_by_class = $this->parse_css_unicode_map( $css, $prefix );
		$svg_font_urls = $this->get_svg_font_urls( $css_url, $css );

		foreach ( $svg_font_urls as $svg_url ) {
			$svg_font = $this->read_text( $svg_url );

			if ( ! $svg_font ) {
				continue;
			}

			$markup = $this->glyph_from_svg_font( $svg_font, $names, $unicode_by_class );

			if ( $markup ) {
				return $markup;
			}
		}

		return null;
	}

	private function parse_css_unicode_map( string $css, string $prefix ): array {
		$map = [];

		if ( ! preg_match_all( '/\.([a-zA-Z0-9_-]+):before\s*\{[^}]*content:\s*[\'"]\\\\([0-9a-fA-F]+)[\'"]/', $css, $matches, PREG_SET_ORDER ) ) {
			return $map;
		}

		foreach ( $matches as $match ) {
			$class_name = $match[1];
			$unicode = html_entity_decode( '&#x' . $match[2] . ';', ENT_QUOTES, 'UTF-8' );
			$map[ $class_name ] = $unicode;

			if ( '' !== $prefix && 0 === strpos( $class_name, $prefix ) ) {
				$map[ substr( $class_name, strlen( $prefix ) ) ] = $unicode;
			}
		}

		return $map;
	}

	private function get_svg_font_urls( string $css_url, string $css ): array {
		$urls = [];

		if ( ! preg_match_all( '/url\((?:[\'"]?)([^\'")]+?\.svg)(?:#[^\'")]*)?[\'"]?\)/i', $css, $matches ) ) {
			return $urls;
		}

		foreach ( $matches[1] as $relative ) {
			$relative = strtok( $relative, '#' );

			if ( 0 === strpos( $relative, 'http://' ) || 0 === strpos( $relative, 'https://' ) ) {
				$urls[] = $relative;
				continue;
			}

			$urls[] = trailingslashit( dirname( $css_url ) ) . $relative;
		}

		return array_values( array_unique( array_filter( $urls ) ) );
	}

	private function glyph_from_svg_font( string $svg_font, array $names, array $unicode_by_class ): ?string {
		$units = $this->read_numeric_attribute( $svg_font, 'units-per-em' ) ?? self::DEFAULT_UNITS_PER_EM;
		$ascent = $this->read_numeric_attribute( $svg_font, 'ascent' ) ?? $units;

		if ( ! preg_match_all( '/<glyph\b([^>]*)\/?>/i', $svg_font, $matches, PREG_SET_ORDER ) ) {
			return null;
		}

		foreach ( $matches as $match ) {
			$attributes = $match[1];
			$path = $this->read_attribute( $attributes, 'd' );
			$glyph_name = $this->read_attribute( $attributes, 'glyph-name' );
			$width = $this->read_numeric_attribute( $attributes, 'horiz-adv-x' ) ?? $units;

			if ( ! $path ) {
				continue;
			}

			$is_named = $glyph_name && in_array( $glyph_name, $names, true );
			$unicode = $this->decode_unicode( $this->read_attribute( $attributes, 'unicode' ) );
			$is_class_match = false;

			if ( $unicode ) {
				foreach ( $names as $name ) {
					if ( isset( $unicode_by_class[ $name ] ) && $unicode_by_class[ $name ] === $unicode ) {
						$is_class_match = true;
						break;
					}
				}
			}

			if ( ! $is_named && ! $is_class_match ) {
				continue;
			}

			$path_markup = '<path d="' . esc_attr( $path ) . '"></path>';

			return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' . (int) $width . ' ' . (int) $units . '"><g transform="matrix(1 0 0 -1 0 ' . (int) $ascent . ')">' . $path_markup . '</g></svg>';
		}

		return null;
	}

	private function build_svg( array $paths, int $width, int $height ): string {
		$path_markup = '';

		foreach ( $paths as $path ) {
			if ( ! is_string( $path ) || '' === $path ) {
				continue;
			}

			$path_markup .= '<path d="' . esc_attr( $path ) . '"></path>';
		}

		return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' . $width . ' ' . $height . '">' . $path_markup . '</svg>';
	}

	private function read_json( string $url ): ?array {
		$text = $this->read_text( $url );

		if ( ! $text ) {
			return null;
		}

		$decoded = json_decode( $text, true );

		return is_array( $decoded ) ? $decoded : null;
	}

	private function read_text( string $url ): ?string {
		$local_path = $this->resolve_local_path( $url );

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

	private function resolve_local_path( string $url ): ?string {
		$site_url = site_url();

		if ( 0 !== strpos( $url, $site_url ) ) {
			return null;
		}

		$path = ABSPATH . ltrim( substr( $url, strlen( $site_url ) ), '/' );

		return file_exists( $path ) ? $path : null;
	}

	private function read_attribute( string $source, string $name ): ?string {
		if ( ! preg_match( '/' . preg_quote( $name, '/' ) . '="([^"]*)"/i', $source, $match ) ) {
			return null;
		}

		return $match[1];
	}

	private function read_numeric_attribute( string $source, string $name ): ?int {
		$value = $this->read_attribute( $source, $name );

		return is_numeric( $value ) ? (int) $value : null;
	}

	private function decode_unicode( ?string $value ): ?string {
		if ( ! $value ) {
			return null;
		}

		if ( preg_match( '/^&#x([0-9a-f]+);$/i', $value, $match ) ) {
			return html_entity_decode( '&#x' . $match[1] . ';', ENT_QUOTES, 'UTF-8' );
		}

		if ( preg_match( '/^&#([0-9]+);$/', $value, $match ) ) {
			return html_entity_decode( '&#' . $match[1] . ';', ENT_QUOTES, 'UTF-8' );
		}

		return $value;
	}
}
