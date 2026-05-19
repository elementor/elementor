<?php

namespace Elementor\Modules\AtomicWidgets\DynamicTags;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Dynamic_Style_Policy {
	public const DELIVERY_STATIC = 'static';
	public const DELIVERY_SCOPED = 'scoped';
	public const DELIVERY_PAGE_INLINE = 'page_inline';

	public function contains_dynamic_value( $value ): bool {
		if ( ! is_array( $value ) ) {
			return false;
		}

		if ( Dynamic_Prop_Type::is_dynamic_prop_value( $value ) ) {
			return true;
		}

		foreach ( $value as $item ) {
			if ( $this->contains_dynamic_value( $item ) ) {
				return true;
			}
		}

		return false;
	}

	public function variant_has_dynamic_props( array $variant ): bool {
		return $this->contains_dynamic_value( $variant['props'] ?? [] );
	}

	public function requires_page_inline_delivery( $style_definitions ): bool {
		if ( ! is_array( $style_definitions ) ) {
			return false;
		}

		foreach ( $style_definitions as $style ) {
			if ( ! is_array( $style ) ) {
				continue;
			}

			foreach ( $style['variants'] ?? [] as $variant ) {
				if ( ! is_array( $variant ) ) {
					continue;
				}

				if ( ! $this->variant_has_dynamic_props( $variant ) ) {
					continue;
				}

				if ( ! empty( $variant['meta']['is_scoped'] ) ) {
					continue;
				}

				return true;
			}
		}

		return false;
	}

	public function has_scoped_dynamic_delivery( $style_definitions ): bool {
		if ( ! is_array( $style_definitions ) ) {
			return false;
		}

		foreach ( $style_definitions as $style ) {
			if ( ! is_array( $style ) ) {
				continue;
			}

			foreach ( $style['variants'] ?? [] as $variant ) {
				if ( ! is_array( $variant ) ) {
					continue;
				}

				if ( empty( $variant['meta']['is_scoped'] ) ) {
					continue;
				}

				if ( $this->variant_has_dynamic_props( $variant ) ) {
					return true;
				}
			}
		}

		return false;
	}

	public function resolve_delivery_mode( $style_definitions ): string {
		if ( ! is_array( $style_definitions ) ) {
			return self::DELIVERY_STATIC;
		}

		if ( $this->requires_page_inline_delivery( $style_definitions ) ) {
			return self::DELIVERY_PAGE_INLINE;
		}

		if ( $this->has_scoped_dynamic_delivery( $style_definitions ) ) {
			return self::DELIVERY_SCOPED;
		}

		foreach ( $style_definitions as $style ) {
			if ( ! is_array( $style ) ) {
				continue;
			}

			foreach ( $style['variants'] ?? [] as $variant ) {
				if ( is_array( $variant ) && $this->variant_has_dynamic_props( $variant ) ) {
					return self::DELIVERY_PAGE_INLINE;
				}
			}
		}

		return self::DELIVERY_STATIC;
	}
}
