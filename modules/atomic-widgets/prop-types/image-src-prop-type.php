<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Plugin;
use Elementor\Modules\AtomicWidgets\Image\Placeholder_Image;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Image_Src_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'image-src';
	}

	protected function define_shape(): array {
		return [
			'id' => Image_Attachment_Id_Prop_Type::make(),
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
		$only_one_key = count( array_filter( $value ) ) === 1;

		return $only_one_key && parent::validate_value( $value );
	}

	public function sanitize_value( $value ) {
		if ( ! Plugin::$instance->wp->wp_attachment_is_image( $value['id'] && ! $value['url']['$value'] ) ) {
			return [
				'id' => null,
				'url' => [
					'$$type' => 'url',
					'value' => Placeholder_Image::get_placeholder_image()
				],
			];
		};
		
		return $value;
	}
}
