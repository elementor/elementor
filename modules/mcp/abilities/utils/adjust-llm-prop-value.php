<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Escaped_Html_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Normalizes agent-supplied values before Plain_Values_Resolver runs.
 * Mirrors editor-props adjustLlmPropValueSchema at the MCP boundary.
 */
class Adjust_Llm_Prop_Value {

	public static function adjust_for_plain_resolver( $value, Prop_Type $prop_type ) {
		if ( ! self::prop_type_includes_escaped_html( $prop_type ) ) {
			return $value;
		}

		return self::adjust_escaped_html_plain( $value );
	}

	private static function prop_type_includes_escaped_html( Prop_Type $prop_type ): bool {
		if ( $prop_type instanceof Escaped_Html_Prop_Type ) {
			return true;
		}

		if ( ! $prop_type instanceof Union_Prop_Type ) {
			return false;
		}

		foreach ( $prop_type->get_prop_types() as $variant ) {
			if ( $variant instanceof Escaped_Html_Prop_Type ) {
				return true;
			}
		}

		return false;
	}

	private static function adjust_escaped_html_plain( $value ) {
		if ( is_string( $value ) ) {
			return $value;
		}

		if ( is_scalar( $value ) ) {
			return null;
		}

		if ( ! is_array( $value ) ) {
			return $value;
		}

		if ( isset( $value['$intention'] ) ) {
			unset( $value['$intention'] );
		}

		if ( isset( $value['$$type'], $value['value'] ) ) {
			$inner = $value['value'];

			if ( is_string( $inner ) ) {
				return $inner;
			}

			if ( is_array( $inner ) && self::is_legacy_llm_rich_text_shape( $inner ) ) {
				$extracted = self::extract_content_string( $inner['content'] );

				return null === $extracted ? null : $extracted;
			}

			return $value;
		}

		if ( self::is_legacy_llm_rich_text_shape( $value ) ) {
			$extracted = self::extract_content_string( $value['content'] );

			return null === $extracted ? null : $extracted;
		}

		return $value;
	}

	private static function is_legacy_llm_rich_text_shape( array $value ): bool {
		return array_key_exists( 'content', $value );
	}

	private static function extract_content_string( $content ): ?string {
		if ( is_string( $content ) ) {
			return $content;
		}

		if ( is_array( $content ) && isset( $content['value'] ) && is_string( $content['value'] ) ) {
			return $content['value'];
		}

		return null;
	}
}
