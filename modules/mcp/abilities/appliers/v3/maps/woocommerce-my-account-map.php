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
$active = 'active';

$account_tabs = Style_Target::make( 'tabs' )
	->label( 'Account tabs' )
	->description( 'Links to the account pages (dashboard, orders, downloads, addresses, account details, logout), shown only to logged-in customers; logged-out visitors see the login form instead. tabs_layout places them in a column beside the content (vertical) or in a row above it (horizontal). The active state styles the tab of the page being viewed, not a pressed tab.' )
	->selector( '.woocommerce-MyAccount-navigation ul li a' )
	->defaults( [
		'font-size' => '14px',
		'font-weight' => '700',
		'background-color' => '#f9fafa',
		'color' => '#69727d',
	] )
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
	->label( 'Content sections' )
	->description( 'Boxes around the content of each account page, and around the login and register forms for logged-out visitors. The register form shows only while store registration is enabled. Not applied to a custom dashboard template, or to the empty orders and downloads messages.' )
	->selector( '.e-my-account-tab__dashboard:not(.e-my-account-tab__dashboard--custom) .woocommerce-MyAccount-content-wrapper, .e-my-account-tab__orders .woocommerce-MyAccount-content-wrapper, .e-my-account-tab__downloads .woocommerce-MyAccount-content-wrapper, address, .e-my-account-tab__edit-account .woocommerce-MyAccount-content-wrapper, .e-my-account-tab__view-order .order_details, .woocommerce-form-login, .woocommerce-form-register, .woocommerce-ResetPassword, .e-my-account-tab__payment-methods .woocommerce-MyAccount-content-wrapper' )
	->with( Box_Shadow_Group::from_prefix( 'my_account_sections_box_shadow' ) )
	->bind( 'background', V3_Control::bind_to( 'my_account_sections_background_color' ) )
	->bind( 'border-style', V3_Control::bind_to( 'sections_border_type' ) )
	->bind( 'border-width', V3_Control::bind_to( 'sections_border_width' )->responsive() )
	->bind( 'border-color', V3_Control::bind_to( 'sections_border_color' ) )
	->bind( 'border-radius', V3_Control::bind_to( 'sections_border_radius' )->responsive() )
	->bind( 'padding', V3_Control::bind_to( 'sections_padding' )->responsive() );

$titles = Style_Target::make( 'titles' )
	->label( 'Section titles' )
	->description( 'Headings inside the account pages and the login and register forms.' )
	->selector( '.e-my-account-tab:not(.e-my-account-tab__dashboard--custom) h2, .e-my-account-tab:not(.e-my-account-tab__dashboard--custom) h3' )
	->with( Typography_Group::from_prefix( 'section_titles_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'typography_section_titles_color' ) );

$text = Style_Target::make( 'text' )
	->label( 'General text' )
	->description( 'Paragraphs, addresses and form legends inside the account pages.' )
	->selector( '.woocommerce-MyAccount-content > div > p, address, .woocommerce-EditAccountForm fieldset legend, .woocommerce-ResetPassword p:nth-child(1), .woocommerce-OrderUpdate' )
	->defaults( [ 'color' => '#69727d' ] )
	->with( Typography_Group::from_prefix( 'general_text_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'general_text_color' ) );

$links = Style_Target::make( 'links' )
	->label( 'Links' )
	->description( 'Links inside the account page content. hover styles them under the pointer.' )
	->selector( '.e-my-account-tab:not(.e-my-account-tab__dashboard--custom) .woocommerce a' )
	->bind( 'color', V3_Control::bind_to( 'links_normal_color' ) )
	->bind( 'color', V3_Control::bind_to( 'links_hover_color' ), $hover );

$labels = Style_Target::make( 'labels' )
	->label( 'Field labels' )
	->description( 'Labels of the login, register, account details and address fields.' )
	->selector( '.woocommerce-form-row label, .woocommerce-address-fields label' )
	->with( Typography_Group::from_prefix( 'forms_label_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'forms_label_color' ) );

$buttons = Style_Target::make( 'buttons' )
	->label( 'Form buttons' )
	->description( 'Submit buttons of the account forms: login, register, reset password, save account details and addresses, and add payment method. hover styles them under the pointer.' )
	->selector( 'button.button, .login .button, .register .button, .woocommerce-ResetPassword .button, #add_payment_method #payment #place_order' )
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
	->label( 'Table rows' )
	->description( 'Cells of the orders, downloads, order details and payment methods tables. Present only on the account pages that have those tables, and only once the customer has orders or downloads.' )
	->selector( '.e-my-account-tab__orders tbody td, .e-my-account-tab__downloads tbody td, .woocommerce-table--order-downloads tbody td, .woocommerce-table--order-details td a, .product-quantity, td.product-total, td.payment-method-method, td.payment-method-expires' )
	->with( Typography_Group::from_prefix( 'tables_items_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'tables_items_color' ) );

$table_buttons = Style_Target::make( 'table-buttons' )
	->label( 'Table buttons' )
	->description( 'Action buttons inside the tables, such as View, Pay and Download, and the pagination buttons of long order lists. hover styles them under the pointer.' )
	->selector( '.shop_table .button, .order-again .button, .woocommerce-pagination .button' )
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
	->default_target( $account_tabs )
	->targets( $sections, $titles, $text, $links, $labels, Woo_Form_Fields::target( '.woocommerce-Input', 'Inputs of the login, register and account details forms.' ), $buttons, $table_items, $table_buttons );
