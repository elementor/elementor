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
$active = 'active';

$tabs = Style_Target::make( 'tabs' )
	->label( 'Account navigation tabs; tabs:active styles the current tab' )
	->selector( '.woocommerce-MyAccount-navigation ul li a' )
	->states( $active )
	->with( Typography_Group::from_prefix( 'tabs_typography' ) )
	->with( Background_Group::from_prefix( 'tabs_normal_background' ) )
	->with( Background_Group::from_prefix( 'tabs_hover_background', $hover ) )
	->with( Background_Group::from_prefix( 'tabs_active_background', $active ) )
	->with( Box_Shadow_Group::from_prefix( 'tabs_normal_box_shadow' ) )
	->with( Box_Shadow_Group::from_prefix( 'tabs_hover_box_shadow', $hover ) )
	->with( Box_Shadow_Group::from_prefix( 'tabs_active_box_shadow', $active ) )
	->bind( 'color', V3_Control::bind_to( 'tabs_normal_color' ) )
	->bind( 'color', V3_Control::bind_to( 'tabs_hover_color' ), $hover )
	->bind( 'color', V3_Control::bind_to( 'tabs_active_color' ), $active )
	->bind( 'border-style', V3_Control::bind_to( 'tabs_border_type' ) )
	->bind( 'border-width', V3_Control::bind_to( 'tabs_border_width' )->responsive() )
	->bind( 'border-color', V3_Control::bind_to( 'tabs_border_color' ) )
	->bind( 'border-color', V3_Control::bind_to( 'tabs_hover_border_color' ), $hover )
	->bind( 'border-color', V3_Control::bind_to( 'tabs_active_border_color' ), $active )
	->bind( 'border-radius', V3_Control::bind_to( 'tabs_border_radius' )->responsive() )
	->bind( 'padding', V3_Control::bind_to( 'tabs_padding' )->responsive() );

$sections = Style_Target::make( 'sections' )
	->label( 'Content sections of each tab' )
	->with( Box_Shadow_Group::from_prefix( 'my_account_sections_box_shadow' ) )
	->bind( 'background', V3_Control::bind_to( 'my_account_sections_background_color' ) )
	->bind( 'border-style', V3_Control::bind_to( 'sections_border_type' ) )
	->bind( 'border-width', V3_Control::bind_to( 'sections_border_width' )->responsive() )
	->bind( 'border-color', V3_Control::bind_to( 'sections_border_color' ) )
	->bind( 'border-radius', V3_Control::bind_to( 'sections_border_radius' )->responsive() )
	->bind( 'padding', V3_Control::bind_to( 'sections_padding' )->responsive() );

$titles = Style_Target::make( 'titles' )
	->label( 'Section titles' )
	->with( Typography_Group::from_prefix( 'section_titles_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'typography_section_titles_color' ) );

$text = Style_Target::make( 'text' )
	->label( 'General text' )
	->selector( '.woocommerce-MyAccount-content > div > p' )
	->with( Typography_Group::from_prefix( 'general_text_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'general_text_color' ) );

$links = Style_Target::make( 'links' )
	->label( 'Links inside the content' )
	->bind( 'color', V3_Control::bind_to( 'links_normal_color' ) )
	->bind( 'color', V3_Control::bind_to( 'links_hover_color' ), $hover );

$labels = Style_Target::make( 'labels' )
	->label( 'Form field labels' )
	->selector( '.woocommerce-form-row label' )
	->with( Typography_Group::from_prefix( 'forms_label_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'forms_label_color' ) );

$buttons = Style_Target::make( 'buttons' )
	->label( 'Form buttons (save, login, register)' )
	->selector( 'button.button' )
	->with( Typography_Group::from_prefix( 'forms_button_typography' ) )
	->with( Border_Group::from_prefix( 'forms_buttons_border' ) )
	->with( Background_Group::from_prefix( 'forms_buttons_background' ) )
	->with( Background_Group::from_prefix( 'forms_buttons_hover_background', $hover ) )
	->with( Box_Shadow_Group::from_prefix( 'forms_buttons_normal_box_shadow' ) )
	->with( Box_Shadow_Group::from_prefix( 'forms_buttons_focus_box_shadow', $hover ) )
	->bind( 'color', V3_Control::bind_to( 'forms_buttons_normal_text_color' ) )
	->bind( 'color', V3_Control::bind_to( 'forms_buttons_hover_text_color' ), $hover )
	->bind( 'border-color', V3_Control::bind_to( 'forms_buttons_hover_border_color' ), $hover )
	->bind( 'border-radius', V3_Control::bind_to( 'forms_buttons_border_radius' )->responsive() )
	->bind( 'padding', V3_Control::bind_to( 'forms_buttons_padding' )->responsive() );

$table_items = Style_Target::make( 'table-items' )
	->label( 'Rows of the orders and downloads tables' )
	->selector( '.e-my-account-tab__orders tbody td' )
	->with( Typography_Group::from_prefix( 'tables_items_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'tables_items_color' ) );

$table_buttons = Style_Target::make( 'table-buttons' )
	->label( 'Buttons inside the tables (view, pay, download)' )
	->selector( '.shop_table .button' )
	->with( Typography_Group::from_prefix( 'tables_button_typography' ) )
	->with( Background_Group::from_prefix( 'tables_button_normal_background' ) )
	->with( Background_Group::from_prefix( 'tables_button_hover_background', $hover ) )
	->with( Box_Shadow_Group::from_prefix( 'tables_button_normal_box_shadow' ) )
	->with( Box_Shadow_Group::from_prefix( 'tables_button_hover_box_shadow', $hover ) )
	->bind( 'color', V3_Control::bind_to( 'tables_button_normal_text_color' ) )
	->bind( 'color', V3_Control::bind_to( 'tables_button_hover_text_color' ), $hover )
	->bind( 'border-style', V3_Control::bind_to( 'tables_button_border_type' ) )
	->bind( 'border-width', V3_Control::bind_to( 'tables_button_border_width' )->responsive() )
	->bind( 'border-color', V3_Control::bind_to( 'tables_button_border_color' ) )
	->bind( 'border-color', V3_Control::bind_to( 'tables_button_hover_border_color' ), $hover )
	->bind( 'border-radius', V3_Control::bind_to( 'tables_button_border_radius' )->responsive() )
	->bind( 'padding', V3_Control::bind_to( 'tables_button_padding' )->responsive() );

return V3_Widget_Map::make( 'woocommerce-my-account' )
	->description( 'WooCommerce My Account area: navigation tabs and the dashboard, orders, downloads, addresses and account details content.' )
	->settings( [
		'tabs_layout' => V3_Setting::bind_to( 'tabs_layout' )->enum_from_control(),
	] )
	->default_target( $tabs )
	->targets( $sections, $titles, $text, $links, $labels, Woo_Form_Fields::target( '.woocommerce-Input' ), $buttons, $table_items, $table_buttons );
