<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver;

use Elementor\Core\Utils\Collection;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Transformers_Registry extends Collection {
	public function register( Transformer_Base $transformer ): self {
		if ( isset( $this->items[ $transformer->get_type() ] ) ) {
			Utils::safe_throw( "{$transformer->get_type()} transformer is already registered." );

			return $this;
		}

		$this->items[ $transformer->get_type() ] = $transformer;

		return $this;
	}
}
