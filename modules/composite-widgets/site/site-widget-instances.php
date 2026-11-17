<?php

namespace Elementor\Modules\CompositeWidgets\Site;

use Elementor\Modules\AtomicWidgets\Elements\Base\Widget_Markers;
use Elementor\Modules\CompositeWidgets\Definitions\Widget_Definition;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * A copy of a site widget is recognised by its root marker: only site widgets use the `site/` id namespace.
 */
class Site_Widget_Instances {
	public static function remove( array $elements ): array {
		$kept = [];

		foreach ( $elements as $element ) {
			if ( ! is_array( $element ) ) {
				$kept[] = $element;
				continue;
			}

			if ( self::is_site_widget_root( $element ) ) {
				continue;
			}

			if ( is_array( $element['elements'] ?? null ) ) {
				$element['elements'] = self::remove( $element['elements'] );
			}

			$kept[] = $element;
		}

		return $kept;
	}

	public static function is_site_widget_root( array $element ): bool {
		$marker = Widget_Markers::sanitize_widget( $element[ Widget_Markers::WIDGET_KEY ] ?? null );

		return ! empty( $marker ) && 0 === strpos( $marker['id'], Widget_Definition::SITE_ID_PREFIX );
	}
}
