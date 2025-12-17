<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Prop_Types_Mapping;
use Elementor\Modules\AtomicWidgets\PropTypes\Background_Image_Overlay_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Background_Overlay_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Background_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Box_Shadow_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Border_Radius_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Border_Width_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Dimensions_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Filters\Backdrop_Filter_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Filters\Filter_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Layout_Direction_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Position_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Stroke_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Transform\Transform_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Transition_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Flex_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropDependencies\Manager as Dependency_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Style_Schema {
	public static function get() {
		return apply_filters( 'elementor/atomic-widgets/styles/schema', static::get_style_schema() );
	}

	public static function get_style_schema(): array {
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
			'width' => Size_Prop_Type::make()->description( 'The width of the element' ),
			'height' => Size_Prop_Type::make()->description( 'The height of the element' ),
			'min-width' => Size_Prop_Type::make()->description( 'The minimum width of the element' ),
			'min-height' => Size_Prop_Type::make()->description( 'The minimum height of the element' ),
			'max-width' => Size_Prop_Type::make()->description( 'The maximum width of the element' ),
			'max-height' => Size_Prop_Type::make()->description( 'The maximum height of the element' ),
			'overflow' => String_Prop_Type::make()->enum( [
				'visible',
				'hidden',
				'auto',
			] )->description( 'The overflow CSS property. CSS values: visible, hidden, auto' ),
			'aspect-ratio' => String_Prop_Type::make()->description( 'Equivalent to CSS aspect-ration property' ),
			'object-fit' => String_Prop_Type::make()->enum( [
				'fill',
				'cover',
				'contain',
				'none',
				'scale-down',
			] )->description( 'The object-fit CSS. CSS values: fill, cover, contain, none, scale-down' ),
			'object-position' => Union_Prop_Type::make()
				->add_prop_type( String_Prop_Type::make()->enum( Position_Prop_Type::get_position_enum_values() ) )
				->add_prop_type( Position_Prop_Type::make() )
				->set_dependencies(
					Dependency_Manager::make( Dependency_Manager::RELATION_AND )
					->where( [
						'operator' => 'ne',
						'path' => [ 'object-fit' ],
						'value' => 'fill',
					] )
					->where( [
						'operator' => 'exists',
						'path' => [ 'object-fit' ],
					] )
					->get()
				),
		];
	}

	private static function get_position_props() {
		return [
			'position' => String_Prop_Type::make()->enum( [
				'static',
				'relative',
				'absolute',
				'fixed',
				'sticky',
			] )->description( 'The CSS position property specifies the type of positioning method used for an element (static, relative, absolute, fixed, or sticky).' ),
			'inset-block-start' => Size_Prop_Type::make()->description( 'Size PropType for the inset-block-start CSS property' ),
			'inset-inline-end' => Size_Prop_Type::make()->description( 'Size PropType for the inset-inline-end CSS property' ),
			'inset-block-end' => Size_Prop_Type::make()->description( 'Size PropType for the inset-block-end CSS property' ),
			'inset-inline-start' => Size_Prop_Type::make()->description( 'Size PropType for the inset-inline-start CSS property' ),
			'z-index' => Number_Prop_Type::make()
				->description( 'The z-index CSS property sets the z-order of a positioned element and its descendants or flex items. It specifies the stack order of elements.' ),
			'scroll-margin-top' => Size_Prop_Type::make()->units( Size_Constants::anchor_offset() ),
		];
	}

	private static function get_typography_props() {
		return [
			'font-family' => String_Prop_Type::make()->description( 'The font family of the text content.' ),
			'font-weight' => String_Prop_Type::make()->enum( [
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
			] )
				->description( 'The weight (or boldness) of the font. Values should match css font-weight specifications.' ),
			'font-size' => Size_Prop_Type::make()->units( Size_Constants::typography() )->description( 'The font size in Size PropType Format' ),
			'color' => Color_Prop_Type::make()
				->description( 'The text color, specified as a hex code, rgb(a), hsl(a), or a standard css color name.' ),
			'letter-spacing' => Size_Prop_Type::make()->units( Size_Constants::typography() )->description( 'The spacing between letters in Size PropType format' ),
			'word-spacing' => Size_Prop_Type::make()->units( Size_Constants::typography() )->description( 'The spacing between words in Size PropType format' ),
			'column-count' => Number_Prop_Type::make()->description( 'The number of columns the text content should be divided into.' ),
			'column-gap' => Size_Prop_Type::make()
				->set_dependencies(
					Dependency_Manager::make()
					->where( [
						'operator' => 'gte',
						'path' => [ 'column-count' ],
						'value' => 1,
					] )
					->get()
				),
			'line-height' => Size_Prop_Type::make()->units( Size_Constants::typography() )->description( 'The line height of the text content in Size PropType format' ),
			'text-align' => String_Prop_Type::make()->enum( [
				'start',
				'center',
				'end',
				'justify',
			] )
				->description( 'The horizontal alignment of the text content. Allowed values: start, center, end, justify.' ),
			'font-style' => String_Prop_Type::make()->enum( [
				'normal',
				'italic',
				'oblique',
			] )
			->description( 'The font style of the text content. CSS values: normal, italic, oblique' ),
			// TODO: validate text-decoration in more specific way [EDS-524]
			'text-decoration' => String_Prop_Type::make()
				->description( 'The text decoration style. CSS values like: none, underline, overline, line-through, blink, etc.' ),
			'text-transform' => String_Prop_Type::make()->enum( [
				'none',
				'capitalize',
				'uppercase',
				'lowercase',
			] )
				->description( 'Controls the capitalization of text. CSS values: none, capitalize, uppercase, lowercase' ),
			'direction' => String_Prop_Type::make()->enum( [
				'ltr',
				'rtl',
			] )->description( 'The text direction. CSS values: ltr (left to right), rtl (right to left)' ),
			'stroke' => Stroke_Prop_Type::make(),
			'all' => String_Prop_Type::make()->enum( [
				'initial',
				'inherit',
				'unset',
				'revert',
				'revert-layer',
			] )->description( 'The all CSS property. CSS values: initial, inherit, unset, revert, revert-layer' ),
			'cursor' => String_Prop_Type::make()->enum( [
				'pointer',
			] )
				->description( 'The type of cursor to be displayed when pointing over the element. E.g., pointer.' ),
		];
	}

	private static function get_spacing_props() {
		return [
			'padding' => Union_Prop_Type::make()
				->add_prop_type( Dimensions_Prop_Type::make_with_units( Size_Constants::spacing() ) )
				->add_prop_type(
					Size_Prop_Type::make()
						->units( Size_Constants::spacing() )
						->description( 'Padding css in Size PropType format' )
				),
			'margin' => Union_Prop_Type::make()
				->add_prop_type( Dimensions_Prop_Type::make_with_units( Size_Constants::spacing_margin() ) )
				->add_prop_type(
					Size_Prop_Type::make()
						->units( Size_Constants::spacing_margin() )
						->description( 'Margin css in Size PropType format' )
				),
		];
	}

	private static function get_border_props() {
		return [
			'border-radius' => Union_Prop_Type::make()
				->add_prop_type( Border_Radius_Prop_Type::make() )
				->add_prop_type( Size_Prop_Type::make()->units( Size_Constants::border() ) ),
			'border-width' => Union_Prop_Type::make()
				->add_prop_type( Border_Width_Prop_Type::make() )
				->add_prop_type( Size_Prop_Type::make()->units( Size_Constants::border() ) ),
			'border-color' => Color_Prop_Type::make()->description( 'The border color, specified as a hex code, rgb(a), hsl(a), or a standard css color name.' ),
			'border-style' => String_Prop_Type::make()->enum( [
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
			] )
				->description( 'The border style in CSS values' ),
			'outline-width' => Size_Prop_Type::make()
				->units( Size_Constants::border() )
				->description( 'The width of the outline in Size PropType format' ),
		];
	}

	private static function get_background_props() {
		// Background image overlay as an exception
		$background_prop_type = Background_Prop_Type::make();
		$bg_overlay_prop_type = $background_prop_type->get_shape_field( Background_Overlay_Prop_Type::get_key() );
		$bg_image_overlay_prop_type = $bg_overlay_prop_type->get_item_type()->get_prop_type( Background_Image_Overlay_Prop_Type::get_key() );
		Dynamic_Prop_Types_Mapping::make()->get_extended_schema( $bg_image_overlay_prop_type->get_shape() );
		return [
			'background' => $background_prop_type,
		];
	}

	private static function get_effects_props() {
		return [
			'mix-blend-mode' => String_Prop_Type::make()->enum( [
				'normal',
				'multiply',
				'screen',
				'overlay',
				'darken',
				'lighten',
				'color-dodge',
				'saturation',
				'color',
				'difference',
				'exclusion',
				'hue',
				'luminosity',
				'soft-light',
				'hard-light',
				'color-burn',
			] )->description( 'Applied as mix-blend mode css effect.' ),
			'box-shadow' => Box_Shadow_Prop_Type::make(),
			'opacity' => Size_Prop_Type::make()
				->description( 'The opacity of the element, specified as a percentage between 0 (fully transparent) and 100 (fully opaque).' )
				->units( Size_Constants::opacity() )
				->default_unit( Size_Constants::UNIT_PERCENT ),
			'filter' => Filter_Prop_Type::make(),
			'backdrop-filter' => Backdrop_Filter_Prop_Type::make(),
			'transform' => Transform_Prop_Type::make(),
			'transition' => Transition_Prop_Type::make(),
		];
	}

	private static function get_layout_props() {
		return [
			'display' => String_Prop_Type::make()->enum( [
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
			] )->description( 'The CSS display property defines the display behavior (the type of rendering box) of an element.' ),
			'flex-direction' => String_Prop_Type::make()
				->description( 'The direction of the contained items.' )
				->enum( [
					'row',
					'row-reverse',
					'column',
					'column-reverse',
				] ),
			'gap' => Union_Prop_Type::make()
				->add_prop_type( Layout_Direction_Prop_Type::make() )
				->add_prop_type( Size_Prop_Type::make()->units( Size_Constants::layout() ) ),
			'flex-wrap' => String_Prop_Type::make()->enum( [
				'wrap',
				'nowrap',
				'wrap-reverse',
			] )->description( 'Specifies whether the flex items should wrap or not. CSS values: wrap, nowrap, wrap-reverse' ),
			'flex' => Flex_Prop_Type::make(),
		];
	}

	private static function get_alignment_props() {
		return [
			'justify-content' => String_Prop_Type::make()->enum( [
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
			] )
			->description( 'Defines how the browser distributes space between and around content items along the main-axis of a flex container. CSS values: center, start, end, flex-start, flex-end, left, right, normal, space-between, space-around, space-evenly, stretch' ),
			'align-content' => String_Prop_Type::make()->enum( [
				'center',
				'start',
				'end',
				'space-between',
				'space-around',
				'space-evenly',
			] )
			->description( 'Aligns a flex container\'s lines within when there is extra space in the cross-axis. CSS values: center, start, end, space-between, space-around, space-evenly' ),
			'align-items' => String_Prop_Type::make()->enum( [
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
			] )->description( 'Defines the default behavior for how flex items are laid out along the cross axis on the current line. CSS values: normal, stretch, center, start, end, flex-start, flex-end, self-start, self-end, anchor-center' ),
			'align-self' => String_Prop_Type::make()->enum( [
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
			] )->description( 'Allows the default alignment (or the one specified by align-items) to be overridden for individual flex items. CSS values: auto, normal, center, start, end, self-start, self-end, flex-start, flex-end, anchor-center, baseline, first baseline, last baseline, stretch' ),
			'order' => Number_Prop_Type::make()->description( 'Specifies the order of the flex items. Items with lower order values are displayed first.' ),
		];
	}
}
