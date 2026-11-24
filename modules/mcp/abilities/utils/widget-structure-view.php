<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Modules\AtomicWidgets\Elements\Base\Widget_Markers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * The atomic widget markers in the page structure: `widget` on an instance root, `part` and `slot` on its atoms.
 */
class Widget_Structure_View {

	const UNAVAILABLE_KEY = 'unavailable';
	const UNAVAILABLE_PRO_REQUIRED = 'pro_required';

	public static function add_markers( array $skeleton, array $node ): array {
		$widget = Widget_Markers::sanitize_widget( $node[ Widget_Markers::WIDGET_KEY ] ?? null );

		if ( ! empty( $widget ) ) {
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

	/**
	 * Only the root, flagged: the copy is hidden on the page, so its children and content aren't returned.
	 */
	public static function build_unavailable_site_widget( array $skeleton, array $node ): array {
		unset( $skeleton['elements'] );

		$skeleton[ Widget_Markers::WIDGET_KEY ] = [
			'id' => Widget_Markers::sanitize_widget( $node[ Widget_Markers::WIDGET_KEY ] )['id'],
			self::UNAVAILABLE_KEY => self::UNAVAILABLE_PRO_REQUIRED,
		];

		return $skeleton;
	}
}
