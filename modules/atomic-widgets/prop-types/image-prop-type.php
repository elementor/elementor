<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Image_Prop_Type extends Transformable_Prop_Type {

	public static function get_key(): string {
		return 'image';
	}

	public function validate_value( $value ): void {
		$has_id = isset( $value['attachment_id'] );
		$has_url = isset( $value['url'] );

		if ( ! $has_id && ! $has_url ) {
			throw new \Exception( 'Value must have an `attachment_id` or a `url` key.' );
		}

		if ( $has_id && $has_url ) {
			throw new \Exception( 'Value must have either an `attachment_id` or a `url` key, not both.' );
		}

		if ( $has_id && ! is_numeric( $value['attachment_id'] ) ) {
			throw new \Exception( 'Attachment id must be numeric, ' . gettype( $value['attachment_id'] ) . ' given.' );
		}

		if ( $has_url && ! is_string( $value['url'] ) ) {
			throw new \Exception( 'URL must be a string, ' . gettype( $value['url'] ) . ' given.' );
		}
	}
}
