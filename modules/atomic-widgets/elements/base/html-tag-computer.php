<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Base;

use Elementor\Modules\AtomicWidgets\PropTypes\Link_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Html_Tag_Computer {

	public const FOLLOW_LINK_OPTION = 'follow_link';

	public static function compute( array $settings, string $default, array $options = [] ): string {
		$follow_link = $options[ self::FOLLOW_LINK_OPTION ] ?? true;

		if ( $follow_link && self::settings_have_active_link( $settings ) ) {
			return self::extract_link_html_tag( $settings['link'] ?? [] );
		}

		$settings_tag = self::extract_html_tag_value( $settings['tag'] ?? null );

		if ( null !== $settings_tag && '' !== $settings_tag ) {
			return $settings_tag;
		}

		return $default;
	}

	public static function settings_have_active_link( array $settings ): bool {
		$link = $settings['link'] ?? null;

		if ( ! is_array( $link ) ) {
			return false;
		}

		$href = self::extract_html_tag_value( $link['href'] ?? null );

		if ( null !== $href && '' !== $href ) {
			return true;
		}

		$attributes = $link['attributes'] ?? null;

		if ( is_string( $attributes ) && '' !== $attributes ) {
			return true;
		}

		return false;
	}

	public static function extract_link_html_tag( array $link ): string {
		$tag = self::extract_html_tag_value( $link['tag'] ?? null );

		if ( null !== $tag && '' !== $tag ) {
			return $tag;
		}

		return Link_Prop_Type::DEFAULT_TAG;
	}

	public static function extract_html_tag_value( $value ): ?string {
		if ( is_array( $value ) && isset( $value['value'] ) && is_string( $value['value'] ) ) {
			return $value['value'];
		}

		if ( is_string( $value ) ) {
			return $value;
		}

		return null;
	}
}
