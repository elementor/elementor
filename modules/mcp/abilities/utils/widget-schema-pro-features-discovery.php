<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

interface Widget_Schema_Pro_Features_Discovery {

	public static function supports_widget( string $widget_type ): bool;

	public static function for_widget_schema(): \WP_Error;
}
