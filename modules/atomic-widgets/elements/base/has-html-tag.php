<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Base;

use Elementor\Modules\AtomicWidgets\PropTypes\Link_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

trait Has_Html_Tag {

	protected function define_default_html_tag() {
		return 'div';
	}

	public function get_computed_html_tag( array $settings ): string {
		if ( static::settings_have_active_link( $settings ) ) {
			return static::extract_link_html_tag( $settings['link'] ?? [] );
		}

		$settings_tag = static::extract_html_tag_value( $settings['tag'] ?? null );

		if ( null !== $settings_tag && '' !== $settings_tag ) {
			return $settings_tag;
		}

		return $this->define_default_html_tag();
	}

	protected static function settings_have_active_link( array $settings ): bool {
		$link = $settings['link'] ?? null;

		if ( ! is_array( $link ) ) {
			return false;
		}

		$href = static::extract_html_tag_value( $link['href'] ?? null );

		if ( null !== $href && '' !== $href ) {
			return true;
		}

		$attributes = $link['attributes'] ?? null;

		if ( is_string( $attributes ) && '' !== $attributes ) {
			return true;
		}

		return false;
	}

	protected static function extract_link_html_tag( array $link ): string {
		$tag = static::extract_html_tag_value( $link['tag'] ?? null );

		if ( null !== $tag && '' !== $tag ) {
			return $tag;
		}

		return Link_Prop_Type::DEFAULT_TAG;
	}

	protected static function extract_html_tag_value( $value ): ?string {
		if ( is_array( $value ) && isset( $value['value'] ) && is_string( $value['value'] ) ) {
			return $value['value'];
		}

		if ( is_string( $value ) ) {
			return $value;
		}

		return null;
	}
}
