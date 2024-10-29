<?php
namespace Elementor\Modules\AtomicWidgets\Styles;

use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Linked_Dimensions_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

class Style_Schema {
	public static function get() {
		return array_merge(
			self::get_size_props(),
			self::get_position_props(),
			self::get_typography_props(),
			self::get_spacing_props()
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
		];
	}

	private static function get_position_props() {
		return [
			'z-index' => Number_Prop_Type::make(),
		];
	}

	private static function get_typography_props() {
		return [
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
		];
	}

	private static function get_spacing_props() {
		return [
			'padding' => Linked_Dimensions_Prop_Type::make(),
			'margin' => Linked_Dimensions_Prop_Type::make(),
		];
	}
}
