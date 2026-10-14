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
	->label( 'Summary sections (payment details, bank details, order details, addresses)' )
	->with( Box_Shadow_Group::from_prefix( 'sections_box_shadow' ) )
	->bind( 'background', V3_Control::bind_to( 'sections_background_color' ) )
	->bind( 'border-style', V3_Control::bind_to( 'sections_border_type' ) )
	->bind( 'border-width', V3_Control::bind_to( 'sections_border_width' )->responsive() )
	->bind( 'border-color', V3_Control::bind_to( 'sections_border_color' ) )
	->bind( 'border-radius', V3_Control::bind_to( 'sections_border_radius' )->responsive() )
	->bind( 'padding', V3_Control::bind_to( 'sections_padding' )->responsive() );

$message = Style_Target::make( 'message' )
	->label( 'Order received confirmation message' )
	->selector( '.woocommerce-thankyou-order-received' )
	->with( Typography_Group::from_prefix( 'confirmation_message_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'confirmation_message_color' ) );

$titles = Style_Target::make( 'titles' )
	->label( 'Section titles' )
	->selector( 'h2' )
	->with( Typography_Group::from_prefix( 'titles_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'titles_color' ) );

$text = Style_Target::make( 'text' )
	->label( 'General text such as addresses' )
	->selector( 'address' )
	->with( Typography_Group::from_prefix( 'general_text_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'general_text_color' ) );

$order_items = Style_Target::make( 'order-items' )
	->label( 'Product rows in the order details table' )
	->selector( '.shop_table td' )
	->with( Typography_Group::from_prefix( 'order_details_items_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'order_details_items_color' ) );

$product_links = Style_Target::make( 'product-links' )
	->label( 'Product name links in the order details' )
	->bind( 'color', V3_Control::bind_to( 'order_details_product_links_normal_color' ) )
	->bind( 'color', V3_Control::bind_to( 'order_details_product_links_hover_color' ), $hover );

$button = Style_Target::make( 'button' )
	->label( 'Buttons in the order details (e.g. download)' )
	->selector( '.shop_table .button' )
	->with( Typography_Group::from_prefix( 'order_details_button_typography' ) )
	->with( Background_Group::from_prefix( 'order_details_button_normal_background' ) )
	->with( Background_Group::from_prefix( 'order_details_button_hover_background', $hover ) )
	->with( Box_Shadow_Group::from_prefix( 'order_details_button_normal_box_shadow' ) )
	->with( Box_Shadow_Group::from_prefix( 'order_details_button_hover_box_shadow', $hover ) )
	->bind( 'color', V3_Control::bind_to( 'order_details_button_normal_text_color' ) )
	->bind( 'color', V3_Control::bind_to( 'order_details_button_hover_text_color' ), $hover )
	->bind( 'border-style', V3_Control::bind_to( 'order_details_button_border_type' ) )
	->bind( 'border-width', V3_Control::bind_to( 'order_details_button_border_width' )->responsive() )
	->bind( 'border-color', V3_Control::bind_to( 'order_details_button_border_color' ) )
	->bind( 'border-color', V3_Control::bind_to( 'order_details_button_hover_border_color' ), $hover )
	->bind( 'border-radius', V3_Control::bind_to( 'order_details_button_border_radius' )->responsive() )
	->bind( 'padding', V3_Control::bind_to( 'order_details_button_padding' )->responsive() );

return V3_Widget_Map::make( 'woocommerce-purchase-summary' )
	->description( 'WooCommerce order received (thank you) summary: confirmation message, payment and bank details, downloads, order details and addresses.' )
	->settings( [
		'confirmation_message_active' => V3_Setting::bind_to( 'confirmation_message_active' )->switcher(),
		'confirmation_message_text' => V3_Setting::bind_to( 'confirmation_message_text' )->string()->dynamic(),
		'payment_details_number' => V3_Setting::bind_to( 'payment_details_number' )->string()->dynamic(),
		'payment_details_date' => V3_Setting::bind_to( 'payment_details_date' )->string()->dynamic(),
		'payment_details_email' => V3_Setting::bind_to( 'payment_details_email' )->string()->dynamic(),
		'payment_details_total' => V3_Setting::bind_to( 'payment_details_total' )->string()->dynamic(),
		'payment_details_payment' => V3_Setting::bind_to( 'payment_details_payment' )->string()->dynamic(),
		'bank_details_text' => V3_Setting::bind_to( 'bank_details_text' )->string()->dynamic(),
		'downloads_text' => V3_Setting::bind_to( 'downloads_text' )->string()->dynamic(),
		'order_summary_text' => V3_Setting::bind_to( 'order_summary_text' )->string()->dynamic(),
		'billing_details_text' => V3_Setting::bind_to( 'billing_details_text' )->string()->dynamic(),
		'shipping_details_text' => V3_Setting::bind_to( 'shipping_details_text' )->string()->dynamic(),
	] )
	->default_target( $sections )
	->targets( $message, $titles, $text, $order_items, $product_links, $button );
