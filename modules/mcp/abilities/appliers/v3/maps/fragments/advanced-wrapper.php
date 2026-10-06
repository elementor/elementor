<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Control;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Advanced tab controls shared by every `Widget_Common_Base` widget. Containers register
 * different keys and do not get this target.
 */
class Advanced_Wrapper implements Style_Fragment {

	const ALIAS = 'wrapper';

	const LABEL = 'Widget wrapper (Advanced tab: spacing, size, position, background, border)';

	const HOVER_STATE = 'hover';

	const OFFSET_START = 'start';

	const OFFSET_END = 'end';

	const CLASSIC_BACKGROUND = 'classic';

	public static function target(): Style_Target {
		return Style_Target::make( self::ALIAS )
			->label( self::LABEL )
			->with( new self() );
	}

	public function apply_to( Style_Target $target ): void {
		$target
			->bind( 'margin', V3_Control::bind_to( '_margin' )->responsive() )
			->bind( 'padding', V3_Control::bind_to( '_padding' )->responsive() )
			->bind( 'width', V3_Control::bind_to( '_element_custom_width' )->responsive() )
			->bind( 'position', V3_Control::bind_to( '_position' ) )
			->bind( 'inset-inline-start', self::offset( '_offset_x', '_offset_orientation_h', self::OFFSET_START ) )
			->bind( 'inset-inline-end', self::offset( '_offset_x_end', '_offset_orientation_h', self::OFFSET_END ) )
			->bind( 'inset-block-start', self::offset( '_offset_y', '_offset_orientation_v', self::OFFSET_START ) )
			->bind( 'inset-block-end', self::offset( '_offset_y_end', '_offset_orientation_v', self::OFFSET_END ) )
			->bind( 'z-index', V3_Control::bind_to( '_z_index' )->responsive() )
			->bind( 'flex', V3_Control::bind_to( '_flex_grow' )->responsive()->part( 'flexGrow' ) )
			->bind( 'flex', V3_Control::bind_to( '_flex_shrink' )->responsive()->part( 'flexShrink' ) )
			->bind( 'align-self', V3_Control::bind_to( '_flex_align_self' )->responsive() )
			->bind( 'background', V3_Control::bind_to( '_background_color' )->requires( [ '_background_background' => self::CLASSIC_BACKGROUND ] ) )
			->bind( 'background', V3_Control::bind_to( '_background_hover_color' )->requires( [ '_background_hover_background' => self::CLASSIC_BACKGROUND ] ), self::HOVER_STATE )
			->bind( 'border-radius', V3_Control::bind_to( '_border_radius' )->responsive() )
			->bind( 'border-radius', V3_Control::bind_to( '_border_radius_hover' )->responsive(), self::HOVER_STATE )
			->with( Border_Group::from_prefix( '_border' ) )
			->with( Border_Group::from_prefix( '_border_hover', self::HOVER_STATE ) )
			->with( Box_Shadow_Group::from_prefix( '_box_shadow' ) )
			->with( Box_Shadow_Group::from_prefix( '_box_shadow_hover', self::HOVER_STATE ) );
	}

	private static function offset( string $setting, string $orientation_setting, string $orientation ): V3_Control {
		return V3_Control::bind_to( $setting )->responsive()->requires( [ $orientation_setting => $orientation ] );
	}
}
