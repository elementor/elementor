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
	->label( 'Cart sections (order summary, coupon, totals)' )
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
	->label( 'Section titles' )
	->selector( '.cart_totals h2' )
	->defaults( [
		'font-size' => '14px',
		'font-weight' => '700',
		'color' => '#000',
	] )
	->with( Typography_Group::from_prefix( 'sections_titles_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'sections_title_color' ) );

$text = Style_Target::make( 'text' )
	->label( 'Section text; links have their own target' )
	->selector( '.e-cart-content, .woocommerce-shipping-destination, .shipping-calculator-button' )
	->with( Typography_Group::from_prefix( 'sections_descriptions_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'sections_descriptions_color' ) );

$links = Style_Target::make( 'links' )
	->label( 'Links inside the sections' )
	->selector( '.woocommerce a:not(.add_to_cart_button):not(.restore-item):not(.wc-backward):not(.wc-forward)' )
	->bind( 'color', V3_Control::bind_to( 'links_normal_color' ) )
	->bind( 'color', V3_Control::bind_to( 'links_hover_color' ), $hover );

$buttons = Style_Target::make( 'buttons' )
	->label( 'Form buttons (update cart, apply coupon, update shipping)' )
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
	->label( 'Product rows in the order summary table' )
	->selector( '.cart td span, .cart td, .input-text.qty' )
	->with( Typography_Group::from_prefix( 'order_summary_items_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'order_summary_color' ) );

$product_links = Style_Target::make( 'product-links' )
	->label( 'Product name links in the order summary' )
	->selector( '.woocommerce .product-name a' )
	->bind( 'color', V3_Control::bind_to( 'product_link_normal_color' ) )
	->bind( 'color', V3_Control::bind_to( 'product_link_hover_color' ), $hover );

$totals = Style_Target::make( 'totals' )
	->label( 'Cart totals rows' )
	->selector( '.cart_totals .shop_table td:before, .cart_totals .shop_table td .woocommerce-Price-amount' )
	->with( Typography_Group::from_prefix( 'totals_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'totals_color' ) );

$checkout_button = Style_Target::make( 'checkout-button' )
	->label( '"Proceed to checkout" button' )
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
	->targets( $titles, $text, $links, Woo_Form_Fields::target( '.coupon .input-text' ), $buttons, $products, $product_links, $totals, $checkout_button );
