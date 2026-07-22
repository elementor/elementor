<?php

namespace Elementor\Modules\AtomicWidgets\EnvelopeSerializers;

use Elementor\Core\Utils\Collection;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Envelope_Serializers_Registry extends Collection {
	private ?Envelope_Serializer_Base $fallback = null;

	public function register( string $key, Envelope_Serializer_Base $serializer ): self {
		$this->items[ $key ] = $serializer;

		return $this;
	}

	public function register_fallback( Envelope_Serializer_Base $serializer ): self {
		$this->fallback = $serializer;

		return $this;
	}

	public function has( string $key ): bool {
		return array_key_exists( $key, $this->items );
	}

	public function get( $key, $fallback = null ) {
		return parent::get( $key, $fallback ?? $this->fallback );
	}
}
