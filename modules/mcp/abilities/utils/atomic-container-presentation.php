<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Mirrors the `.e-con` rule in assets/dev/scss/frontend/_container.scss that every atomic element
 * renders with. Atomic elements never get `.e-flex`, so its mobile `--width` rule doesn't apply, and
 * their own `width` styles render as plain `width` with higher specificity.
 */
class Atomic_Container_Presentation {

	const SHELL_SELECTOR = '.e-con';

	const SHELL_WIDTH = '100%';

	const WIDGET_EL_TYPE = 'widget';

	public static function applies_to( array $element_config ): bool {
		$is_atomic = ! empty( $element_config['atomic'] );
		$is_element = self::WIDGET_EL_TYPE !== ( $element_config['elType'] ?? self::WIDGET_EL_TYPE );

		return $is_atomic && $is_element;
	}

	public static function to_map(): array {
		return [
			'width' => self::SHELL_WIDTH,
		];
	}

	public static function to_css_string(): string {
		return self::SHELL_SELECTOR . '{--width:' . self::SHELL_WIDTH . ';width:var(--width);}';
	}
}
