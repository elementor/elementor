<?php

namespace Elementor\Modules\DesignSystemSync\Classes;

use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Classes_Provider {
	private static $cached_classes = null;

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
		foreach ( $variants as $variant ) {
			if ( ! isset( $variant['meta'] ) ) {
				continue;
			}

			$meta = $variant['meta'];

			if ( ! array_key_exists( 'breakpoint', $meta ) || ! array_key_exists( 'state', $meta ) ) {
				continue;
			}

			$breakpoint = $meta['breakpoint'];
			$state = $meta['state'];

			if ( ! in_array( $breakpoint, [ null, 'desktop' ], true ) ) {
				continue;
			}

			if ( ! in_array( $state, [ null, 'normal' ], true ) ) {
				continue;
			}

			return $variant['props'] ?? [];
		}

		return [];
	}
}
