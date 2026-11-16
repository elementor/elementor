<?php

namespace Elementor\Modules\AtomicWidgets\PlainResolvers;

use Elementor\Core\Utils\Collection;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Plain_Resolvers_Registry extends Collection {
	private ?Plain_Resolver_Base $fallback = null;

	public function register( string $key, Plain_Resolver_Base $resolver ): self {
		$this->items[ $key ] = $resolver;

		return $this;
	}

	public function register_fallback( Plain_Resolver_Base $resolver ): self {
		$this->fallback = $resolver;

		return $this;
	}

	public function has( string $key ): bool {
		return array_key_exists( $key, $this->items );
	}

	public function get( $key, $fallback = null ) {
		return parent::get( $key, $fallback ?? $this->fallback );
	}
}
