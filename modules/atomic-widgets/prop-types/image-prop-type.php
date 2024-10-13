<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\Image_Sizes;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Image_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'image';
	}

	public function init_props(): array {
		return [
			'src' => Image_Src_Prop_Type::make()->required(),
			'size' => String_Prop_Type::make()->enum( Image_Sizes::get_keys() )->required(),
		];
	}

	public function default_url( string $url ): self {
		$this->get_prop( 'src' )->default( [
			'id' => null,
			'url' => $url,
		] );

		return $this;
	}

	public function default_size( string $size ): self {
		$this->get_prop( 'size' )->default( $size );

		return $this;
	}
}
