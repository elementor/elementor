<?php

namespace Elementor\Modules\AtomicWidgets\PropsHandler;

use Elementor\Core\Utils\Collection;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Transformers_Registry extends Collection {
	public function register( Transformer_Base $transformer ): self {
		$this->items[ $transformer->get_type() ] = $transformer;

		return $this;
	}
}
