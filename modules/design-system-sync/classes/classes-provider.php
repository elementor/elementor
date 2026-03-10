<?php

namespace Elementor\Modules\DesignSystemSync\Classes;

use Elementor\Core\Breakpoints\Manager as Breakpoints_Manager;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Classes_Provider {
	private static $cached_classes = null;

	const TYPOGRAPHY_PROPS = [
		'font-family',
		'font-size',
		'font-weight',
		'font-style',
		'text-decoration',
		'line-height',
		'letter-spacing',
		'word-spacing',
		'text-transform',
	];

	public static function get_all_classes(): array {
		if ( null !== self::$cached_classes ) {
			return self::$cached_classes;
		}

		$classes_data = Global_Classes_Repository::make()
			->context( Global_Classes_Repository::CONTEXT_FRONTEND )
			->all()
			->get();

		self::$cached_classes = $classes_data['items'] ?? [];

		return self::$cached_classes;
	}

	public static function get_synced_classes(): array {
		$all_classes = self::get_all_classes();
		$synced_classes = [];

		foreach ( $all_classes as $id => $class ) {
			if ( empty( $class['sync_to_v3'] ) ) {
				continue;
			}

			$synced_classes[ $id ] = $class;
		}

		return $synced_classes;
	}

	public static function clear_cache() {
		self::$cached_classes = null;
	}

	public static function get_default_breakpoint_props( array $variants ): array {
		$all = self::get_all_normal_state_variant_props( $variants );

		return $all[ Breakpoints_Manager::BREAKPOINT_KEY_DESKTOP ] ?? [];
	}

	public static function get_all_normal_state_variant_props( array $variants ): array {
		$result = [];

		foreach ( $variants as $variant ) {
			if ( ! isset( $variant['meta'] ) ) {
				continue;
			}

			$meta = $variant['meta'];

			if ( ! array_key_exists( 'breakpoint', $meta ) || ! array_key_exists( 'state', $meta ) ) {
				continue;
			}

			$state = $meta['state'];

			if ( ! in_array( $state, [ null, 'normal' ], true ) ) {
				continue;
			}

			$breakpoint = $meta['breakpoint'];
			$breakpoint_key = ( null === $breakpoint ) ? Breakpoints_Manager::BREAKPOINT_KEY_DESKTOP : $breakpoint;

			$result[ $breakpoint_key ] = $variant['props'] ?? [];
		}

		return $result;
	}

	public static function has_typography_props( array $props ): bool {
		foreach ( self::TYPOGRAPHY_PROPS as $key ) {
			if ( isset( $props[ $key ] ) ) {
				return true;
			}
		}

		return false;
	}

	public static function get_typography_classes(): array {
		$synced_classes = self::get_synced_classes();

		if ( empty( $synced_classes ) ) {
			return [];
		}

		$typography_classes = [];

		$typography_keys = array_flip( self::TYPOGRAPHY_PROPS );

		foreach ( $synced_classes as $id => $class ) {
			$variants = $class['variants'] ?? [];
			$default_props = self::get_default_breakpoint_props( $variants );

			if ( empty( $default_props ) ) {
				continue;
			}

			if ( ! self::has_typography_props( $default_props ) ) {
				continue;
			}

			$all_variant_props = self::get_all_normal_state_variant_props( $variants );

			$filtered_variant_props = [];
			foreach ( $all_variant_props as $breakpoint => $props ) {
				$filtered_variant_props[ $breakpoint ] = array_intersect_key( $props, $typography_keys );
			}

			$typography_classes[] = [
				'id' => $id,
				'label' => $class['label'] ?? '',
				'props' => array_intersect_key( $default_props, $typography_keys ),
				'variants_props' => $filtered_variant_props,
			];
		}

		return $typography_classes;
	}
}
