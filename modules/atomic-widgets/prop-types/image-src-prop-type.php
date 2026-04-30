<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Image_Src_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'image-src';
	}

	protected function define_shape(): array {
		return [
			'id' => Image_Attachment_Id_Prop_Type::make()->description( 'The ID of the image attachment in the WordPress media library, applicable for internal images only' ),
			'url' => Url_Prop_Type::make(),
		];
	}

	public function default_url( string $url ): self {
		$this->default( [
			'id' => null,
			'url' => Url_Prop_Type::generate( $url ),
		] );

		return $this;
	}

	protected function validate_value( $value ): bool {
		$effective = array_filter( $value, function ( $field ) {
			if ( null === $field ) {
				return false;
			}
			if ( is_array( $field ) && array_key_exists( 'value', $field ) && null === $field['value'] ) {
				return false;
			}
			return (bool) $field;
		} );

		$only_one_key = count( $effective ) === 1;

		return $only_one_key && parent::validate_value( $value );
	}
}
