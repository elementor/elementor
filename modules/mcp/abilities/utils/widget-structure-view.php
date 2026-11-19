<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Modules\AtomicWidgets\Elements\Base\Widget_Markers;
use Elementor\Modules\CompositeWidgets\Definitions\Widget_Definition;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * The composite widget markers in the page structure: `widget` on an instance root, `part` and `slot` on its atoms.
 * Without site widget access a site widget copy is hidden on the page, so only its root is returned, flagged.
 */
class Widget_Structure_View {

	const UNAVAILABLE_KEY = 'unavailable';
	const UNAVAILABLE_PRO_REQUIRED = 'pro_required';

	public static function is_hidden_site_widget( array $node, bool $can_display_site_widgets ): bool {
		$widget_id = $node[ Widget_Markers::WIDGET_KEY ]['id'] ?? null;

		return ! $can_display_site_widgets && is_string( $widget_id ) && Widget_Definition::is_site_namespace( $widget_id );
	}

	public static function build_hidden_site_widget( array $skeleton, array $node ): array {
		unset( $skeleton['elements'] );

		$skeleton[ Widget_Markers::WIDGET_KEY ] = [
			'id' => $node[ Widget_Markers::WIDGET_KEY ]['id'],
			self::UNAVAILABLE_KEY => self::UNAVAILABLE_PRO_REQUIRED,
		];

		return $skeleton;
	}

	public static function add_markers( array $skeleton, array $node ): array {
		$widget = $node[ Widget_Markers::WIDGET_KEY ] ?? null;

		if ( is_array( $widget ) && isset( $widget['id'], $widget['version'] ) ) {
			$skeleton[ Widget_Markers::WIDGET_KEY ] = [
				'id' => $widget['id'],
				'version' => $widget['version'],
			];
		}

		if ( is_string( $node[ Widget_Markers::PART_KEY ] ?? null ) ) {
			$skeleton[ Widget_Markers::PART_KEY ] = $node[ Widget_Markers::PART_KEY ];
		}

		if ( ! empty( $node[ Widget_Markers::SLOT_KEY ] ) ) {
			$skeleton[ Widget_Markers::SLOT_KEY ] = true;
		}

		return $skeleton;
	}
}
