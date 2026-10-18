<?php

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Border_Group;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Box_Shadow_Group;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Typography_Group;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Control;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Setting;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$boxes = Style_Target::make( 'boxes' )
	->label( 'Box around each unit (days, hours, minutes, seconds)' )
	->selector( '.elementor-countdown-item' )
	->defaults( [ 'padding' => '20px 0' ] )
	->with( Border_Group::from_prefix( 'box_border' ) )
	->with( Box_Shadow_Group::from_prefix( 'box_shadow' ) )
	->bind( 'background', V3_Control::bind_to( 'box_background_color' ) )
	->bind( 'padding', V3_Control::bind_to( 'box_padding' )->responsive() )
	->bind( 'border-radius', V3_Control::bind_to( 'box_border_radius' ) );

$digits = Style_Target::make( 'digits' )
	->label( 'Countdown digits' )
	->selector( '.elementor-countdown-digits' )
	->defaults( [
		'font-size' => '69px',
		'line-height' => '1',
	] )
	->with( Typography_Group::from_prefix( 'digits_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'digits_color' ) );

$label = Style_Target::make( 'label' )
	->label( 'Unit labels (Days, Hours, ...)' )
	->selector( '.elementor-countdown-label' )
	->defaults( [ 'line-height' => '1' ] )
	->with( Typography_Group::from_prefix( 'label_typography' ) )
	->bind( 'color', V3_Control::bind_to( 'label_color' ) );

// The message controls are conditioned on `expire_actions` containing `message`. Deriving that
// requirement would write a scalar over the multi-select (dropping e.g. the redirect action), so
// the requirement is declared explicitly: nothing is written, and the inactive-condition warning
// tells the caller the style only takes effect while the message action is enabled.
$message = Style_Target::make( 'message' )
	->label( 'Message shown when the countdown expires; only takes effect while expire_actions includes message' )
	->selector( '.elementor-countdown-expire--message' )
	->defaults( [
		'text-align' => 'center',
		'padding' => '20px',
	] )
	->bind( 'color', V3_Control::bind_to( 'text_color' )->requires( [] ) )
	->bind( 'text-align', V3_Control::bind_to( 'align' )->responsive()->requires( [] ) )
	->bind( 'padding', V3_Control::bind_to( 'message_padding' )->responsive()->requires( [] ) );

foreach ( Typography_Group::FIELDS as $prop => [ $suffix, $is_responsive ] ) {
	$control = V3_Control::bind_to( 'typography' . $suffix )->requires( [ 'typography_typography' => 'custom' ] );

	$message->bind( $prop, $is_responsive ? $control->responsive() : $control );
}

$container = Style_Target::make( 'container' )
	->label( 'Row holding all boxes' )
	->selector( '.elementor-countdown-wrapper' )
	->bind( 'max-width', V3_Control::bind_to( 'container_width' )->responsive() )
	->bind( 'text-align', V3_Control::bind_to( 'boxes_alignment' ) );

return V3_Widget_Map::make( 'countdown' )
	->description( 'Countdown timer to a due date or an evergreen duration per visitor, with optional labels and expiry actions.' )
	->settings( [
		'countdown_type' => V3_Setting::bind_to( 'countdown_type' )->enum_from_control(),
		'due_date' => V3_Setting::bind_to( 'due_date' )->string()->dynamic(),
		'evergreen_counter_hours' => V3_Setting::bind_to( 'evergreen_counter_hours' )->number()->dynamic(),
		'evergreen_counter_minutes' => V3_Setting::bind_to( 'evergreen_counter_minutes' )->number()->dynamic(),
		'show_days' => V3_Setting::bind_to( 'show_days' )->switcher(),
		'show_hours' => V3_Setting::bind_to( 'show_hours' )->switcher(),
		'show_minutes' => V3_Setting::bind_to( 'show_minutes' )->switcher(),
		'show_seconds' => V3_Setting::bind_to( 'show_seconds' )->switcher(),
		'show_labels' => V3_Setting::bind_to( 'show_labels' )->switcher(),
		'expire_actions' => V3_Setting::bind_to( 'expire_actions' )->multi_enum_from_control(),
		'message_after_expire' => V3_Setting::bind_to( 'message_after_expire' )->string()->dynamic(),
		'expire_redirect_url' => V3_Setting::bind_to( 'expire_redirect_url' )->link(),
	] )
	->default_target( $boxes )
	->targets( $digits, $label, $message, $container );
