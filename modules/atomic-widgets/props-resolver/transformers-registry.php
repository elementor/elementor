<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Multi_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Transformer;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Transformers_Registry extends Collection {
	public function register( string $key, $transformer ): self {
		$is_valid_transformer = $transformer instanceof Transformer || $transformer instanceof Multi_Transformer;

		if ( ! $is_valid_transformer ) {
			Utils::safe_throw( 'Transformer must implement Transformer or Multi_Transformer interface.' );

			return $this;
		}

		if ( isset( $this->items[ $key ] ) ) {
			Utils::safe_throw( "{$key} transformer is already registered." );

			return $this;
		}

		$this->items[ $key ] = $transformer;

		return $this;
	}

	public function get( $key, $default = null ) {
		$item = parent::get( $key, $default );

		if ( ! $this->is_valid_item( $item ) ) {
			return $default;
		}

		return $item;
	}

	protected function is_valid_item( $item ): bool {
		return $item instanceof Transformer || $item instanceof Multi_Transformer;
	}
}
