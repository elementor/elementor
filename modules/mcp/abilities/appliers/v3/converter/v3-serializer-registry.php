<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registration-order iterator of {@see V3_Property_Serializer}. Inverse of
 * {@see V3_Converter_Registry}.
 */
class V3_Serializer_Registry {

	/** @var V3_Property_Serializer[] */
	private array $serializers = [];

	public function register( V3_Property_Serializer $serializer ): self {
		$this->serializers[] = $serializer;

		return $this;
	}

	/**
	 * @return V3_Property_Serializer[]
	 */
	public function all(): array {
		return $this->serializers;
	}
}
