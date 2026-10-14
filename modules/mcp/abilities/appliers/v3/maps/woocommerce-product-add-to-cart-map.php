<?php

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Border_Group;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Box_Shadow_Group;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Typography_Group;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Control;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Setting;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$hover = 'hover';
$focus = 'focus';

$button = Style_Target::make( 'button' )
	->label( 'Add to cart button' )
	->selector( '.cart .button' )
	->with( Typography_Group::from_prefix( 'button_typography' ) )
	->with( Border_Group::from_prefix( 'button_border' ) )
	->bind( 'color', V3_Control::bind_to( 'button_text_color' ) )
	->bind( 'color', V3_Control::bind_to( 'button_text_color_hover' ), $hover )
	->bind( 'background', V3_Control::bind_to( 'button_bg_color' ) )
	->bind( 'background', V3_Control::bind_to( 'button_bg_color_hover' ), $hover )
	->bind( 'border-color', V3_Control::bind_to( 'button_border_color_hover' ), $hover )
	->bind( 'border-radius', V3_Control::bind_to( 'button_border_radius' ) )
	->bind( 'padding', V3_Control::bind_to( 'button_padding' ) );

$quantity = Style_Target::make( 'quantity' )
	->label( 'Quantity input; quantity:focus styles it while focused' )
	->selector( '.quantity .qty' )
	->states( $focus )
	->with( Typography_Group::from_prefix( 'quantity_typography' ) )
	->with( Border_Group::from_prefix( 'quantity_border' ) )
	->bind( 'color', V3_Control::bind_to( 'quantity_text_color' ) )
	->bind( 'color', V3_Control::bind_to( 'quantity_text_color_focus' ), $focus )
	->bind( 'background', V3_Control::bind_to( 'quantity_bg_color' ) )
	->bind( 'background', V3_Control::bind_to( 'quantity_bg_color_focus' ), $focus )
	->bind( 'border-color', V3_Control::bind_to( 'quantity_border_color_focus' ), $focus )
	->bind( 'border-radius', V3_Control::bind_to( 'quantity_border_radius' ) )
	->bind( 'padding', V3_Control::bind_to( 'quantity_padding' ) );

$view_cart = Style_Target::make( 'view-cart' )
	->label( '"View cart" link shown after adding' )
	->selector( '.added_to_cart' )
	->with( Typography_Group::from_prefix( 'view_cart_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'view_cart_color' ) );

return V3_Widget_Map::make( 'woocommerce-product-add-to-cart' )
	->description( 'Add to cart button with quantity input (and variation selects) for the current WooCommerce product.' )
	->settings( [
		'layout' => V3_Setting::bind_to( 'layout' )->enum_from_control(),
		'alignment' => V3_Setting::bind_to( 'alignment' )->enum_from_control(),
		'show_quantity' => V3_Setting::bind_to( 'show_quantity' )->switcher(),
	] )
	->default_target( $button )
	->targets( $quantity, $view_cart );
