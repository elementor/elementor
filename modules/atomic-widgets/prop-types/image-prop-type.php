<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\Utils\Image\Image_Sizes;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Image_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'image';
	}

	protected function define_shape(): array {
		return [
			'src' => Image_Src_Prop_Type::make()->required(),
			'size' => String_Prop_Type::make()
				->initial_value( Image_Sizes::DEFAULT_SIZE )
				->enum( Image_Sizes::get_keys() )
				->required()
				->description( 'The image file size to use, affecting quality only!. This DOES NOT affect dimensions on the page. For affecting dimensions, use the element\'s style schema instead' ),
		];
	}

	public function default_url( string $url ): self {
		$this->get_shape_field( 'src' )->default( [
			'id' => null,
			'url' => Url_Prop_Type::generate( $url ),
		] );

		return $this;
	}

	public function default_size( string $size ): self {
		$this->get_shape_field( 'size' )->default( $size );

		return $this;
	}
}
