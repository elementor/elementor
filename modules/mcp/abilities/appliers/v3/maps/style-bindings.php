<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\AtomicWidgets\PropDependencies\Manager as Dependency_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Style_Bindings {

	public static function eq( string $setting, string $value ): array {
		return Dependency_Manager::make()
			->where( [
				'operator' => 'eq',
				'path' => [ $setting ],
				'value' => $value,
			] )
			->get();
	}

	public static function typography( Style_Target $target, string $prefix, array $exclude = [] ): Style_Target {
		$dependencies = self::eq( $prefix . '_typography', 'custom' );
		$fields = [
			'font-family' => V3_Control::bind_to( $prefix . '_font_family' )->set_dependencies( $dependencies ),
			'font-size' => V3_Control::bind_to( $prefix . '_font_size' )->responsive()->set_dependencies( $dependencies ),
			'font-weight' => V3_Control::bind_to( $prefix . '_font_weight' )->set_dependencies( $dependencies ),
			'text-transform' => V3_Control::bind_to( $prefix . '_text_transform' )->set_dependencies( $dependencies ),
			'font-style' => V3_Control::bind_to( $prefix . '_font_style' )->set_dependencies( $dependencies ),
			'text-decoration' => V3_Control::bind_to( $prefix . '_text_decoration' )->set_dependencies( $dependencies ),
			'line-height' => V3_Control::bind_to( $prefix . '_line_height' )->responsive()->set_dependencies( $dependencies ),
			'letter-spacing' => V3_Control::bind_to( $prefix . '_letter_spacing' )->responsive()->set_dependencies( $dependencies ),
			'word-spacing' => V3_Control::bind_to( $prefix . '_word_spacing' )->responsive()->set_dependencies( $dependencies ),
		];

		foreach ( $exclude as $prop ) {
			unset( $fields[ $prop ] );
		}

		foreach ( $fields as $prop => $control ) {
			$target->bind( $prop, $control );
		}

		return $target;
	}

	public static function border( Style_Target $target, string $prefix, string $state = Style_Target::DEFAULT_STATE ): Style_Target {
		return $target
			->bind( 'border-style', V3_Control::bind_to( $prefix . '_border' ), $state )
			->bind( 'border-width', V3_Control::bind_to( $prefix . '_width' )->responsive(), $state )
			->bind( 'border-color', V3_Control::bind_to( $prefix . '_color' ), $state );
	}

	public static function box_shadow( Style_Target $target, string $prefix, string $state = Style_Target::DEFAULT_STATE ): Style_Target {
		return $target->bind(
			'box-shadow',
			V3_Control::bind_to( $prefix . '_box_shadow' )->set_dependencies( self::eq( $prefix . '_box_shadow_type', 'yes' ) ),
			$state
		);
	}
}
