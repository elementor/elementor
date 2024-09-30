<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Image_Src_Prop_Type extends Transformable_Prop_Type {

	public static function get_key(): string {
		return 'image-src';
	}

	protected function validate_value( $value ): void {
		if (
			! array_key_exists( 'id', $value ) ||
			! array_key_exists( 'url', $value )
		) {
			throw new \Exception( 'Value must have both `id` and `url` keys.' );
		}

		$has_id = null !== $value['id'];
		$has_url = null !== $value['url'];

		if ( ! $has_id && ! $has_url ) {
			throw new \Exception( 'At least one of `id` or `url` must be set.' );
		}

		if ( $has_id && ! is_numeric( $value['id'] ) ) {
			throw new \Exception( '`id` must be a number, ' . gettype( $value['id'] ) . ' given.' );
		}

		if ( $has_id && ! Plugin::$instance->wp->wp_attachment_is_image( $value['id'] ) ) {
			throw new \Exception( '`id` must be a valid attachment ID.' );
		}

		if ( $has_url && ! is_string( $value['url'] ) ) {
			throw new \Exception( '`url` must be a string, ' . gettype( $value['url'] ) . ' given.' );
		}

		if ( $has_url && false === wp_http_validate_url( $value['url'] ) ) {
			throw new \Exception( '`url` must be a valid URL.' );
		}
	}
}
