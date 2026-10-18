<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Control;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * The "Forms > Fields" controls shared by the WooCommerce Cart, Checkout and My Account widgets.
 */
class Woo_Form_Fields implements Style_Fragment {

	const ALIAS = 'fields';

	const LABEL = 'Form inputs and selects; fields:focus styles them while focused';

	const FOCUS_STATE = 'focus';

	const DEFAULTS = [
		'font-size' => '14px',
		'background-color' => '#f9fafa',
		'color' => '#69727d',
	];

	public static function target( string $selector ): Style_Target {
		return Style_Target::make( self::ALIAS )
			->label( self::LABEL )
			->selector( $selector )
			->defaults( self::DEFAULTS )
			->states( self::FOCUS_STATE )
			->with( new self() );
	}

	public function apply_to( Style_Target $target ): void {
		$target
			->with( Typography_Group::from_prefix( 'forms_field_typography' ) )
			->with( Border_Group::from_prefix( 'forms_fields_border' ) )
			->with( Background_Group::from_prefix( 'forms_fields_normal_background' ) )
			->with( Background_Group::from_prefix( 'forms_fields_focus_background', self::FOCUS_STATE ) )
			->with( Box_Shadow_Group::from_prefix( 'forms_fields_normal_box_shadow' ) )
			->with( Box_Shadow_Group::from_prefix( 'forms_fields_focus_box_shadow', self::FOCUS_STATE ) )
			->bind( 'color', V3_Control::bind_to( 'forms_fields_normal_color' ) )
			->bind( 'color', V3_Control::bind_to( 'forms_fields_focus_color' ), self::FOCUS_STATE )
			->bind( 'border-color', V3_Control::bind_to( 'forms_fields_focus_border_color' ), self::FOCUS_STATE )
			->bind( 'border-radius', V3_Control::bind_to( 'forms_fields_border_radius' )->responsive() )
			->bind( 'padding', V3_Control::bind_to( 'forms_fields_padding' )->responsive() );
	}
}
