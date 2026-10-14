<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Custom_Icon_Svg;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

interface Svg_Converter {
	public function supports( array $tab ): bool;

	public function convert( array $tab, string $icon_value ): string;
}
