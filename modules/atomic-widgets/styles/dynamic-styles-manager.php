<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Prop_Type;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Dynamic_Styles_Manager {
	const DEFINITIONS_EXTENSION = '.dynamic-definitions.json';

	const LEGACY_PLACEHOLDERS_EXTENSION = '.placeholders.json';

	const VAR_PREFIX = '--e-dyn-';

	private static ?self $instance = null;

	/**
	 * @var array<string, array>
	 */
	private array $registry = [];

	public static function instance(): self {
		if ( ! self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	public static function reset(): void {
		self::$instance = null;
	}

	public function register_hooks(): void {
		add_filter( 'elementor/frontend/the_content', [ $this, 'wrap_content_with_dynamic_vars' ], 20 );
	}

	public function register( array $dynamic_node ): string {
		if ( ! Dynamic_Prop_Type::is_dynamic_prop_value( $dynamic_node ) ) {
			return '';
		}

		$encoded = wp_json_encode( $dynamic_node, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES );

		if ( false === $encoded ) {
			return '';
		}

		$var_name = self::VAR_PREFIX . substr( md5( $encoded ), 0, 12 );

		$this->registry[ $var_name ] = $dynamic_node;

		return $var_name;
	}

	public function render_for_post( int $post_id, string $html, array $wrapper_attrs = [] ): string {
		if ( empty( $this->registry ) || '' === $html ) {
			return $html;
		}

		$values = $this->resolve_for_post( $post_id );

		if ( empty( $values ) ) {
			return $html;
		}

		$style = $this->build_inline_style( $values );

		if ( '' === $style ) {
			return $html;
		}

		if ( ! empty( $wrapper_attrs['style'] ) ) {
			$wrapper_attrs['style'] .= $style;
		} else {
			$wrapper_attrs['style'] = $style;
		}

		$attr_parts = [];

		foreach ( $wrapper_attrs as $key => $value ) {
			$attr_parts[] = sprintf( '%s="%s"', esc_attr( $key ), esc_attr( $value ) );
		}

		return sprintf( '<div %s>%s</div>', implode( ' ', $attr_parts ), $html );
	}

	public function serialize(): string {
		if ( empty( $this->registry ) ) {
			return '';
		}

		$encoded = wp_json_encode( $this->registry, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES );

		return false === $encoded ? '' : $encoded;
	}

	public function hydrate( string $json ): void {
		if ( '' === $json ) {
			return;
		}

		$raw = json_decode( $json, true );

		if ( ! is_array( $raw ) ) {
			return;
		}

		foreach ( $raw as $var_name => $dynamic_node ) {
			if ( ! is_string( $var_name ) || ! is_array( $dynamic_node ) ) {
				continue;
			}

			if ( ! Dynamic_Prop_Type::is_dynamic_prop_value( $dynamic_node ) ) {
				continue;
			}

			$this->registry[ $var_name ] = $dynamic_node;
		}
	}

	/**
	 * @param array<string, array> $raw
	 */
	public function hydrate_from_sidecar( array $raw ): void {
		if ( empty( $raw ) ) {
			return;
		}

		$encoded = wp_json_encode( $raw, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES );

		if ( false === $encoded ) {
			return;
		}

		$this->hydrate( $encoded );
	}

	public function wrap_content_with_dynamic_vars( string $content ): string {
		if ( '' === $content || empty( $this->registry ) ) {
			return $content;
		}

		$post_id = get_the_ID();

		if ( ! $post_id ) {
			return $content;
		}

		return $this->render_for_post(
			$post_id,
			$content,
			[
				'class' => 'e-dynamic-styles-root',
			]
		);
	}

	/**
	 * @return array<string, string>
	 */
	private function resolve_for_post( int $post_id ): array {
		$values = [];
		$previous_post = $GLOBALS['post'] ?? null;
		$post = get_post( $post_id );

		if ( $post ) {
			setup_postdata( $post );
		}

		foreach ( $this->registry as $var_name => $dynamic_node ) {
			$value = $this->resolve_node( $dynamic_node );

			if ( null === $value || '' === $value ) {
				continue;
			}

			$values[ $var_name ] = $value;
		}

		if ( $post ) {
			wp_reset_postdata();
		}

		if ( $previous_post instanceof \WP_Post ) {
			$GLOBALS['post'] = $previous_post;
		}

		return $values;
	}

	private function resolve_node( array $dynamic_node ): ?string {
		if ( ! Dynamic_Prop_Type::is_dynamic_prop_value( $dynamic_node ) ) {
			return null;
		}

		$tag_name = $dynamic_node['value']['name'] ?? null;
		$tag_settings = $dynamic_node['value']['settings'] ?? [];

		if ( ! $tag_name ) {
			return null;
		}

		$value = Plugin::$instance->dynamic_tags->get_tag_data_content( null, $tag_name, $tag_settings );

		if ( null === $value || '' === $value ) {
			return null;
		}

		return (string) $value;
	}

	/**
	 * @param array<string, string> $values
	 */
	private function build_inline_style( array $values ): string {
		$style = '';

		foreach ( $values as $var_name => $value ) {
			if ( '' === $value ) {
				continue;
			}

			$style .= $var_name . ':' . $value . ';';
		}

		return $style;
	}
}
