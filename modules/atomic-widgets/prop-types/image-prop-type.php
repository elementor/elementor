<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Utils;

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
		$this->internal_types['size'] = String_Prop_Type::make();
	}

	public function get_default() {
		return [
			'$$type' => static::get_key(),
			'value' => [
				'src' => [
					'$$type' => Image_Src_Prop_Type::get_key(),
					'value' => [
						'url' => $this->default_url,
						'id' => $this->default_id,
					],
				],
				'size' => $this->default_size,
			],
		];
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
			$this->internal_types['src']->validate( $value['src'] );
		}

		if ( isset( $value['size'] ) ) {
			$this->internal_types['size']->validate( $value['size'] );
		}
	}
}
