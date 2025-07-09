<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers;

use Elementor\Core\Utils\Svg\Svg_Sanitizer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Svg_Transformer extends Transformer_Base {
	const DEFAULT_SVG = 'images/default-svg.svg';
	const DEFAULT_SVG_PATH = ELEMENTOR_ASSETS_PATH . self::DEFAULT_SVG;
	const DEFAULT_SVG_URL = ELEMENTOR_ASSETS_URL . self::DEFAULT_SVG;
	const ATTRIBUTE_BLACK_LIST = [ 'width', 'height', 'fill' ];

	public function transform( $value, Props_Resolver_Context $context ) {
		$settings = [
			'id' => isset( $value['id'] ) ? (int) $value['id'] : null,
			'url' => $value['url'] ?? null,
		];

		$svg = $this->get_svg_html( $settings );

		return [
			'attributes' => $this->extract_attributes_from_template( $svg ),
			'content' => $this->extract_inner_svg_content( $svg ),
		];
	}

	private function get_svg_html( $settings ): ?string {
		$svg = $this->get_svg_content( $settings );

		if ( ! $svg ) {
			return null;
		}

		$svg = new \WP_HTML_Tag_Processor( $svg );

		if ( ! $svg->next_tag( 'svg' ) ) {
			return null;
		}

		return ( new Svg_Sanitizer() )->sanitize( $svg->get_updated_html() ) ?? null;
	}

	private function get_svg_content( $settings ) {
		if ( isset( $settings['id'] ) ) {
			$content = Utils::file_get_contents(
				get_attached_file( $settings['id'] )
			);

			if ( $content ) {
				return $content;
			}
		}

		if (
			isset( $settings['url'] ) &&
			static::DEFAULT_SVG_URL !== $settings['url']
		) {
			$content = wp_safe_remote_get(
				$settings['url']
			);

			if ( ! is_wp_error( $content ) ) {
				return $content['body'];
			}
		}

		$content = Utils::file_get_contents(
			static::DEFAULT_SVG_PATH
		);

		return $content ?? null;
	}

	private function extract_attributes_from_template( string $svg ) {
		if ( ! $svg ) {
			return [];
		}

		$attributes = [];

		if ( preg_match( '/<svg\s+([^>]*)>/is', $svg, $matches ) ) {
			$attr_string = $matches[1];

			preg_match_all(
				'/([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*(=\s*("([^"]*)"|\'([^\']*)\'|([^\s"\'>]+)))?/s',
				$attr_string,
				$attr_matches,
				PREG_SET_ORDER
			);

			foreach ( $attr_matches as $attr ) {
				$key = $attr[1];

				if ( in_array( $key, self::ATTRIBUTE_BLACK_LIST, true ) ) {
					continue;
				}

				$attributes[ $key ] = $this->get_attribute_value_from_match( $attr );
			}
		}

		return $attributes;
	}

	private function extract_inner_svg_content( string $svg ) {
		if ( ! $svg ) {
			return '';
		}

		if ( preg_match( '/<svg\b[^>]*>(.*?)<\/svg>/is', $svg, $matches ) ) {
			return $matches[1];
		}

		return '';
	}

	private function get_attribute_value_from_match( array $attr ) {
		$value = null;

		if ( ! empty( $attr[2] ) ) {
			if ( isset( $attr[4] ) && '' !== $attr[4] ) {
				$value = $attr[4];
			} elseif ( isset( $attr[5] ) && '' !== $attr[5] ) {
				$value = $attr[5];
			} elseif ( isset( $attr[6] ) && '' !== $attr[6] ) {
				$value = $attr[6];
			}

			$value = html_entity_decode( $value, ENT_QUOTES | ENT_XML1, 'UTF-8' );

			if (
				strlen( $value ) > 1 &&
				( '"' === $value[0] || "'" === $value[0] ) &&
				$value[0] === $value[ strlen( $value ) - 1 ]
			) {
				$value = substr( $value, 1, -1 );
			}

			return $value;
		}

		return true;
	}
}
