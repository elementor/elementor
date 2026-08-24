<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Prop_Type;
use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Tags_Module;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropsResolver\Render_Props_Resolver;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Dynamic_Tag_Llm_Resolver {

	const OMITTED_SETTING_KEYS = [ 'fallback' ];

	public static function make(): callable {
		return [ self::class, 'resolve' ];
	}

	public static function serialize( $stored_value ): array {
		$input = self::normalize_input( $stored_value );
		$name = $input['name'] ?? '';
		$tag = $name ? Dynamic_Tags_Module::instance()->registry->get_tag( $name ) : null;
		$props_schema = is_array( $tag['props_schema'] ?? null ) ? $tag['props_schema'] : [];
		$stored_settings = is_array( $input['settings'] ?? null ) ? $input['settings'] : [];

		return [
			'name' => $name,
			'settings' => self::serialize_tag_settings( $props_schema, $stored_settings ),
		];
	}

	public static function resolve( $value, ?callable $settings_resolver = null ): array {
		$input = self::normalize_input( $value );
		$name = $input['name'] ?? '';
		$tag = $name ? Dynamic_Tags_Module::instance()->registry->get_tag( $name ) : null;

		if ( ! $tag ) {
			return [
				'$$type' => Dynamic_Prop_Type::get_key(),
				'value' => [
					'name' => $name,
					'group' => '',
					'settings' => [],
				],
			];
		}

		return [
			'$$type' => Dynamic_Prop_Type::get_key(),
			'value' => [
				'name' => $tag['name'],
				'group' => $tag['group'] ?? '',
				'settings' => self::build_strict_settings(
					$tag['props_schema'] ?? [],
					$input['settings'] ?? [],
					$settings_resolver
				),
			],
		];
	}

	private static function serialize_tag_settings( array $props_schema, array $stored_settings ): array {
		$plain_settings = [];
		$resolver = Render_Props_Resolver::for_plain();

		foreach ( $props_schema as $key => $prop_type ) {
			if ( in_array( $key, self::OMITTED_SETTING_KEYS, true ) ) {
				continue;
			}

			if ( ! $prop_type instanceof Prop_Type ) {
				continue;
			}

			if ( ! array_key_exists( $key, $stored_settings ) ) {
				continue;
			}

			$plain = $resolver->resolve_value( $stored_settings[ $key ], $prop_type );

			if ( null !== $plain ) {
				$plain_settings[ $key ] = $plain;
			}
		}

		return $plain_settings;
	}

	private static function normalize_input( $value ): array {
		if ( ! is_array( $value ) ) {
			return [];
		}

		if ( isset( $value['$$type'] ) && Dynamic_Prop_Type::get_key() === $value['$$type'] ) {
			return is_array( $value['value'] ?? null ) ? $value['value'] : [];
		}

		return $value;
	}

	private static function build_strict_settings( array $props_schema, array $provided, ?callable $settings_resolver ): array {
		$settings = [];

		foreach ( $props_schema as $key => $prop_type ) {
			if ( in_array( $key, self::OMITTED_SETTING_KEYS, true ) ) {
				continue;
			}

			if ( ! $prop_type instanceof Prop_Type ) {
				continue;
			}

			$resolved = null;

			if ( array_key_exists( $key, $provided ) ) {
				$resolved = $settings_resolver
					? $settings_resolver( $provided[ $key ], $prop_type )
					: self::wrap_setting_value( $provided[ $key ], $prop_type );
			} else {
				$resolved = self::default_setting_value( $prop_type );
			}

			if ( null !== $resolved ) {
				$settings[ $key ] = $resolved;
			}
		}

		return $settings;
	}

	private static function wrap_setting_value( $raw, Prop_Type $prop_type ) {
		if ( is_array( $raw ) ) {
			return $raw;
		}

		$key = $prop_type::get_key();

		if ( ! $key ) {
			return $raw;
		}

		return [
			'$$type' => $key,
			'value' => $raw,
		];
	}

	private static function default_setting_value( Prop_Type $prop_type ) {
		$initial_value = $prop_type->get_initial_value();

		if ( null !== $initial_value ) {
			return $initial_value;
		}

		$default = $prop_type->get_default();

		if ( null !== $default ) {
			return $default;
		}

		return null;
	}
}
