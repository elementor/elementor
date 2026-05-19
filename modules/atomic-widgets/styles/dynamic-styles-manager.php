<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Dynamic_Styles_Manager {
	private static ?self $instance = null;

	/**
	 * @var array<string, Dynamic_Style_Definition>
	 */
	private array $definitions = [];

	public static function instance(): self {
		if ( ! self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	public static function reset(): void {
		self::$instance = null;
	}

	/**
	 * @param array<string, mixed> $meta
	 */
	public function register( string $var_name, array $dynamic_node, array $meta = [] ): void {
		if ( ! Dynamic_Prop_Type::is_dynamic_prop_value( $dynamic_node ) ) {
			return;
		}

		$this->definitions[ $var_name ] = new Dynamic_Style_Definition( $var_name, $dynamic_node, $meta );
	}

	/**
	 * @param array<string, array> $placeholders
	 */
	public function register_placeholders( array $placeholders ): void {
		foreach ( $placeholders as $var_name => $dynamic_node ) {
			if ( ! is_string( $var_name ) || ! is_array( $dynamic_node ) ) {
				continue;
			}

			$this->register( $var_name, $dynamic_node );
		}
	}

	/**
	 * @return array<string, Dynamic_Style_Definition>
	 */
	public function get_definitions(): array {
		return $this->definitions;
	}

	/**
	 * @param array<string, string> $values
	 */
	public function build_inline_style( array $values ): string {
		$style = '';

		foreach ( $values as $var_name => $value ) {
			if ( '' === $value ) {
				continue;
			}

			$style .= $var_name . ':' . $value . ';';
		}

		return $style;
	}

	/**
	 * @param array<string, string> $values
	 * @param array<string, string> $attrs
	 */
	public function wrap_scoped_html( string $html, array $values, array $attrs = [] ): string {
		$style = $this->build_inline_style( $values );

		if ( '' === $style ) {
			return $html;
		}

		if ( ! empty( $attrs['style'] ) ) {
			$attrs['style'] .= $style;
		} else {
			$attrs['style'] = $style;
		}

		$attr_parts = [];

		foreach ( $attrs as $key => $value ) {
			$attr_parts[] = sprintf( '%s="%s"', esc_attr( $key ), esc_attr( $value ) );
		}

		return sprintf( '<div %s>%s</div>', implode( ' ', $attr_parts ), $html );
	}
}
