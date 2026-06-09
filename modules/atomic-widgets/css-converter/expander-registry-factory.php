<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter;

use Elementor\Modules\AtomicWidgets\CssConverter\Expanders\Background_Shorthand_Expander;
use Elementor\Modules\AtomicWidgets\CssConverter\Expanders\Border_Shorthand_Expander;
use Elementor\Modules\AtomicWidgets\CssConverter\Expanders\Physical_To_Logical_Expander;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Expander_Registry_Factory {
	const BORDER_SIDES = [ 'top', 'right', 'bottom', 'left' ];

	public static function create(): Expander_Registry {
		$schema = Style_Schema::get_style_schema();
		$style_enum = $schema['border-style']->get_enum();

		$registry = ( new Expander_Registry() )
			->register( new Physical_To_Logical_Expander() )
			->register( new Background_Shorthand_Expander() )
			->register( new Border_Shorthand_Expander( 'border', self::border_longhands( '' ), $style_enum ) );

		foreach ( self::BORDER_SIDES as $side ) {
			$registry->register(
				new Border_Shorthand_Expander( "border-$side", self::border_longhands( "$side-" ), $style_enum )
			);
		}

		return $registry;
	}

	/**
	 * Role -> longhand property name for the all-sides (`border`, infix '') or per-side (e.g. 'top-')
	 * shorthand. Per-side style/color have no converter and route to custom_css.
	 *
	 * @return array<string, string>
	 */
	private static function border_longhands( string $infix ): array {
		return [
			Border_Shorthand_Expander::ROLE_WIDTH => "border-{$infix}width",
			Border_Shorthand_Expander::ROLE_STYLE => "border-{$infix}style",
			Border_Shorthand_Expander::ROLE_COLOR => "border-{$infix}color",
		];
	}
}
