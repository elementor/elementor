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
$hover = 'hover';

$sections = Style_Target::make( 'sections' )
	->label( 'Checkout sections (billing, additional info, order summary, payment, coupon, returning customer)' )
	->with( Box_Shadow_Group::from_prefix( 'section_normal_box_shadow' ) )
	->bind( 'background', V3_Control::bind_to( 'sections_background_color' ) )
	->bind( 'border-style', V3_Control::bind_to( 'sections_border_type' ) )
	->bind( 'border-width', V3_Control::bind_to( 'sections_border_width' )->responsive() )
	->bind( 'border-color', V3_Control::bind_to( 'sections_border_color' ) )
	->bind( 'border-radius', V3_Control::bind_to( 'sections_border_radius' )->responsive() )
	->bind( 'padding', V3_Control::bind_to( 'sections_padding' )->responsive() );

$titles = Style_Target::make( 'titles' )
	->label( 'Section titles' )
	->with( Typography_Group::from_prefix( 'sections_titles_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'sections_title_color' ) );

$secondary_titles = Style_Target::make( 'secondary-titles' )
	->label( 'Secondary titles (returning customer and coupon prompts)' )
	->selector( '.e-checkout-secondary-title' )
	->with( Typography_Group::from_prefix( 'sections_secondary_titles_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'sections_secondary_title_color' ) );

$text = Style_Target::make( 'text' )
	->label( 'Section descriptions' )
	->selector( '.e-description' )
	->with( Typography_Group::from_prefix( 'sections_descriptions_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'sections_descriptions_color' ) );

$links = Style_Target::make( 'links' )
	->label( 'Links inside the sections' )
	->bind( 'color', V3_Control::bind_to( 'links_normal_color' ) )
	->bind( 'color', V3_Control::bind_to( 'links_hover_color' ), $hover );

$labels = Style_Target::make( 'labels' )
	->label( 'Form field labels' )
	->selector( '.woocommerce-billing-fields .form-row label' )
	->with( Typography_Group::from_prefix( 'forms_label_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'forms_label_color' ) );

$buttons = Style_Target::make( 'buttons' )
	->label( 'Form buttons (login, apply coupon)' )
	->selector( '.woocommerce-button' )
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
	->with( Typography_Group::from_prefix( 'order_summary_items_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'order_summary_items_color' ) );

$order_totals = Style_Target::make( 'order-totals' )
	->label( 'Totals rows and headers in the order summary' )
	->selector( '.woocommerce-checkout-review-order-table thead tr th' )
	->with( Typography_Group::from_prefix( 'order_summary_totals_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'order_summary_totals_color' ) );

$purchase_button = Style_Target::make( 'purchase-button' )
	->label( '"Place order" button' )
	->selector( '#place_order' )
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
		'sticky_right_column' => V3_Setting::bind_to( 'sticky_right_column' )->switcher(),
		'billing_details_section_title' => V3_Setting::bind_to( 'billing_details_section_title' )->string()->dynamic(),
		'additional_information_active' => V3_Setting::bind_to( 'additional_information_active' )->switcher(),
		'order_summary_section_title' => V3_Setting::bind_to( 'order_summary_section_title' )->string()->dynamic(),
		'coupon_section_display' => V3_Setting::bind_to( 'coupon_section_display' )->switcher(),
		'coupon_section_title_text' => V3_Setting::bind_to( 'coupon_section_title_text' )->string()->dynamic(),
		'coupon_section_title_link_text' => V3_Setting::bind_to( 'coupon_section_title_link_text' )->string()->dynamic(),
		'terms_conditions_message_text' => V3_Setting::bind_to( 'terms_conditions_message_text' )->string()->dynamic(),
		'terms_conditions_link_text' => V3_Setting::bind_to( 'terms_conditions_link_text' )->string()->dynamic(),
	] )
	->default_target( $sections )
	->targets( $titles, $secondary_titles, $text, $links, $labels, Woo_Form_Fields::target( '#customer_details .input-text' ), $buttons, $order_items, $order_totals, $purchase_button );
