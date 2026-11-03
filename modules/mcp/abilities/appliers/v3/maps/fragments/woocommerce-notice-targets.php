<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Kit_Controls_Source;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Control;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * The site-wide WooCommerce notice styles, shared by every widget that prints WooCommerce notices.
 */
class Woocommerce_Notice_Targets {

	const KIT_TAB = 'settings-woocommerce';

	const KIT_SECTIONS = [ 'section_woocommerce_notices', 'woocommerce_error_notices', 'woocommerce_message_notices', 'woocommerce_info_notices' ];

	const NOTICE_TYPES_SETTING = 'woocommerce_notices_elements';

	const HOVER_STATE = 'hover';

	const SITE_WIDE = 'Site-wide: it styles every WooCommerce notice of this type on every page, including Cart, Checkout, My Account and pages not built with Elementor, not only this widget. The editor preview shows demo notices.';

	/**
	 * @return Style_Target[] The error notice first.
	 */
	public static function all(): array {
		return [
			self::notice_box( 'error-notice', 'Error notice', 'error', 'wc_error' ),
			self::link( 'error-notice-link', 'Error notice links', 'error notices, such as Return to shop', 'error_message' ),
			self::error_icon(),
			self::notice_box( 'message-notice', 'Message notice', 'message', 'wc_message' ),
			self::link( 'message-notice-link', 'Message notice links', 'message (success) notices, such as Undo after removing a cart item', 'notice_message' ),
			self::notice_button( 'message-notice-button', 'Message notice buttons', 'message', 'wc_message' ),
			self::notice_box( 'info-notice', 'Info notice', 'info', 'wc_info' ),
			self::notice_button( 'info-notice-button', 'Info notice buttons', 'info', 'wc_info' ),
		];
	}

	private static function site_wide_target( string $alias, string $label, string $description ): Style_Target {
		return Style_Target::make( $alias )
			->label( $label )
			->description( $description . ' ' . self::SITE_WIDE )
			->kit_hosted( new Kit_Controls_Source( self::KIT_TAB, self::KIT_SECTIONS, [ self::NOTICE_TYPES_SETTING ] ) );
	}

	private static function background( string $prefix, string $notice_type ): V3_Control {
		return V3_Control::bind_to( $prefix . '_color' )->requires( [
			$prefix . '_background' => Background_Group::CLASSIC,
			self::NOTICE_TYPES_SETTING => $notice_type,
		] );
	}

	private static function notice_box( string $alias, string $label, string $type, string $notice_type ): Style_Target {
		return self::site_wide_target( $alias, $label, 'The ' . strtolower( $label ) . ' box and its text.' )
			->with( Typography_Group::from_prefix( $type . '_message_text_typography' ) )
			->with( Border_Group::from_prefix( $type . '_notice_box_border' ) )
			->with( Box_Shadow_Group::from_prefix( $type . '_notice_box_box_shadow' ) )
			->bind( 'color', V3_Control::bind_to( $type . '_message_text_color' ) )
			->bind( 'background', self::background( $type . '_notice_box_background', $notice_type ) )
			->bind( 'border-radius', V3_Control::bind_to( $type . '_notice_box_border_radius' )->responsive() );
	}

	private static function notice_button( string $alias, string $label, string $type, string $notice_type ): Style_Target {
		return self::site_wide_target( $alias, $label, "Buttons inside {$type} notices, such as View cart. hover styles them under the pointer." )
			->with( Typography_Group::from_prefix( $type . '_button_typography' ) )
			->with( Box_Shadow_Group::from_prefix( $type . '_buttons_normal_box_shadow' ) )
			->with( Box_Shadow_Group::from_prefix( $type . '_buttons_focus_box_shadow', self::HOVER_STATE ) )
			->bind( 'color', V3_Control::bind_to( $type . '_buttons_normal_text_color' ) )
			->bind( 'color', V3_Control::bind_to( $type . '_buttons_hover_text_color' ), self::HOVER_STATE )
			->bind( 'background', self::background( $type . '_buttons_normal_background', $notice_type ) )
			->bind( 'background', self::background( $type . '_buttons_hover_background', $notice_type ), self::HOVER_STATE )
			->bind( 'border-style', V3_Control::bind_to( $type . '_buttons_border_type' ) )
			->bind( 'border-width', V3_Control::bind_to( $type . '_buttons_border_width' )->responsive() )
			->bind( 'border-color', V3_Control::bind_to( $type . '_buttons_border_color' ) )
			->bind( 'border-color', V3_Control::bind_to( $type . '_buttons_hover_border_color' ), self::HOVER_STATE )
			->bind( 'border-radius', V3_Control::bind_to( $type . '_buttons_border_radius' )->responsive() )
			->bind( 'padding', V3_Control::bind_to( $type . '_buttons_padding' )->responsive() );
	}

	private static function link( string $alias, string $label, string $examples, string $prefix ): Style_Target {
		return self::site_wide_target( $alias, $label, "Links inside {$examples}. hover styles them under the pointer." )
			->with( Typography_Group::from_prefix( $prefix . '_link_typography' ) )
			->bind( 'color', V3_Control::bind_to( $prefix . '_normal_links_color' ) )
			->bind( 'color', V3_Control::bind_to( $prefix . '_hover_links_color' ), self::HOVER_STATE );
	}

	private static function error_icon(): Style_Target {
		return self::site_wide_target( 'error-notice-icon', 'Error notice icon', 'The icon at the start of error notices.' )
			->bind( 'color', V3_Control::bind_to( 'error_message_icon_color' ) );
	}
}
