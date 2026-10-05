<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Advanced_Style_Fragments {

	const HOVER_STATE = 'hover';

	const CUSTOM_WIDTH_VALUE = 'initial';
	const OFFSET_START = 'start';
	const OFFSET_END = 'end';
	const CLASSIC_BACKGROUND = 'classic';
	const CUSTOM_FLEX_SIZE = 'custom';

	public static function wrapper(): Style_Target {
		$target = Style_Target::make( 'Widget wrapper (Advanced tab: spacing, size, position, background, border)' );

		$target
			->bind( 'margin', V3_Control::bind_to( '_margin' )->responsive() )
			->bind( 'padding', V3_Control::bind_to( '_padding' )->responsive() )
			->bind( 'width', V3_Control::bind_to( '_element_custom_width' )->responsive()->set_dependencies( Style_Bindings::eq( '_element_width', self::CUSTOM_WIDTH_VALUE ) ) )
			->bind( 'position', V3_Control::bind_to( '_position' ) )
			->bind( 'inset-inline-start', self::offset( '_offset_x', '_offset_orientation_h', self::OFFSET_START ) )
			->bind( 'inset-inline-end', self::offset( '_offset_x_end', '_offset_orientation_h', self::OFFSET_END ) )
			->bind( 'inset-block-start', self::offset( '_offset_y', '_offset_orientation_v', self::OFFSET_START ) )
			->bind( 'inset-block-end', self::offset( '_offset_y_end', '_offset_orientation_v', self::OFFSET_END ) )
			->bind( 'z-index', V3_Control::bind_to( '_z_index' )->responsive() )
			->bind( 'flex', V3_Control::bind_to( '_flex_grow' )->responsive()->part( 'flexGrow' )->set_dependencies( Style_Bindings::eq( '_flex_size', self::CUSTOM_FLEX_SIZE ) ) )
			->bind( 'flex', V3_Control::bind_to( '_flex_shrink' )->responsive()->part( 'flexShrink' )->set_dependencies( Style_Bindings::eq( '_flex_size', self::CUSTOM_FLEX_SIZE ) ) )
			->bind( 'align-self', V3_Control::bind_to( '_flex_align_self' )->responsive() )
			->bind( 'background', V3_Control::bind_to( '_background_color' )->set_dependencies( Style_Bindings::eq( '_background_background', self::CLASSIC_BACKGROUND ) ) )
			->bind( 'background', V3_Control::bind_to( '_background_hover_color' )->set_dependencies( Style_Bindings::eq( '_background_hover_background', self::CLASSIC_BACKGROUND ) ), self::HOVER_STATE )
			->bind( 'border-radius', V3_Control::bind_to( '_border_radius' )->responsive() )
			->bind( 'border-radius', V3_Control::bind_to( '_border_radius_hover' )->responsive(), self::HOVER_STATE );

		Style_Bindings::border( $target, '_border' );
		Style_Bindings::border( $target, '_border_hover', self::HOVER_STATE );
		Style_Bindings::box_shadow( $target, '_box_shadow' );
		Style_Bindings::box_shadow( $target, '_box_shadow_hover', self::HOVER_STATE );

		return $target;
	}

	private static function offset( string $key, string $orientation_key, string $orientation ): V3_Control {
		return V3_Control::bind_to( $key )->responsive()->set_dependencies( Style_Bindings::eq( $orientation_key, $orientation ) );
	}
}
