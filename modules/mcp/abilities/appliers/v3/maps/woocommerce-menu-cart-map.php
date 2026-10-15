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

$toggle = Style_Target::make( 'toggle' )
	->label( 'Cart toggle button in the header' )
	->selector( '.elementor-menu-cart__toggle .elementor-button' )
	->with( Typography_Group::from_prefix( 'toggle_button_typography' ) )
	->with( Box_Shadow_Group::from_prefix( 'toggle_button_normal_box_shadow' ) )
	->with( Box_Shadow_Group::from_prefix( 'toggle_button_hover_box_shadow', $hover ) )
	->bind( 'color', V3_Control::bind_to( 'toggle_button_text_color' ) )
	->bind( 'color', V3_Control::bind_to( 'toggle_button_hover_text_color' ), $hover )
	->bind( 'background', V3_Control::bind_to( 'toggle_button_background_color' ) )
	->bind( 'background', V3_Control::bind_to( 'toggle_button_hover_background_color' ), $hover )
	->bind( 'border-color', V3_Control::bind_to( 'toggle_button_border_color' ) )
	->bind( 'border-color', V3_Control::bind_to( 'toggle_button_hover_border_color' ), $hover )
	->bind( 'border-width', V3_Control::bind_to( 'toggle_button_border_width' ) )
	->bind( 'border-radius', V3_Control::bind_to( 'toggle_button_border_radius' ) )
	->bind( 'padding', V3_Control::bind_to( 'toggle_button_padding' )->responsive() )
	->bind( 'gap', V3_Control::bind_to( 'toggle_icon_spacing' )->responsive() );

$toggle_icon = Style_Target::make( 'toggle-icon' )
	->label( 'Cart icon inside the toggle; font-size is the icon size' )
	->selector( '.elementor-menu-cart__toggle .elementor-button-icon' )
	->bind( 'color', V3_Control::bind_to( 'toggle_button_icon_color' ) )
	->bind( 'color', V3_Control::bind_to( 'toggle_button_hover_icon_color' ), $hover )
	->bind( 'font-size', V3_Control::bind_to( 'toggle_icon_size' )->responsive() );

$indicator = Style_Target::make( 'indicator' )
	->label( 'Item count badge on the cart icon' )
	->selector( '.elementor-button-icon-qty' )
	->bind( 'color', V3_Control::bind_to( 'items_indicator_text_color' ) )
	->bind( 'background', V3_Control::bind_to( 'items_indicator_background_color' ) );

$cart = Style_Target::make( 'cart' )
	->label( 'Cart panel (side cart or mini cart)' )
	->selector( '.elementor-menu-cart__main' )
	->with( Box_Shadow_Group::from_prefix( 'cart_box_shadow' ) )
	->bind( 'background', V3_Control::bind_to( 'background_color' ) )
	->bind( 'border-style', V3_Control::bind_to( 'border_type' ) )
	->bind( 'border-width', V3_Control::bind_to( 'border_width' )->responsive() )
	->bind( 'border-color', V3_Control::bind_to( 'border_color' ) )
	->bind( 'border-radius', V3_Control::bind_to( 'border_radius' )->responsive() )
	->bind( 'padding', V3_Control::bind_to( 'cart_padding' )->responsive() );

$product_title = Style_Target::make( 'product-title' )
	->label( 'Product names in the cart' )
	->selector( '.elementor-menu-cart__product-name a' )
	->with( Typography_Group::from_prefix( 'product_title_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'product_title_color' ) )
	->bind( 'color', V3_Control::bind_to( 'product_title_hover_color' ), $hover );

$product_price = Style_Target::make( 'product-price' )
	->label( 'Product prices in the cart' )
	->selector( '.elementor-menu-cart__product-price' )
	->with( Typography_Group::from_prefix( 'product_price_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'product_price_color' ) );

$subtotal = Style_Target::make( 'subtotal' )
	->label( 'Cart subtotal' )
	->selector( '.elementor-menu-cart__subtotal' )
	->with( Typography_Group::from_prefix( 'subtotal_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'subtotal_color' ) )
	->bind( 'text-align', V3_Control::bind_to( 'subtotal_alignment' )->responsive() );

$view_cart_button = Style_Target::make( 'view-cart-button' )
	->label( '"View cart" button in the cart footer' )
	->selector( '.elementor-button--view-cart' )
	->with( Typography_Group::from_prefix( 'view_cart_buttons_typography' ) )
	->with( Border_Group::from_prefix( 'view_cart_border' ) )
	->with( Box_Shadow_Group::from_prefix( 'view_cart_button_box_shadow' ) )
	->bind( 'color', V3_Control::bind_to( 'view_cart_button_text_color' ) )
	->bind( 'color', V3_Control::bind_to( 'view_cart_button_hover_text_color' ), $hover )
	->bind( 'background', V3_Control::bind_to( 'view_cart_button_background_color' ) )
	->bind( 'background', V3_Control::bind_to( 'view_cart_button_hover_background' ), $hover )
	->bind( 'border-color', V3_Control::bind_to( 'view_cart_button_border_hover_color' ), $hover )
	->bind( 'border-radius', V3_Control::bind_to( 'view_cart_button_border_radius' )->responsive() )
	->bind( 'padding', V3_Control::bind_to( 'view_cart_button_padding' )->responsive() );

$checkout_button = Style_Target::make( 'checkout-button' )
	->label( '"Checkout" button in the cart footer' )
	->selector( '.elementor-button--checkout' )
	->with( Typography_Group::from_prefix( 'cart_checkout_button_typography' ) )
	->with( Border_Group::from_prefix( 'checkout_border' ) )
	->with( Box_Shadow_Group::from_prefix( 'view_checkout_button_box_shadow' ) )
	->bind( 'color', V3_Control::bind_to( 'checkout_button_text_color' ) )
	->bind( 'color', V3_Control::bind_to( 'checkout_button_hover_text_color' ), $hover )
	->bind( 'background', V3_Control::bind_to( 'checkout_button_background_color' ) )
	->bind( 'background', V3_Control::bind_to( 'checkout_button_hover_background' ), $hover )
	->bind( 'border-color', V3_Control::bind_to( 'checkout_button_border_hover_color' ), $hover )
	->bind( 'border-radius', V3_Control::bind_to( 'view_checkout_button_border_radius' )->responsive() )
	->bind( 'padding', V3_Control::bind_to( 'view_checkout_button_padding' )->responsive() );

return V3_Widget_Map::make( 'woocommerce-menu-cart' )
	->description( 'Header cart icon with item count and subtotal that opens a side cart or mini cart.' )
	->settings( [
		'icon' => V3_Setting::bind_to( 'icon' )->enum_from_control(),
		'items_indicator' => V3_Setting::bind_to( 'items_indicator' )->enum_from_control(),
		'show_subtotal' => V3_Setting::bind_to( 'show_subtotal' )->switcher(),
		'cart_type' => V3_Setting::bind_to( 'cart_type' )->enum_from_control(),
		'open_cart' => V3_Setting::bind_to( 'open_cart' )->enum_from_control(),
		'view_cart_button_show' => V3_Setting::bind_to( 'view_cart_button_show' )->switcher(),
		'checkout_button_show' => V3_Setting::bind_to( 'checkout_button_show' )->switcher(),
	] )
	->default_target( $toggle )
	->targets( $toggle_icon, $indicator, $cart, $product_title, $product_price, $subtotal, $view_cart_button, $checkout_button );
