<?php

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Background_Group;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Border_Group;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Box_Shadow_Group;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Typography_Group;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Woo_Form_Fields;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Control;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Setting;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$hover = 'hover';

$sections = Style_Target::make( 'sections' )
	->label( 'Cart sections' )
	->description( 'Boxes around the product table, the coupon form and the cart totals. cart_layout puts the totals beside the products (two-column) or below them (one-column). The coupon box shows only while store coupons are enabled and section_coupon_display is on. With an empty cart the widget shows the WooCommerce empty-cart message instead.' )
	->selector( '.e-cart-section' )
	->defaults( [
		'background-color' => '#fff',
		'border-width' => '1px',
	] )
	->with( Box_Shadow_Group::from_prefix( 'section_normal_box_shadow' ) )
	->bind( 'background', V3_Control::bind_to( 'sections_background_color' ) )
	->bind( 'border-style', V3_Control::bind_to( 'sections_border_type' ) )
	->bind( 'border-width', V3_Control::bind_to( 'sections_border_width' )->responsive() )
	->bind( 'border-color', V3_Control::bind_to( 'sections_border_color' ) )
	->bind( 'border-radius', V3_Control::bind_to( 'sections_border_radius' )->responsive() )
	->bind( 'padding', V3_Control::bind_to( 'sections_padding' )->responsive() );

$titles = Style_Target::make( 'titles' )
	->label( 'Totals title' )
	->description( 'The Cart totals heading. It is the only heading in the cart widget.' )
	->selector( '.cart_totals h2' )
	->defaults( [
		'font-size' => '14px',
		'font-weight' => '700',
		'color' => '#000',
	] )
	->with( Typography_Group::from_prefix( 'sections_titles_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'sections_title_color' ) );

$text = Style_Target::make( 'text' )
	->label( 'Section text' )
	->description( 'Body text in the totals, such as the shipping destination and messages, and the Calculate shipping link, which opens the shipping calculator on click. Other links use the links target.' )
	->selector( '.e-cart-content, .woocommerce-shipping-destination, .shipping-calculator-button' )
	->with( Typography_Group::from_prefix( 'sections_descriptions_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'sections_descriptions_color' ) );

$links = Style_Target::make( 'links' )
	->label( 'Links' )
	->description( 'Links inside the cart, except product names and buttons, which have their own targets. hover styles them under the pointer.' )
	->selector( '.woocommerce a:not(.add_to_cart_button):not(.restore-item):not(.wc-backward):not(.wc-forward)' )
	->bind( 'color', V3_Control::bind_to( 'links_normal_color' ) )
	->bind( 'color', V3_Control::bind_to( 'links_hover_color' ), $hover );

$buttons = Style_Target::make( 'buttons' )
	->label( 'Form buttons' )
	->description( 'The Update cart, Apply coupon and shipping calculator Update buttons. Apply coupon shows only with the coupon box, and its text comes from apply_coupon_button_text. hover styles them under the pointer.' )
	->selector( '.shop_table .button' )
	->defaults( [
		'font-size' => '14px',
		'font-weight' => '700',
		'border-width' => '2px',
	] )
	->with( Typography_Group::from_prefix( 'forms_button_typography' ) )
	->with( Background_Group::from_prefix( 'forms_buttons_normal_background' ) )
	->with( Background_Group::from_prefix( 'forms_buttons_hover_background', $hover ) )
	->with( Box_Shadow_Group::from_prefix( 'forms_buttons_normal_box_shadow' ) )
	->with( Box_Shadow_Group::from_prefix( 'forms_buttons_focus_box_shadow', $hover ) )
	->bind( 'color', V3_Control::bind_to( 'forms_buttons_normal_text_color' ) )
	->bind( 'color', V3_Control::bind_to( 'forms_buttons_hover_text_color' ), $hover )
	->bind( 'border-style', V3_Control::bind_to( 'forms_buttons_border_type' ) )
	->bind( 'border-width', V3_Control::bind_to( 'forms_buttons_border_width' )->responsive() )
	->bind( 'border-color', V3_Control::bind_to( 'forms_buttons_border_color' ) )
	->bind( 'border-color', V3_Control::bind_to( 'forms_buttons_hover_border_color' ), $hover )
	->bind( 'border-radius', V3_Control::bind_to( 'forms_buttons_border_radius' )->responsive() )
	->bind( 'padding', V3_Control::bind_to( 'forms_buttons_padding' )->responsive() );

$products = Style_Target::make( 'products' )
	->label( 'Product rows' )
	->description( 'Cells of the product table, including the price, subtotal and quantity fields of each cart item. Only present while the cart has items.' )
	->selector( '.cart td span, .cart td, .input-text.qty' )
	->with( Typography_Group::from_prefix( 'order_summary_items_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'order_summary_color' ) );

$product_links = Style_Target::make( 'product-links' )
	->label( 'Product names' )
	->description( 'Product name links in the product table. hover styles them under the pointer.' )
	->selector( '.woocommerce .product-name a' )
	->bind( 'color', V3_Control::bind_to( 'product_link_normal_color' ) )
	->bind( 'color', V3_Control::bind_to( 'product_link_hover_color' ), $hover );

$totals_target = Style_Target::make( 'totals' )
	->label( 'Totals rows' )
	->description( 'Rows of the cart totals table: subtotal, shipping, taxes and total.' )
	->selector( '.cart_totals .shop_table td:before, .cart_totals .shop_table td .woocommerce-Price-amount' )
	->with( Typography_Group::from_prefix( 'totals_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'totals_color' ) );

$checkout_button = Style_Target::make( 'checkout-button' )
	->label( 'Checkout button' )
	->description( 'The main button under the cart totals that goes to checkout. Its text comes from checkout_button_text.' )
	->selector( '.checkout-button' )
	->defaults( [
		'font-size' => '15px',
		'background-color' => '#5bc0de',
		'color' => '#fff',
	] )
	->with( Typography_Group::from_prefix( 'checkout_button_typography' ) )
	->with( Border_Group::from_prefix( 'checkout_button_border' ) )
	->with( Background_Group::from_prefix( 'checkout_button_normal_background' ) )
	->with( Background_Group::from_prefix( 'checkout_button_hover_background', $hover ) )
	->with( Box_Shadow_Group::from_prefix( 'checkout_button_normal_box_shadow' ) )
	->with( Box_Shadow_Group::from_prefix( 'checkout_button_hover_box_shadow', $hover ) )
	->bind( 'color', V3_Control::bind_to( 'checkout_button_normal_text_color' ) )
	->bind( 'color', V3_Control::bind_to( 'checkout_button_hover_text_color' ), $hover )
	->bind( 'border-color', V3_Control::bind_to( 'checkout_button_hover_border_color' ), $hover )
	->bind( 'border-radius', V3_Control::bind_to( 'checkout_button_border_radius' )->responsive() )
	->bind( 'padding', V3_Control::bind_to( 'checkout_button_padding' )->responsive() );

return V3_Widget_Map::make( 'woocommerce-cart' )
	->description( 'WooCommerce cart page: product table, coupon form, cart totals and the proceed-to-checkout button.' )
	->settings( [
		'cart_layout' => V3_Setting::bind_to( 'cart_layout' )->enum_from_control(),
		'section_coupon_display' => V3_Setting::bind_to( 'section_coupon_display' )->switcher(),
		'apply_coupon_button_text' => V3_Setting::bind_to( 'apply_coupon_button_text' )->string()->dynamic(),
		'checkout_button_text' => V3_Setting::bind_to( 'checkout_button_text' )->string()->dynamic(),
	] )
	->default_target( $sections )
	->targets( $titles, $text, $links, Woo_Form_Fields::target( '.coupon .input-text', 'The coupon code input. Present only while the coupon box is shown. Quantity fields belong to the products target.' ), $buttons, $products, $product_links, $totals_target, $checkout_button );
