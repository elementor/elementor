<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Prop_Type;
use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Tags_Module;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Dynamic_Tag_Llm_Resolver {

	const OMITTED_SETTING_KEYS = [ 'fallback' ];

	public static function make(): callable {
		return [ self::class, 'resolve' ];
	}

	public static function resolve( $value ): array {
		$input = is_array( $value ) ? $value : [];
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
					$input['settings'] ?? []
				),
			],
		];
	}

	private static function build_strict_settings( array $props_schema, array $provided ): array {
		$settings = [];

		foreach ( $props_schema as $key => $prop_type ) {
			if ( in_array( $key, self::OMITTED_SETTING_KEYS, true ) ) {
				continue;
			}

			if ( ! $prop_type instanceof Prop_Type ) {
				continue;
			}

			$resolved = isset( $provided[ $key ] )
				? self::wrap_setting_value( $provided[ $key ], $prop_type )
				: self::default_setting_value( $prop_type );

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

		return $key ? [ '$$type' => $key, 'value' => $raw ] : $raw;
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
