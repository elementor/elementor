<?php
namespace Elementor\Modules\AtomicWidgets\Styles;

use Elementor\Modules\AtomicWidgets\PropTypes\Linked_Dimensions_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\String_Prop_Type;

class Style_Schema {
	public static function get() {
		return [
			'font-style' => String_Prop_Type::make()->enum([
				'normal',
				'italic',
				'oblique',
			]),
			'font-size' => Size_Prop_Type::make(),
			'width' => Size_Prop_Type::make(),
			'height' => Size_Prop_Type::make(),
			'min-width' => Size_Prop_Type::make(),
			'min-height' => Size_Prop_Type::make(),
			'max-width' => Size_Prop_Type::make(),
			'max-height' => Size_Prop_Type::make(),
			'z-index' => Number_Prop_Type::make(),
			'font-weight' => String_Prop_Type::make()->enum([
				'400',
				'500',
				'600',
				'700',
				'800',
				'900',
			]),
			'color' => String_Prop_Type::make(),
			'line-height' => Number_Prop_Type::make(),
			'letter-spacing' => Size_Prop_Type::make(),
			'word-spacing' => Size_Prop_Type::make(),
			'text-align' => String_Prop_Type::make()->enum([
				'left',
				'center',
				'right',
				'justify',
			]),
			'text-transform' => String_Prop_Type::make()->enum([
				'none',
				'capitalize',
				'uppercase',
				'lowercase',
			]),
			'text-decoration' => String_Prop_Type::make()->enum([
				'none',
				'underline',
				'overline',
				'line-through',
			]),
			'padding' => Linked_Dimensions_Prop_Type::make(),
			'margin' => Linked_Dimensions_Prop_Type::make(),
		];
	}
}
