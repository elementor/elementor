<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Immutable per-node conversion metadata: everything a converter needs to look up
 * the mapping for a rule without recomputing it per declaration.
 */
class V3_Context_Meta {

	private string $widget_type;
	private array $widget_config;
	private array $overrides;
	private array $generic_index;

	public function __construct( string $widget_type, array $widget_config, array $overrides, array $generic_index ) {
		$this->widget_type = $widget_type;
		$this->widget_config = $widget_config;
		$this->overrides = $overrides;
		$this->generic_index = $generic_index;
	}

	public function widget_type(): string {
		return $this->widget_type;
	}

	public function widget_config(): array {
		return $this->widget_config;
	}

	public function overrides(): array {
		return $this->overrides;
	}

	public function generic_index(): array {
		return $this->generic_index;
	}

	public function controls(): array {
		$controls = $this->widget_config['controls'] ?? [];

		return is_array( $controls ) ? $controls : [];
	}

	public function has_control( string $key ): bool {
		return array_key_exists( $key, $this->controls() );
	}

	public function match_key( string $property, ?string $state ): string {
		return null === $state ? $property : $property . '@' . $state;
	}

	public function get_override( string $property, ?string $state ): ?array {
		$key = $this->match_key( $property, $state );

		return $this->overrides[ $key ] ?? null;
	}

	public function get_generic_rule( string $property, ?string $state ): ?array {
		$key = $this->match_key( $property, $state );

		return $this->generic_index[ $key ] ?? null;
	}
}
