<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class V3_Control_Adapter_Registry {

	/**
	 * @var V3_Control_Adapter[]
	 */
	private array $adapters;

	/**
	 * @param V3_Control_Adapter[] $adapters
	 */
	public function __construct( array $adapters ) {
		$this->adapters = $adapters;
	}

	public static function create_default(): self {
		return new self( [
			new Color_Adapter(),
			new Background_Color_Adapter(),
			new Size_Slider_Adapter(),
			new Dimensions_Adapter(),
			new Dimensions_Sides_Slider_Adapter(),
			new String_Choice_Adapter(),
		] );
	}

	public function find( string $prop_type, string $control_type, bool $has_sides ): ?V3_Control_Adapter {
		foreach ( $this->adapters as $adapter ) {
			if ( $adapter->supports( $prop_type, $control_type, $has_sides ) ) {
				return $adapter;
			}
		}

		return null;
	}
}
