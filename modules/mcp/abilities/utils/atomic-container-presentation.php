<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Every atomic element (not widget) renders with the `.e-con` class. Its styles are resolved
 * by Atomic_Shell_Styles.
 */
class Atomic_Container_Presentation {

	const WIDGET_EL_TYPE = 'widget';

	public static function applies_to( array $element_config ): bool {
		$is_atomic = ! empty( $element_config['atomic'] );
		$is_element = self::WIDGET_EL_TYPE !== ( $element_config['elType'] ?? self::WIDGET_EL_TYPE );

		return $is_atomic && $is_element;
	}

	public static function to_map(): array {
		return Atomic_Shell_Styles::make()->to_map();
	}

	public static function to_css_string( bool $is_document_root = false ): string {
		return Atomic_Shell_Styles::make()->to_css_string( $is_document_root );
	}
}
