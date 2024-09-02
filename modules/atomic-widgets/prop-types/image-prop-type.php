<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\DynamicTags\Module as DynamicTags;
use Elementor\Utils;

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
			Utils::safe_throw( 'Value must have an `attachment_id` or a `url` key.' );
		}

		if ( $has_id && $has_url ) {
			Utils::safe_throw( 'Value must have either an `attachment_id` or a `url` key, not both.' );
		}

		if ( $has_id && ! is_numeric( $value['attachment_id'] ) ) {
			Utils::safe_throw( 'Attachment id must be numeric, ' . gettype( $value['attachment_id'] ) . ' given.' );
		}

		if ( $has_url && ! is_string( $value['url'] ) ) {
			Utils::safe_throw( 'URL must be a string, ' . gettype( $value['url'] ) . ' given.' );
		}
	}
}
