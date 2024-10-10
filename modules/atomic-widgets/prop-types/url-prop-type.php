<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Primitive_Prop_Type;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Image_Attachment_Id_Prop_Type extends Number_Prop_Type {
	public static function get_key(): string {
		return 'image-attachment-id';
	}

	protected function validate_value( $value ): bool {
		return parent::validate_value( $value ) && Plugin::$instance->wp->wp_attachment_is_image( $value );

		if ( $has_url && ! is_string( $value['url'] ) ) {
			throw new \Exception( '`url` must be a string, ' . gettype( $value['url'] ) . ' given.' );
		}

		if ( $has_url && false === wp_http_validate_url( $value['url'] ) ) {
			throw new \Exception( '`url` must be a valid URL.' );
		}
	}
}
