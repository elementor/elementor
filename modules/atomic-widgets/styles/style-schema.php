<?php
namespace Elementor\Modules\AtomicWidgets\Styles;

use Elementor\Modules\AtomicWidgets\PropTypes\Background_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Box_Shadow_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Border_Radius_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Border_Width_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Linked_Dimensions_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Stroke_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Gap_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Style_Schema {
	public static function get() {
		return array_merge(
			self::get_size_props(),
			self::get_position_props(),
			self::get_typography_props(),
			self::get_spacing_props(),
			self::get_border_props(),
			self::get_background_props(),
			self::get_effects_props(),
			self::get_layout_props(),
			self::get_alignment_props(),
		);
	}

	private static function get_size_props() {
		return [
			'width' => Size_Prop_Type::make(),
			'height' => Size_Prop_Type::make(),
			'min-width' => Size_Prop_Type::make(),
			'min-height' => Size_Prop_Type::make(),
			'max-width' => Size_Prop_Type::make(),
			'max-height' => Size_Prop_Type::make(),
			'overflow' => String_Prop_Type::make()->enum([
				'visible',
				'hidden',
				'auto',
			]),
		];
	}

	private static function get_position_props() {
		return [
			'position' => String_Prop_Type::make()->enum([
				'static',
				'relative',
				'absolute',
				'fixed',
			]),
			'top' => Size_Prop_Type::make(),
			'right' => Size_Prop_Type::make(),
			'bottom' => Size_Prop_Type::make(),
			'left' => Size_Prop_Type::make(),
			'z-index' => Number_Prop_Type::make(),
		];
	}

	private static function get_typography_props() {
		return [
			'font-family' => String_Prop_Type::make(),
			'font-weight' => String_Prop_Type::make()->enum([
				'100',
				'200',
				'300',
				'400',
				'500',
				'600',
				'700',
				'800',
				'900',
				'normal',
				'bold',
				'bolder',
				'lighter',
			]),
			'font-size' => Size_Prop_Type::make(),
			'color' => Color_Prop_Type::make(),
			'letter-spacing' => Size_Prop_Type::make(),
			'word-spacing' => Size_Prop_Type::make(),
			'text-align' => String_Prop_Type::make()->enum([
				'left',
				'center',
				'right',
				'justify',
			]),
			'font-style' => String_Prop_Type::make()->enum([
				'normal',
				'italic',
				'oblique',
			]),
			// TODO: validate text-decoration in more specific way [EDS-524]
			'text-decoration' => String_Prop_Type::make(),
			'text-transform' => String_Prop_Type::make()->enum([
				'none',
				'capitalize',
				'uppercase',
				'lowercase',
			]),
			'direction' => String_Prop_Type::make()->enum([
				'ltr',
				'rtl',
			]),
			'-webkit-text-stroke' => Stroke_Prop_Type::make(),
		];
	}

	private static function get_spacing_props() {
		return [
			'padding' => Linked_Dimensions_Prop_Type::make(),
			'margin' => Linked_Dimensions_Prop_Type::make(),
		];
	}

	private static function get_border_props() {
		return [
			'border-radius' => Union_Prop_Type::make()->add_prop_type(
				Size_Prop_Type::make()
			)->add_prop_type(
				Border_Radius_Prop_Type::make()
			),
			'border-width' => Union_Prop_Type::make()->add_prop_type( Size_Prop_Type::make() )->add_prop_type( Border_Width_Prop_Type::make() ),
			'border-color' => Color_Prop_Type::make(),
			'border-style' => String_Prop_Type::make()->enum([
				'none',
				'hidden',
				'dotted',
				'dashed',
				'solid',
				'double',
				'groove',
				'ridge',
				'inset',
				'outset',
			]),
		];
	}

	private static function get_background_props() {
		return [
			'background' => Background_Prop_Type::make(),
		];
	}

	private static function get_effects_props() {
		return [
			'box-shadow' => Box_Shadow_Prop_Type::make(),
		];
	}

	private static function get_layout_props() {
		return [
			'display' => String_Prop_Type::make()->enum([
				'block',
				'inline',
				'inline-block',
				'flex',
				'inline-flex',
				'grid',
				'inline-grid',
				'flow-root',
				'none',
				'contents',
			]),
			'flex-direction' => String_Prop_Type::make()->enum([
				'row',
				'row-reverse',
				'column',
				'column-reverse',
			]),
			'gap' => Gap_Prop_Type::make(),
			'flex-wrap' => String_Prop_Type::make()->enum([
				'wrap',
				'nowrap',
				'wrap-reverse',
			]),
			'flex-grow' => Number_Prop_Type::make(),
			'flex-shrink' => Number_Prop_Type::make(),
			'flex-basis' => Size_Prop_Type::make(),
		];
	}

	private static function get_alignment_props() {
		return [
			'justify-content' => String_Prop_Type::make()->enum([
				'center',
				'start',
				'end',
				'flex-start',
				'flex-end',
				'left',
				'right',
				'normal',
				'space-between',
				'space-around',
				'space-evenly',
				'stretch',
			]),
			'align-items' => String_Prop_Type::make()->enum([
				'normal',
				'stretch',
				'center',
				'start',
				'end',
				'flex-start',
				'flex-end',
				'self-start',
				'self-end',
				'anchor-center',
			]),
			'align-self' => String_Prop_Type::make()->enum([
				'auto',
				'normal',
				'center',
				'start',
				'end',
				'self-start',
				'self-end',
				'flex-start',
				'flex-end',
				'anchor-center',
				'baseline',
				'first baseline',
				'last baseline',
				'stretch',
			]),
			'order' => Number_Prop_Type::make(),
		];
	}
}
