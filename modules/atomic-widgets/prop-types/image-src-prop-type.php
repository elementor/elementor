<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Image_Src_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'image-src';
	}

	protected function define_shape(): array {
		return [
			'id'  => Image_Attachment_Id_Prop_Type::make()->description( 'The ID of the image attachment in the WordPress media library, applicable for internal images only' ),
			'url' => Url_Prop_Type::make(),
			'alt' => String_Prop_Type::make()->description( 'The alt text of the image' ),
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
		$has_id  = ! empty( $value['id'] );
		$has_url = ! empty( $value['url'] );

		return ( $has_id xor $has_url ) && parent::validate_value( $value );
	}
}
