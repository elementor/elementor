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
		$is_tuple = is_array( $key ) && 2 === count( $key );

		if ( $is_tuple ) {
			[ $key, $value ] = $key;
		}

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
