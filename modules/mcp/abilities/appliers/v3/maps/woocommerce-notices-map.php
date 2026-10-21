<?php

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Background_Group;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Border_Group;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Box_Shadow_Group;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Typography_Group;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Control;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$hover = 'hover';
$notice_types_setting = 'woocommerce_notices_elements';
$site_wide = 'Site-wide: it styles every WooCommerce notice of this type on every page, including Cart, Checkout, My Account and pages not built with Elementor, not only this widget. The editor preview shows demo notices.';

$background = fn( string $prefix, string $notice_type ) => V3_Control::bind_to( $prefix . '_color' )->requires( [
	$prefix . '_background' => Background_Group::CLASSIC,
	$notice_types_setting => $notice_type,
] );

$notice_box = fn( string $alias, string $label, string $type, string $notice_type ) => Style_Target::make( $alias )
	->label( $label )
	->description( 'The ' . strtolower( $label ) . " box and its text. {$site_wide}" )
	->with( Typography_Group::from_prefix( $type . '_message_text_typography' ) )
	->with( Border_Group::from_prefix( $type . '_notice_box_border' ) )
	->with( Box_Shadow_Group::from_prefix( $type . '_notice_box_box_shadow' ) )
	->bind( 'color', V3_Control::bind_to( $type . '_message_text_color' ) )
	->bind( 'background', $background( $type . '_notice_box_background', $notice_type ) )
	->bind( 'border-radius', V3_Control::bind_to( $type . '_notice_box_border_radius' )->responsive() );

$notice_button = fn( string $alias, string $label, string $type, string $notice_type ) => Style_Target::make( $alias )
	->label( $label )
	->description( "Buttons inside {$type} notices, such as View cart. hover styles them under the pointer. {$site_wide}" )
	->with( Typography_Group::from_prefix( $type . '_button_typography' ) )
	->with( Box_Shadow_Group::from_prefix( $type . '_buttons_normal_box_shadow' ) )
	->with( Box_Shadow_Group::from_prefix( $type . '_buttons_focus_box_shadow', $hover ) )
	->bind( 'color', V3_Control::bind_to( $type . '_buttons_normal_text_color' ) )
	->bind( 'color', V3_Control::bind_to( $type . '_buttons_hover_text_color' ), $hover )
	->bind( 'background', $background( $type . '_buttons_normal_background', $notice_type ) )
	->bind( 'background', $background( $type . '_buttons_hover_background', $notice_type ), $hover )
	->bind( 'border-style', V3_Control::bind_to( $type . '_buttons_border_type' ) )
	->bind( 'border-width', V3_Control::bind_to( $type . '_buttons_border_width' )->responsive() )
	->bind( 'border-color', V3_Control::bind_to( $type . '_buttons_border_color' ) )
	->bind( 'border-color', V3_Control::bind_to( $type . '_buttons_hover_border_color' ), $hover )
	->bind( 'border-radius', V3_Control::bind_to( $type . '_buttons_border_radius' )->responsive() )
	->bind( 'padding', V3_Control::bind_to( $type . '_buttons_padding' )->responsive() );

$error_link = Style_Target::make( 'error-link' )
	->label( 'Error notice links' )
	->description( "Links inside error notices, such as Return to shop. hover styles them under the pointer. {$site_wide}" )
	->with( Typography_Group::from_prefix( 'error_message_link_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'error_message_normal_links_color' ) )
	->bind( 'color', V3_Control::bind_to( 'error_message_hover_links_color' ), $hover );

$error_icon = Style_Target::make( 'error-icon' )
	->label( 'Error notice icon' )
	->description( "The icon at the start of error notices. {$site_wide}" )
	->bind( 'color', V3_Control::bind_to( 'error_message_icon_color' ) );

$message_link = Style_Target::make( 'message-link' )
	->label( 'Message notice links' )
	->description( "Links inside message (success) notices, such as Undo after removing a cart item. hover styles them under the pointer. {$site_wide}" )
	->with( Typography_Group::from_prefix( 'notice_message_link_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'notice_message_normal_links_color' ) )
	->bind( 'color', V3_Control::bind_to( 'notice_message_hover_links_color' ), $hover );

return V3_Widget_Map::make( 'woocommerce-notices' )
	->description( 'Where WooCommerce notices (errors, success messages and info) show on the page. Its styles apply to every WooCommerce notice on the site, not only this widget.' )
	->kit_tab( 'settings-woocommerce', [ $notice_types_setting ] )
	->default_target( $notice_box( 'error', 'Error notice', 'error', 'wc_error' ) )
	->targets(
		$error_link,
		$error_icon,
		$notice_box( 'message', 'Message notice', 'message', 'wc_message' ),
		$message_link,
		$notice_button( 'message-button', 'Message notice buttons', 'message', 'wc_message' ),
		$notice_box( 'info', 'Info notice', 'info', 'wc_info' ),
		$notice_button( 'info-button', 'Info notice buttons', 'info', 'wc_info' )
	);
