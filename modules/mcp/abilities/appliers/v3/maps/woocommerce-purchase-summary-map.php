<?php

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Background_Group;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Border_Group;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Box_Shadow_Group;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Typography_Group;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Woocommerce_Notice_Targets;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Control;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Setting;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$hover = 'hover';

$sections = Style_Target::make( 'sections' )
	->label( 'Summary sections' )
	->description( 'Boxes around the order details, downloads and addresses on the order received page, rendered only after a real order or in the editor. Addresses show only to the buyer; shipping only if it ships.' )
	->selector( '.shop_table, address' )
	->with( Box_Shadow_Group::from_prefix( 'sections_box_shadow' ) )
	->bind( 'background', V3_Control::bind_to( 'sections_background_color' ) )
	->bind( 'border-style', V3_Control::bind_to( 'sections_border_type' ) )
	->bind( 'border-width', V3_Control::bind_to( 'sections_border_width' )->responsive() )
	->bind( 'border-color', V3_Control::bind_to( 'sections_border_color' ) )
	->bind( 'border-radius', V3_Control::bind_to( 'sections_border_radius' )->responsive() )
	->bind( 'padding', V3_Control::bind_to( 'sections_padding' )->responsive() );

$message = Style_Target::make( 'message' )
	->label( 'Confirmation message' )
	->description( 'The thank-you line at the top of the order received page, with the text from confirmation_message_text. Hidden while confirmation_message_active is off.' )
	->selector( '.woocommerce-thankyou-order-received' )
	->defaults( [ 'color' => '#69727d' ] )
	->with( Typography_Group::from_prefix( 'confirmation_message_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'confirmation_message_color' ) );

$titles = Style_Target::make( 'titles' )
	->label( 'Section titles' )
	->description( 'Headings of the order received sections, such as order details, downloads and addresses. Each shows only with its section.' )
	->selector( 'h2' )
	->defaults( [ 'color' => '#000' ] )
	->with( Typography_Group::from_prefix( 'titles_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'titles_color' ) );

$text = Style_Target::make( 'text' )
	->label( 'General text' )
	->description( 'Body text such as the billing and shipping addresses and product purchase notes. Purchase notes show only on processing or completed orders.' )
	->selector( 'address, .product-purchase-note, .woocommerce-thankyou-order-details + p' )
	->defaults( [ 'color' => '#69727d' ] )
	->with( Typography_Group::from_prefix( 'general_text_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'general_text_color' ) );

$order_items = Style_Target::make( 'order-items' )
	->label( 'Order rows' )
	->description( 'Cells of the order details table: product names with quantity, line totals and order totals, plus the downloads table cells when the order has downloadable products.' )
	->selector( '.product-quantity, .woocommerce-table--order-details td a, td.product-total, td.download-product, td.download-remaining, td.download-expires, td.download-file' )
	->with( Typography_Group::from_prefix( 'order_details_items_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'order_details_items_color' ) );

$product_links = Style_Target::make( 'product-links' )
	->label( 'Links' )
	->description( 'Every link inside the widget: product names, download links and any other link, not only the product names. hover styles them under the pointer.' )
	->selector( '.woocommerce a' )
	->bind( 'color', V3_Control::bind_to( 'order_details_product_links_normal_color' ) )
	->bind( 'color', V3_Control::bind_to( 'order_details_product_links_hover_color' ), $hover );

$button = Style_Target::make( 'button' )
	->label( 'Buttons' )
	->description( 'Buttons inside the order tables, such as download buttons for downloadable products. Not present on orders without them.' )
	->selector( '.shop_table .button, .order-again .button, .woocommerce-pagination .button' )
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
	] )
	->default_target( $sections )
	->targets( $message, $titles, $text, $order_items, $product_links, $button )
	->targets( ...Woocommerce_Notice_Targets::all() );
