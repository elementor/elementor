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
	->with( Typography_Group::from_prefix( 'sections_titles_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'sections_title_color' ) );

$text = Style_Target::make( 'text' )
	->label( 'Section text; links have their own target' )
	->selector( '.e-cart-content' )
	->with( Typography_Group::from_prefix( 'sections_descriptions_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'sections_descriptions_color' ) );

$links = Style_Target::make( 'links' )
	->label( 'Links inside the sections' )
	->bind( 'color', V3_Control::bind_to( 'links_normal_color' ) )
	->bind( 'color', V3_Control::bind_to( 'links_hover_color' ), $hover );

$buttons = Style_Target::make( 'buttons' )
	->label( 'Form buttons (update cart, apply coupon, update shipping)' )
	->selector( '.shop_table .button' )
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
	->selector( '.e-shop-table .cart td' )
	->with( Typography_Group::from_prefix( 'order_summary_items_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'order_summary_color' ) );

$product_links = Style_Target::make( 'product-links' )
	->label( 'Product name links in the order summary' )
	->bind( 'color', V3_Control::bind_to( 'product_link_normal_color' ) )
	->bind( 'color', V3_Control::bind_to( 'product_link_hover_color' ), $hover );

$totals = Style_Target::make( 'totals' )
	->label( 'Cart totals rows' )
	->selector( '.cart_totals .shop_table td' )
	->with( Typography_Group::from_prefix( 'totals_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'totals_color' ) );

$checkout_button = Style_Target::make( 'checkout-button' )
	->label( '"Proceed to checkout" button' )
	->selector( '.checkout-button' )
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
		'sticky_right_column' => V3_Setting::bind_to( 'sticky_right_column' )->switcher(),
		'update_cart_automatically' => V3_Setting::bind_to( 'update_cart_automatically' )->switcher(),
		'update_cart_button_text' => V3_Setting::bind_to( 'update_cart_button_text' )->string()->dynamic(),
		'section_coupon_display' => V3_Setting::bind_to( 'section_coupon_display' )->switcher(),
		'apply_coupon_button_text' => V3_Setting::bind_to( 'apply_coupon_button_text' )->string()->dynamic(),
		'totals_section_title' => V3_Setting::bind_to( 'totals_section_title' )->string()->dynamic(),
		'update_shipping_button_text' => V3_Setting::bind_to( 'update_shipping_button_text' )->string()->dynamic(),
		'checkout_button_text' => V3_Setting::bind_to( 'checkout_button_text' )->string()->dynamic(),
	] )
	->default_target( $sections )
	->targets( $titles, $text, $links, Woo_Form_Fields::target( '.coupon .input-text' ), $buttons, $products, $product_links, $totals, $checkout_button );
