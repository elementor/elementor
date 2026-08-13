<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Translates the LLM-facing dynamic-tag idiom (`{ name, settings }`) into V3's on-disk
 * `__dynamic__[key] = <shortcode>` sibling map. Accepts two input shapes so the LLM can use
 * the same contract it uses on V4:
 *
 *   1. Top-level:  `{ name, settings }` at the allowlisted key.
 *   2. Nested:     `{ <control.dynamic.property>: { name, settings } }` (e.g. `url` on a URL control).
 *
 * Validation is strict:
 *   - Tag must be registered.
 *   - Tag's categories must intersect the control's `dynamic.categories` (when declared).
 *
 * Two callable seams (`$tag_info_resolver`, `$shortcode_builder`) exist so unit tests can
 * exercise the resolver without booting WordPress.
 */
class V3_Dynamic_Resolver {

	/** @var callable|null */
	private static $tag_info_resolver = null;

	/** @var callable|null */
	private static $shortcode_builder = null;

	public static function set_tag_info_resolver( ?callable $resolver ): void {
		self::$tag_info_resolver = $resolver;
	}

	public static function set_shortcode_builder( ?callable $builder ): void {
		self::$shortcode_builder = $builder;
	}

	/**
	 * @param string               $key     Allowlisted setting key (control name on the V3 widget).
	 * @param mixed                $value   Raw value from element_config for this key.
	 * @param array<string, mixed> $control Control config from `Widget_Base::get_controls()[$key]`.
	 *
	 * @return array{
	 *     matched: bool,
	 *     shortcode?: string,
	 *     primitive?: mixed,
	 *     error?: \WP_Error,
	 * }
	 */
	public static function try_resolve( string $key, $value, array $control ): array {
		if ( ! self::is_dynamic_capable( $control ) ) {
			return [ 'matched' => false ];
		}

		$dynamic_input = self::extract_dynamic_input( $value, $control['dynamic']['property'] ?? null );
		if ( null === $dynamic_input ) {
			return [ 'matched' => false ];
		}

		$tag_info = self::resolve_tag_info( $dynamic_input['name'] );
		if ( null === $tag_info ) {
			return [
				'matched' => true,
				'error' => new \WP_Error(
					'elementor_invalid_settings',
					sprintf( 'dynamic tag "%s" is not registered.', $dynamic_input['name'] )
				),
			];
		}

		$category_error = self::validate_categories( $key, $dynamic_input['name'], $tag_info, $control['dynamic']['categories'] ?? [] );
		if ( $category_error ) {
			return [
				'matched' => true,
				'error' => $category_error,
			];
		}

		$shortcode = self::build_shortcode( $dynamic_input['name'], $dynamic_input['settings'] );
		if ( '' === $shortcode ) {
			return [
				'matched' => true,
				'error' => new \WP_Error(
					'elementor_invalid_settings',
					sprintf( 'failed to serialize dynamic tag "%s".', $dynamic_input['name'] )
				),
			];
		}

		return [
			'matched' => true,
			'shortcode' => $shortcode,
			'primitive' => self::empty_primitive_for_control( $control ),
		];
	}

	public static function is_dynamic_capable( array $control ): bool {
		return true === ( $control['dynamic']['active'] ?? false );
	}

	/**
	 * @return array{name: string, settings: array<string, mixed>}|null
	 */
	private static function extract_dynamic_input( $value, ?string $property ): ?array {
		if ( ! is_array( $value ) ) {
			return null;
		}

		$top = self::pluck_dynamic_shape( $value );
		if ( null !== $top ) {
			return $top;
		}

		if ( ! is_string( $property ) || '' === $property ) {
			return null;
		}

		$nested = $value[ $property ] ?? null;
		if ( ! is_array( $nested ) ) {
			return null;
		}

		return self::pluck_dynamic_shape( $nested );
	}

	/**
	 * @return array{name: string, settings: array<string, mixed>}|null
	 */
	private static function pluck_dynamic_shape( array $value ): ?array {
		$name = $value['name'] ?? null;
		if ( ! is_string( $name ) || '' === $name ) {
			return null;
		}

		$settings = $value['settings'] ?? [];
		if ( ! is_array( $settings ) ) {
			$settings = [];
		}

		return [
			'name' => $name,
			'settings' => $settings,
		];
	}

	private static function validate_categories( string $key, string $tag_name, array $tag_info, array $control_categories ): ?\WP_Error {
		if ( empty( $control_categories ) ) {
			return null;
		}

		$tag_categories = self::extract_tag_categories( $tag_info );
		if ( empty( $tag_categories ) ) {
			return null;
		}

		if ( ! empty( array_intersect( $tag_categories, $control_categories ) ) ) {
			return null;
		}

		return new \WP_Error(
			'elementor_invalid_settings',
			sprintf(
				'dynamic tag "%s" (categories: [%s]) is not compatible with field "%s" (allowed categories: [%s]).',
				$tag_name,
				implode( ', ', $tag_categories ),
				$key,
				implode( ', ', $control_categories )
			)
		);
	}

	private static function extract_tag_categories( array $tag_info ): array {
		if ( isset( $tag_info['categories'] ) && is_array( $tag_info['categories'] ) ) {
			return $tag_info['categories'];
		}

		$class = $tag_info['class'] ?? null;
		if ( ! is_string( $class ) || ! class_exists( $class ) ) {
			return [];
		}

		try {
			$instance = new $class();
			if ( method_exists( $instance, 'get_categories' ) ) {
				$categories = $instance->get_categories();
				return is_array( $categories ) ? $categories : [];
			}
		} catch ( \Throwable $e ) {
			return [];
		}

		return [];
	}

	private static function resolve_tag_info( string $name ): ?array {
		if ( is_callable( self::$tag_info_resolver ) ) {
			$info = ( self::$tag_info_resolver )( $name );
			return is_array( $info ) ? $info : null;
		}

		if ( ! isset( Plugin::$instance->dynamic_tags ) ) {
			return null;
		}

		$info = Plugin::$instance->dynamic_tags->get_tag_info( $name );
		return is_array( $info ) ? $info : null;
	}

	private static function build_shortcode( string $name, array $settings ): string {
		$id = self::generate_tag_id();

		if ( is_callable( self::$shortcode_builder ) ) {
			$built = ( self::$shortcode_builder )( $id, $name, $settings );
			return is_string( $built ) ? $built : '';
		}

		if ( ! isset( Plugin::$instance->dynamic_tags ) ) {
			return '';
		}

		$built = Plugin::$instance->dynamic_tags->tag_data_to_tag_text( $id, $name, $settings );
		return is_string( $built ) ? $built : '';
	}

	private static function generate_tag_id(): string {
		return substr( md5( uniqid( 'mcp-v3-dyn', true ) ), 0, 7 );
	}

	private static function empty_primitive_for_control( array $control ): mixed {
		$type = $control['type'] ?? null;

		if ( 'url' === $type ) {
			return [
				'url' => '',
				'is_external' => '',
				'nofollow' => '',
			];
		}

		if ( 'media' === $type ) {
			return [
				'url' => '',
				'id' => 0,
			];
		}

		return '';
	}
}
