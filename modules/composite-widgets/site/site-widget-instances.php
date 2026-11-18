<?php

namespace Elementor\Modules\CompositeWidgets\Site;

use Elementor\Modules\AtomicWidgets\Elements\Base\Widget_Markers;
use Elementor\Modules\CompositeWidgets\Definitions\Widget_Definition;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * A copy of a site widget is recognised by its root marker: only site widgets use the `site` id namespace.
 */
class Site_Widget_Instances {
	public static function is_site_widget_root( array $element_data ): bool {
		$marker = Widget_Markers::sanitize_widget( $element_data[ Widget_Markers::WIDGET_KEY ] ?? null );

		return ! empty( $marker ) && Widget_Definition::is_site_namespace( $marker['id'] );
	}
}
