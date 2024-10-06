<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\Image_Sizes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Image_Prop_Type extends Transformable_Prop_Type {

	private ?string $default_url = null;

	private ?int $default_id = null;

	private ?string $default_size = null;

	public static function get_key(): string {
		return 'image';
	}

	public function __construct() {
		$this->internal_types['src'] = Image_Src_Prop_Type::make();

		$this->internal_types['size'] = String_Prop_Type::make()->enum( Image_Sizes::get_keys() );
	}

	public function get_default() {
		$default = [
			'$$type' => static::get_key(),
			'value' => null,
		];

		if ( isset( $this->default_url ) || isset( $this->default_id ) ) {
			$default['value']['src'] = [
				'$$type' => 'image-src',
				'value' => [
					'id' => $this->default_id ?? null,
					'url' => $this->default_url ?? null,
				],
			];
		}

		if ( isset( $this->default_size ) ) {
			$default['value']['size'] = $this->default_size;
		}

		return isset( $default['value'] )
			? $default
			: null;
	}

	public function default_url( string $url ): self {
		$this->default_url = $url;

		return $this;
	}

	public function default_id( int $id ): self {
		$this->default_id = $id;

		return $this;
	}

	public function default_size( string $size ): self {
		$this->default_size = $size;

		return $this;
	}

	protected function validate_value( $value ): void {
		if ( isset( $value['src'] ) ) {
			$this->internal_types['src']->validate_with_additional( $value['src'] );
		}

		if ( isset( $value['size'] ) ) {
			$this->internal_types['size']->validate_with_additional( $value['size'] );
		}
	}
}
