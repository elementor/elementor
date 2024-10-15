<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Concerns;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @mixin Prop_Type
 */
trait Has_Meta {
	protected array $meta = [];

	public function meta( $key, $value = null ): self {
		$is_tuple = is_array( $value ) && 2 === count( $value );

		[ $key, $value ] = $is_tuple ? $key : [ $key, $value ];

		$this->meta[ $key ] = $value;

		return $this;
	}

	public function get_meta(): array {
		return $this->meta;
	}

	public function get_meta_item( $key, $default = null ) {
		return $this->meta[ $key ] ?? $default;
	}
}
