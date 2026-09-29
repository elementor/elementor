<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

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
		return self::SHELL_SELECTOR . '{width:' . self::SHELL_WIDTH . ';}';
	}
}
