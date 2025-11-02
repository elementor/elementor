<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Settings;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Rich_Text_Transformer extends Transformer_Base {
	public function transform( $value, Props_Resolver_Context $context ) {
		if ( ! is_array( $value ) ) {
			return '';
		}

		return $this->nodes_to_html( $value );
	}

	private function nodes_to_html( array $nodes ): string {
		$html = '';

		foreach ( $nodes as $node ) {
			$html .= $this->node_to_html( $node );
		}

		return $html;
	}

	private function node_to_html( array $node ): string {
		if ( ! isset( $node['tag'] ) || ! isset( $node['content'] ) ) {
			return '';
		}

		if ( null === $node['tag'] ) {
			return is_string( $node['content'] ) ? esc_html( $node['content'] ) : '';
		}

		$tag = $this->sanitize_tag( $node['tag'] );
		$content_html = $this->get_content_html( $node['content'] );

		return "<{$tag}>{$content_html}</{$tag}>";
	}

	private function get_content_html( $content ): string {
		if ( is_string( $content ) ) {
			return esc_html( $content );
		}

		if ( is_array( $content ) ) {
			return $this->nodes_to_html( $content );
		}

		return '';
	}

	private function sanitize_tag( $tag ): string {
		$allowed_tags = [ 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'u', 's', 'span', 'div', 'br', 'ul', 'ol', 'li', 'a', 'code', 'pre', 'blockquote' ];

		return in_array( $tag, $allowed_tags, true ) ? $tag : 'span';
	}
}
