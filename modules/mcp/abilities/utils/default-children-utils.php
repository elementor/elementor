<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Default_Children_Utils {
	public static function get_required_child_types( array $default_children ): array {
		$types = [];

		foreach ( $default_children as $child ) {
			if ( empty( $child['meta']['required'] ) ) {
				continue;
			}

			$type = $child['widgetType'] ?? $child['elType'] ?? null;

			if ( $type ) {
				$types[] = $type;
			}
		}

		return $types;
	}
}
