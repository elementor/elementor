<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Settings;

use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;
use Elementor\Core\Utils\Svg\Svg_Sanitizer;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Svg_Transformer extends Transformer_Base {
	const SVG_PREFIX = 'data:image/svg+xml;charset=utf-8,';

	public function transform( $value, $key ): array {
		if ( empty( $value['src'] ) ) {
			throw new \Exception( 'SVG source is not provided.' );
		}

		$svg_url = $value['src'];
		$svg_content = ( strpos( $svg_url, self::SVG_PREFIX ) === 0 )
			? urldecode( substr( $svg_url, strlen( self::SVG_PREFIX ) ) )
			: wp_remote_retrieve_body( wp_safe_remote_get( $svg_url ) );

		$svg = new \WP_HTML_Tag_Processor( $svg_content );

		if ( $svg->next_tag( 'svg' ) ) {
			$this->set_svg_attributes( $svg, $value );
		}

		while ( $svg->next_tag( [ 'path', 'rect', 'circle', 'g' ] ) ) {
			$svg->remove_attribute( 'fill' );
		}

		$valid_svg = ( new Svg_Sanitizer() )->sanitize( $svg->get_updated_html() );

		if ( ! $valid_svg ) {
			throw new \Exception( 'Invalid SVG content.' );
		}

		return [
			'content' => $valid_svg,
		];
	}

	private function set_svg_attributes( \WP_HTML_Tag_Processor $svg, array $settings ): void {
		$svg->set_attribute( 'fill', $settings['color'] ?? 'currentColor' );
		$svg->set_attribute( 'width', $settings['width'] ?? '100px' );
		$svg->set_attribute( 'height', $settings['height'] ?? '100px' );
		$svg->add_class( $settings['classes'] ?? '' );
	}
}
