<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Every atomic element (not widget) renders with the `.e-con` class. These are the declarations
 * from assets/dev/scss/frontend/_container.scss that affect atomic elements, kept in sync by a
 * PHPUnit check.
 *
 * The kit's Container Padding (10px by default) is left out on purpose: `.e-con` applies it as
 * inline padding only, the base padding of most atomic elements overrides it, and the value is
 * user-editable per breakpoint so it can't be hardcoded here.
 */
class Atomic_Container_Presentation {

	const WIDGET_EL_TYPE = 'widget';

	const SHELL_STYLES = [
		'position' => 'relative',
		'width' => '100%',
		'min-width' => '0',
	];

	const SHELL_CSS = '.e-con{position:relative;width:100%;min-width:0;}';

	const DOCUMENT_ROOT_SHELL_CSS = '.e-con{position:relative;width:100%;min-width:0;margin-inline-start:auto;margin-inline-end:auto;max-width:100%;}';

	public static function applies_to( array $element_config ): bool {
		$is_atomic = ! empty( $element_config['atomic'] );
		$is_element = self::WIDGET_EL_TYPE !== ( $element_config['elType'] ?? self::WIDGET_EL_TYPE );

		return $is_atomic && $is_element;
	}

	public static function to_css_string( bool $is_document_root ): string {
		return $is_document_root ? self::DOCUMENT_ROOT_SHELL_CSS : self::SHELL_CSS;
	}
}
