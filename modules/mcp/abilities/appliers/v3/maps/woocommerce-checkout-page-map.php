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
	->label( 'Checkout sections (billing, additional info, order summary, payment, coupon, returning customer)' )
	->selector( '.e-woocommerce-login-section, .woocommerce-checkout #customer_details .col-1, .woocommerce-additional-fields, .e-checkout__order_review, .e-coupon-box, .woocommerce-checkout #payment, .woocommerce-shipping-fields .shipping_address' )
	->with( Box_Shadow_Group::from_prefix( 'section_normal_box_shadow' ) )
	->bind( 'background', V3_Control::bind_to( 'sections_background_color' ) )
	->bind( 'border-style', V3_Control::bind_to( 'sections_border_type' ) )
	->bind( 'border-width', V3_Control::bind_to( 'sections_border_width' )->responsive() )
	->bind( 'border-color', V3_Control::bind_to( 'sections_border_color' ) )
	->bind( 'border-radius', V3_Control::bind_to( 'sections_border_radius' )->responsive() )
	->bind( 'padding', V3_Control::bind_to( 'sections_padding' )->responsive() );

$titles = Style_Target::make( 'titles' )
	->label( 'Section titles' )
	->selector( 'h3#order_review_heading, .woocommerce-billing-fields h3, .woocommerce-additional-fields h3' )
	->with( Typography_Group::from_prefix( 'sections_titles_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'sections_title_color' ) );

$secondary_titles = Style_Target::make( 'secondary-titles' )
	->label( 'Secondary titles (returning customer and coupon prompts)' )
	->selector( '.e-checkout-secondary-title' )
	->defaults( [ 'color' => '#69727d' ] )
	->with( Typography_Group::from_prefix( 'sections_secondary_titles_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'sections_secondary_title_color' ) );

$text = Style_Target::make( 'text' )
	->label( 'Section descriptions' )
	->selector( '.e-description' )
	->defaults( [
		'font-size' => '14px',
		'color' => '#69727d',
	] )
	->with( Typography_Group::from_prefix( 'sections_descriptions_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'sections_descriptions_color' ) );

$links = Style_Target::make( 'links' )
	->label( 'Links inside the sections' )
	->selector( 'a' )
	->bind( 'color', V3_Control::bind_to( 'links_normal_color' ) )
	->bind( 'color', V3_Control::bind_to( 'links_hover_color' ), $hover );

$labels = Style_Target::make( 'labels' )
	->label( 'Form field labels' )
	->selector( '.woocommerce-billing-fields .form-row label, .woocommerce-shipping-fields .form-row label, .woocommerce-additional-fields .form-row label, .e-woocommerce-login-anchor .form-row label, .e-coupon-anchor-description' )
	->defaults( [ 'color' => '#69727d' ] )
	->with( Typography_Group::from_prefix( 'forms_label_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'forms_label_color' ) );

$buttons = Style_Target::make( 'buttons' )
	->label( 'Form buttons (login, apply coupon)' )
	->selector( '.woocommerce-button, .e-apply-coupon, .woocommerce-form-login__submit' )
	->defaults( [
		'color' => '#6f6f6f',
		'border-width' => '2px',
		'padding' => '1rem',
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

$order_items = Style_Target::make( 'order-items' )
	->label( 'Product rows in the order summary' )
	->selector( '.woocommerce-checkout-review-order-table .cart_item td' )
	->defaults( [ 'color' => '#000' ] )
	->with( Typography_Group::from_prefix( 'order_summary_items_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'order_summary_items_color' ) );

$order_totals = Style_Target::make( 'order-totals' )
	->label( 'Totals rows and headers in the order summary' )
	->selector( '.woocommerce-checkout-review-order-table thead tr th, .woocommerce-checkout-review-order-table tfoot tr th, .woocommerce-checkout-review-order-table tfoot tr td' )
	->defaults( [ 'color' => '#69727d' ] )
	->with( Typography_Group::from_prefix( 'order_summary_totals_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'order_summary_totals_color' ) );

$purchase_button = Style_Target::make( 'purchase-button' )
	->label( '"Place order" button' )
	->selector( '#place_order' )
	->defaults( [
		'background-color' => '#5bc0de',
		'color' => '#fff',
	] )
	->with( Typography_Group::from_prefix( 'purchase_button_typography' ) )
	->with( Border_Group::from_prefix( 'purchase_button_border' ) )
	->with( Background_Group::from_prefix( 'purchase_button_normal_background' ) )
	->with( Background_Group::from_prefix( 'purchase_button_hover_background', $hover ) )
	->with( Box_Shadow_Group::from_prefix( 'purchase_button_normal_box_shadow' ) )
	->with( Box_Shadow_Group::from_prefix( 'purchase_button_hover_box_shadow', $hover ) )
	->bind( 'color', V3_Control::bind_to( 'purchase_button_normal_text_color' ) )
	->bind( 'color', V3_Control::bind_to( 'purchase_button_hover_text_color' ), $hover )
	->bind( 'border-color', V3_Control::bind_to( 'purchase_button_hover_border_color' ), $hover )
	->bind( 'border-radius', V3_Control::bind_to( 'purchase_button_border_radius' )->responsive() )
	->bind( 'padding', V3_Control::bind_to( 'purchase_button_padding' )->responsive() );

return V3_Widget_Map::make( 'woocommerce-checkout-page' )
	->description( 'WooCommerce checkout page: billing and shipping forms, coupon, order summary, payment methods and the place order button.' )
	->settings( [
		'checkout_layout' => V3_Setting::bind_to( 'checkout_layout' )->enum_from_control(),
		'billing_details_section_title' => V3_Setting::bind_to( 'billing_details_section_title' )->string()->dynamic(),
		'order_summary_section_title' => V3_Setting::bind_to( 'order_summary_section_title' )->string()->dynamic(),
		'coupon_section_display' => V3_Setting::bind_to( 'coupon_section_display' )->switcher(),
	] )
	->default_target( $sections )
	->targets( $titles, $secondary_titles, $text, $links, $labels, Woo_Form_Fields::target( '#customer_details .input-text' ), $buttons, $order_items, $order_totals, $purchase_button );
