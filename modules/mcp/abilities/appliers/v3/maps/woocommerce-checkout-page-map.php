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
	->label( 'Checkout sections' )
	->description( 'Boxes around the billing details, shipping address, additional information, order summary, payment, coupon and returning customer sections. checkout_layout puts the order summary beside the forms (two-column) or below them (one-column). Several sections are conditional: returning customer shows only to logged-out visitors while the store login reminder is on; coupon shows only while store coupons are enabled, coupon_section_display is on and the cart needs payment; shipping shows only for orders that ship; additional information is off unless it is turned on in the Elementor editor.' )
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
	->description( 'Headings of the billing details, additional information and order summary sections. The texts of the billing and order summary headings come from billing_details_section_title and order_summary_section_title.' )
	->selector( 'h3#order_review_heading, .woocommerce-billing-fields h3, .woocommerce-additional-fields h3' )
	->with( Typography_Group::from_prefix( 'sections_titles_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'sections_title_color' ) );

$secondary_titles = Style_Target::make( 'secondary-titles' )
	->label( 'Prompt titles' )
	->description( 'The Returning customer? and Have a coupon? lines. Each is collapsed: its login or coupon form opens below it on click. Present only while the matching section is shown.' )
	->selector( '.e-checkout-secondary-title' )
	->defaults( [ 'color' => '#69727d' ] )
	->with( Typography_Group::from_prefix( 'sections_secondary_titles_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'sections_secondary_title_color' ) );

$text = Style_Target::make( 'text' )
	->label( 'Section descriptions' )
	->description( 'Explanatory text inside sections, such as the note in the returning customer login form, which is only visible after that form is opened.' )
	->selector( '.e-description' )
	->defaults( [
		'font-size' => '14px',
		'color' => '#69727d',
	] )
	->with( Typography_Group::from_prefix( 'sections_descriptions_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'sections_descriptions_color' ) );

$links = Style_Target::make( 'links' )
	->label( 'Links' )
	->description( 'Every link inside the checkout widget. hover styles them under the pointer.' )
	->selector( 'a' )
	->bind( 'color', V3_Control::bind_to( 'links_normal_color' ) )
	->bind( 'color', V3_Control::bind_to( 'links_hover_color' ), $hover );

$labels = Style_Target::make( 'labels' )
	->label( 'Field labels' )
	->description( 'Labels of the billing, shipping, additional information and login fields, and the coupon form description.' )
	->selector( '.woocommerce-billing-fields .form-row label, .woocommerce-shipping-fields .form-row label, .woocommerce-additional-fields .form-row label, .e-woocommerce-login-anchor .form-row label, .e-coupon-anchor-description' )
	->defaults( [ 'color' => '#69727d' ] )
	->with( Typography_Group::from_prefix( 'forms_label_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'forms_label_color' ) );

$buttons = Style_Target::make( 'buttons' )
	->label( 'Form buttons' )
	->description( 'The login button of the returning customer form and the Apply coupon button, each present only with its section. The Place order button has its own target. hover styles them under the pointer.' )
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
	->label( 'Order rows' )
	->description( 'Product rows of the order summary table: product name, quantity and line total.' )
	->selector( '.woocommerce-checkout-review-order-table .cart_item td' )
	->defaults( [ 'color' => '#000' ] )
	->with( Typography_Group::from_prefix( 'order_summary_items_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'order_summary_items_color' ) );

$order_totals = Style_Target::make( 'order-totals' )
	->label( 'Order totals' )
	->description( 'The header and totals rows of the order summary table: subtotal, shipping, taxes and total.' )
	->selector( '.woocommerce-checkout-review-order-table thead tr th, .woocommerce-checkout-review-order-table tfoot tr th, .woocommerce-checkout-review-order-table tfoot tr td' )
	->defaults( [ 'color' => '#69727d' ] )
	->with( Typography_Group::from_prefix( 'order_summary_totals_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'order_summary_totals_color' ) );

$purchase_button = Style_Target::make( 'purchase-button' )
	->label( 'Place order button' )
	->description( 'The button at the bottom of the payment section that submits the order. hover styles it under the pointer.' )
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
	->targets( $titles, $secondary_titles, $text, $links, $labels, Woo_Form_Fields::target( '#customer_details .input-text', 'Text inputs of the billing, shipping and additional information forms. The shipping fields stay hidden until the visitor checks Ship to a different address. Login and coupon inputs and dropdowns are not included.' ), $buttons, $order_items, $order_totals, $purchase_button );
