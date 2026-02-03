<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Settings;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Html_V2_Transformer extends Transformer_Base {
	public function transform( $value, Props_Resolver_Context $context ) {
		if ( is_string( $value ) ) {
			return $this->normalize_value( $value );
		}

		if ( ! is_array( $value ) ) {
			return $this->normalize_value( '' );
		}

		$content = is_string( $value['content'] ?? null ) ? $value['content'] : '';
		$children = $value['children'] ?? null;

		return [
			'content' => $content,
			'children' => is_array( $children ) ? $children : $this->build_children_from_html( $content ),
		];
	}

	private function normalize_value( string $content ): array {
		return [
			'content' => $content,
			'children' => $this->build_children_from_html( $content ),
		];
	}

	private function build_children_from_html( string $html ): array {
		$html = trim( $html );
		if ( '' === $html ) {
			return [];
		}

		if ( ! class_exists( \DOMDocument::class ) ) {
			return [ $this->build_text_child( $html, 1 ) ];
		}

		$document = new \DOMDocument();
		$use_errors = libxml_use_internal_errors( true );
		$document->loadHTML( $html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD );
		libxml_clear_errors();
		libxml_use_internal_errors( $use_errors );

		$index = 0;
		$children = $this->build_children_from_nodes( $document->childNodes, $index ); // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase

		if ( ! empty( $children ) ) {
			return $children;
		}

		$text = trim( wp_strip_all_tags( $html ) );
		return '' === $text ? [] : [ $this->build_text_child( $text, 1 ) ];
	}

	private function build_children_from_nodes( \DOMNodeList $nodes, int &$index ): array {
		$children = [];

		foreach ( $nodes as $node ) {
			if ( XML_ELEMENT_NODE !== $node->nodeType ) { // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
				continue;
			}

			$child = [
				'id' => 'elem' . ( ++$index ),
				'type' => strtolower( $node->nodeName ), // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
			];

			$text = trim( $node->textContent ?? '' ); // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
			if ( '' !== $text ) {
				$child['content'] = $text;
			}

			$nested_children = $this->build_children_from_nodes( $node->childNodes, $index ); // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
			if ( ! empty( $nested_children ) ) {
				$child['children'] = $nested_children;
			}

			$children[] = $child;
		}

		return $children;
	}

	private function build_text_child( string $text, int $index ): array {
		return [
			'id' => 'elem' . $index,
			'type' => 'text',
			'content' => $text,
		];
	}
}
