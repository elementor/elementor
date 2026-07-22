<?php

namespace Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers;

use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Prop_Type;
use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Tags_Module;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Resolver_Base;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Values_Resolver;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Dynamic_Plain_Resolver extends Plain_Resolver_Base {
	const OMITTED_SETTING_KEYS = [ 'fallback' ];

	private ?Plain_Values_Resolver $walker;

	public function __construct( ?Plain_Values_Resolver $walker = null ) {
		$this->walker = $walker;
	}

	public function set_walker( Plain_Values_Resolver $walker ): void {
		$this->walker = $walker;
	}

	public function resolve( $plain_value ) {
		if ( ! is_array( $plain_value ) ) {
			return null;
		}

		if ( isset( $plain_value['$$type'] ) && Dynamic_Prop_Type::get_key() === $plain_value['$$type'] ) {
			$plain_value = $plain_value['value'] ?? [];
		}

		if ( ! isset( $plain_value['name'] ) || ! is_string( $plain_value['name'] ) ) {
			return null;
		}

		$name = $plain_value['name'];
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

		$settings = $this->build_settings(
			$tag['props_schema'] ?? [],
			$plain_value['settings'] ?? []
		);

		return [
			'$$type' => Dynamic_Prop_Type::get_key(),
			'value' => [
				'name' => $tag['name'],
				'group' => $tag['group'] ?? '',
				'settings' => $settings,
			],
		];
	}

	private function build_settings( array $props_schema, array $provided ): array {
		$settings = [];

		foreach ( $props_schema as $key => $prop_type ) {
			if ( in_array( $key, self::OMITTED_SETTING_KEYS, true ) ) {
				continue;
			}

			if ( ! $prop_type instanceof Prop_Type ) {
				continue;
			}

			if ( ! array_key_exists( $key, $provided ) ) {
				$default = $this->default_setting_value( $prop_type );

				if ( null !== $default ) {
					$settings[ $key ] = $default;
				}

				continue;
			}

			$resolved = $this->walker
				? $this->walker->resolve( $provided[ $key ], $prop_type )
				: $this->wrap_setting_value( $provided[ $key ], $prop_type );

			if ( null === $resolved ) {
				continue;
			}

			$settings[ $key ] = $resolved;
		}

		return $settings;
	}

	private function wrap_setting_value( $raw, Prop_Type $prop_type ) {
		if ( is_array( $raw ) && isset( $raw['$$type'] ) ) {
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

	private function default_setting_value( Prop_Type $prop_type ) {
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
