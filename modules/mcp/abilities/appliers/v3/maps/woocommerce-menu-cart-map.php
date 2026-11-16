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
	->label( 'Cart toggle' )
	->description( 'The button that opens the cart panel, with the cart icon, the item count badge and, while show_subtotal is on, the cart subtotal. open_cart sets whether it opens on click or on hover.' )
	->selector( '.elementor-menu-cart__toggle .elementor-button' )
	->defaults( [
		'color' => '#69727d',
		'gap' => '.3em',
	] )
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
	->label( 'Cart icon' )
	->description( 'The icon inside the toggle button, chosen by icon. font-size is the icon size.' )
	->selector( '.elementor-menu-cart__toggle .elementor-button-icon' )
	->defaults( [ 'color' => '#69727d' ] )
	->bind( 'color', V3_Control::bind_to( 'toggle_button_icon_color' ) )
	->bind( 'color', V3_Control::bind_to( 'toggle_button_hover_icon_color' ), $hover )
	->bind( 'font-size', V3_Control::bind_to( 'toggle_icon_size' )->responsive() );

$indicator = Style_Target::make( 'indicator' )
	->label( 'Item count' )
	->description( 'The number of items in the cart, shown on the icon. items_indicator sets it as a bubble on the icon, plain text beside it, or none to hide it.' )
	->selector( '.elementor-button-icon-qty' )
	->defaults( [
		'color' => '#fff',
		'background-color' => '#d9534f',
	] )
	->bind( 'color', V3_Control::bind_to( 'items_indicator_text_color' ) )
	->bind( 'background', V3_Control::bind_to( 'items_indicator_background_color' ) );

$cart = Style_Target::make( 'cart' )
	->label( 'Cart panel' )
	->description( 'Cart contents panel: a side drawer (side-cart) or a dropdown (mini-cart), per cart_type. Closed until the toggle opens it, so it is not in screenshots. An empty cart shows a message.' )
	->selector( '.elementor-menu-cart__main' )
	->defaults( [
		'box-shadow' => '0 0 20px rgba(0, 0, 0, .2)',
		'background-color' => '#fff',
	] )
	->with( Box_Shadow_Group::from_prefix( 'cart_box_shadow' ) )
	->bind( 'background', V3_Control::bind_to( 'background_color' ) )
	->bind( 'border-style', V3_Control::bind_to( 'border_type' ) )
	->bind( 'border-width', V3_Control::bind_to( 'border_width' )->responsive() )
	->bind( 'border-color', V3_Control::bind_to( 'border_color' ) )
	->bind( 'border-radius', V3_Control::bind_to( 'border_radius' )->responsive() )
	->bind( 'padding', V3_Control::bind_to( 'cart_padding' )->responsive() );

$product_title = Style_Target::make( 'product-title' )
	->label( 'Product names' )
	->description( 'Name of each product in the cart panel, linked to the product. Only present while the cart has items.' )
	->selector( '.elementor-menu-cart__product-name a' )
	->with( Typography_Group::from_prefix( 'product_title_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'product_title_color' ) )
	->bind( 'color', V3_Control::bind_to( 'product_title_hover_color' ), $hover );

$product_price = Style_Target::make( 'product-price' )
	->label( 'Product prices' )
	->description( 'Quantity and price of each product in the cart panel. Only present while the cart has items.' )
	->selector( '.elementor-menu-cart__product-price' )
	->defaults( [ 'color' => '#d5d8dc' ] )
	->with( Typography_Group::from_prefix( 'product_price_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'product_price_color' ) );

$subtotal = Style_Target::make( 'subtotal' )
	->label( 'Panel subtotal' )
	->description( 'Subtotal row at the bottom of the cart panel. Only present while the cart has items. show_subtotal does not hide it; that setting controls the subtotal on the toggle button.' )
	->selector( '.elementor-menu-cart__subtotal' )
	->defaults( [
		'font-size' => '20px',
		'font-weight' => '600',
		'text-align' => 'center',
	] )
	->with( Typography_Group::from_prefix( 'subtotal_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'subtotal_color' ) )
	->bind( 'text-align', V3_Control::bind_to( 'subtotal_alignment' )->responsive() );

$view_cart_button = Style_Target::make( 'view-cart-button' )
	->label( 'View cart button' )
	->description( 'Link to the cart page at the bottom of the cart panel. Only present while the cart has items, and hidden while view_cart_button_show is off.' )
	->selector( '.elementor-button--view-cart' )
	->defaults( [
		'color' => '#fff',
		'background-color' => '#69727d',
	] )
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
	->label( 'Checkout button' )
	->description( 'Link to the checkout page at the bottom of the cart panel. Only present while the cart has items, and hidden while checkout_button_show is off.' )
	->selector( '.elementor-button--checkout' )
	->defaults( [
		'color' => '#fff',
		'background-color' => '#69727d',
	] )
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
