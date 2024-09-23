<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Image_Prop_Type extends Transformable_Prop_Type {

	public static function get_key(): string {
		return 'image';
	}

	public function __construct() {
		$this->internal_types['src'] = Image_Src_Prop_Type::make()->default( [
			'id' => null,
			'url' => Utils::get_placeholder_image_src(),
		] );

		$this->internal_types['size'] = String_Prop_Type::make()->default( 'full' );

		// TODO: Find a better way?
		$this->default( [
			'src' => $this->internal_types['src']->get_default(),
			'size' => $this->internal_types['size']->get_default(),
		] );
	}

	public function default_url( string $url ): self {
		$this->default['value']['src']['value']['url'] = $url;

		return $this;
	}

	public function default_id( int $id ): self {
		$this->default['value']['src']['value']['id'] = $id;

		return $this;
	}

	public function default_size( string $size ): self {
		$this->default['value']['size'] = $size;

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
