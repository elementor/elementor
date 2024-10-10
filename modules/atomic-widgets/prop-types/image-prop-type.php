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
			'src' => Image_Src_Prop_Type::make(),
			'size' => String_Prop_Type::make()->enum( Image_Sizes::get_keys() ),
		];
	}

	public function default_url( string $url ): self {
		$default = $this->get_default();
		$src_prop = $this->get_props( 'src' );

		$this->default( [
			'src' => $src_prop->generate_value( [
				'id' => null,
				'url' => $url,
			] ),
			'size' => $default['value']['size'] ?? null,
		] );

		return $this;
	}

	public function default_size( string $size ): self {
		$default = $this->get_default();
		$size_prop = $this->get_props( 'size' );

		$this->default( [
			'src' => $default['value']['src'] ?? null,
			'size' => $size_prop->generate_value( $size ),
		] );

		return $this;
	}
}
