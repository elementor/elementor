<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Atomic_Container_Presentation {

	const SHELL_WIDTH = '100%';

	public static function to_map(): array {
		return [
			'width' => self::SHELL_WIDTH,
		];
	}

	public static function to_css_string(): string {
		return 'width: ' . self::SHELL_WIDTH . ';';
	}
}
