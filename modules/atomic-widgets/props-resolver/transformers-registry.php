<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver;

use Elementor\Core\Utils\Collection;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Transformers_Registry extends Collection {
	public function register( string $key, Transformer_Base $transformer ): self {
		if ( isset( $this->items[ $key ] ) ) {
			Utils::safe_throw( "{$key} transformer is already registered." );

			return $this;
		}

		$this->items[ $key ] = $transformer;

		return $this;
	}
}
