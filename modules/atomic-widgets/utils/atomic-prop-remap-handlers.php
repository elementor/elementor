<?php

namespace Elementor\Modules\AtomicWidgets\Utils;

use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Link_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Query_Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Query_Filter_Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Query_Filter_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Query_Prop_Type;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Prop_Remap_Handlers {
	private const KIND_BY_SETTING_KEY = [
		'post_id' => Atomic_Prop_Remap::KIND_POST,
		'attachment_id' => Atomic_Prop_Remap::KIND_POST,
		'template_id' => Atomic_Prop_Remap::KIND_POST,
		'popup' => Atomic_Prop_Remap::KIND_POST,
		'taxonomy_id' => Atomic_Prop_Remap::KIND_TERM,
		'term_id' => Atomic_Prop_Remap::KIND_TERM,
		'author_id' => Atomic_Prop_Remap::KIND_USER,
		'user_id' => Atomic_Prop_Remap::KIND_USER,
	];

	private const KIND_BY_FILTER_KEY = [
		Atomic_Prop_Remap::FILTER_KEY_TERMS => Atomic_Prop_Remap::KIND_TERM,
		Atomic_Prop_Remap::FILTER_KEY_AUTHORS => Atomic_Prop_Remap::KIND_USER,
		Atomic_Prop_Remap::FILTER_KEY_MANUAL_SELECTION => Atomic_Prop_Remap::KIND_POST,
		Atomic_Prop_Remap::FILTER_KEY_CURRENT_POST => null,
	];

	/**
	 * @var callable|null
	 */
	private static $tag_resolver = null;

	public static function register(): void {
		Atomic_Prop_Remap_Registry::register( Query_Prop_Type::get_key(), [ self::class, 'remap_query' ] );
		Atomic_Prop_Remap_Registry::register( Query_Array_Prop_Type::get_key(), [ self::class, 'remap_descend_value' ] );
		Atomic_Prop_Remap_Registry::register( Query_Filter_Prop_Type::get_key(), [ self::class, 'remap_query_filter' ] );
		Atomic_Prop_Remap_Registry::register( Query_Filter_Array_Prop_Type::get_key(), [ self::class, 'remap_descend_value' ] );
		Atomic_Prop_Remap_Registry::register( Link_Prop_Type::get_key(), [ self::class, 'remap_link' ] );
		Atomic_Prop_Remap_Registry::register( Dynamic_Prop_Type::get_key(), [ self::class, 'remap_dynamic' ] );
	}

	public static function set_tag_resolver( ?callable $resolver ): void {
		self::$tag_resolver = $resolver;
	}

	public static function remap_query( array $atomic, array $replacements, callable $descend, array $context = [] ): array {
		$kind = $context['kind'] ?? null;

		if ( null === $kind ) {
			return $atomic;
		}

		$value = $atomic['value'] ?? null;

		if ( ! is_array( $value ) || ! array_key_exists( 'id', $value ) ) {
			return $atomic;
		}

		$value['id'] = Atomic_Prop_Remap::remap_id( $value['id'], $kind, $replacements );
		$atomic['value'] = $value;

		return $atomic;
	}

	public static function remap_descend_value( array $atomic, array $replacements, callable $descend, array $context = [] ): array {
		if ( isset( $atomic['value'] ) ) {
			$atomic['value'] = $descend( $atomic['value'], $context );
		}

		return $atomic;
	}

	public static function remap_query_filter( array $atomic, array $replacements, callable $descend, array $context = [] ): array {
		$value = $atomic['value'] ?? null;

		if ( ! is_array( $value ) ) {
			return $atomic;
		}

		$filter_key = Atomic_Prop_Remap::extract_string( $value['key'] ?? null );
		$kind = array_key_exists( $filter_key, self::KIND_BY_FILTER_KEY )
			? self::KIND_BY_FILTER_KEY[ $filter_key ]
			: ( $context['kind'] ?? null );

		$child_context = $context;
		$child_context['kind'] = $kind;

		if ( isset( $value['values'] ) ) {
			$value['values'] = $descend( $value['values'], $child_context );
		}

		$atomic['value'] = $value;

		return $atomic;
	}

	public static function remap_link( array $atomic, array $replacements, callable $descend, array $context = [] ): array {
		$value = $atomic['value'] ?? null;

		if ( ! is_array( $value ) ) {
			return $atomic;
		}

		if ( isset( $value['destination'] ) ) {
			$destination_context = $context;
			$destination_context['kind'] = Atomic_Prop_Remap::KIND_POST;
			$value['destination'] = $descend( $value['destination'], $destination_context );
		}

		$atomic['value'] = $value;

		return $atomic;
	}

	public static function remap_dynamic( array $atomic, array $replacements, callable $descend, array $context = [] ): array {
		$value = $atomic['value'] ?? null;

		if ( ! is_array( $value ) ) {
			return $atomic;
		}

		$settings = $value['settings'] ?? [];

		if ( self::is_legacy_flat_settings( $settings ) ) {
			$value = self::remap_dynamic_via_tag( $value, $replacements );
			$settings = $value['settings'] ?? [];
		}

		if ( is_array( $settings ) ) {
			foreach ( $settings as $setting_key => $setting_value ) {
				$child_context = $context;
				$child_context['kind'] = self::KIND_BY_SETTING_KEY[ $setting_key ] ?? ( $context['kind'] ?? null );
				$settings[ $setting_key ] = $descend( $setting_value, $child_context );
			}

			$value['settings'] = $settings;
		}

		$atomic['value'] = $value;

		return $atomic;
	}

	private static function remap_dynamic_via_tag( array $value, array $replacements ): array {
		$name = $value['name'] ?? '';

		if ( ! is_string( $name ) || '' === $name ) {
			return $value;
		}

		$tag = self::resolve_tag( $name, $value['settings'] ?? [] );

		if ( ! is_object( $tag ) ) {
			return $value;
		}

		$config = [
			'id' => '',
			'name' => $name,
			'settings' => $value['settings'] ?? [],
		];

		if ( method_exists( $tag, 'on_import_replace_dynamic_content' ) ) {
			$config = $tag::on_import_replace_dynamic_content( $config, $replacements['post_ids'] ?? [] );
		} elseif ( method_exists( $tag, 'on_import_update_dynamic_content' ) ) {
			$controls = method_exists( $tag, 'get_controls' ) ? $tag->get_controls() : [];
			$config = $tag::on_import_update_dynamic_content( $config, $replacements, $controls );
		}

		if ( isset( $config['settings'] ) && is_array( $config['settings'] ) ) {
			$value['settings'] = $config['settings'];
		}

		return $value;
	}

	private static function resolve_tag( string $name, array $settings ) {
		if ( self::$tag_resolver ) {
			return ( self::$tag_resolver )( $name, $settings );
		}

		if ( ! class_exists( Plugin::class ) || empty( Plugin::$instance->dynamic_tags ) ) {
			return null;
		}

		return Plugin::$instance->dynamic_tags->create_tag( '', $name, $settings );
	}

	private static function is_legacy_flat_settings( $settings ): bool {
		if ( ! is_array( $settings ) || empty( $settings ) ) {
			return false;
		}

		foreach ( $settings as $setting ) {
			if ( is_array( $setting ) && isset( $setting['$$type'] ) ) {
				return false;
			}
		}

		return true;
	}
}
