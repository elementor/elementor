<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Compiled_V3_Map {

	private string $widget_type;

	private string $description;

	/**
	 * @var array<string, Compiled_V3_Setting>
	 */
	private array $settings;

	private string $default_target;

	/**
	 * @var array<string, Compiled_Style_Target>
	 */
	private array $targets;

	/**
	 * @var string[]
	 */
	private array $kit_target_aliases;

	/**
	 * @var string[]
	 */
	private array $kit_keys;

	/**
	 * @param string                               $widget_type
	 * @param string                               $description
	 * @param array<string, Compiled_V3_Setting>   $settings
	 * @param string                               $default_target
	 * @param array<string, Compiled_Style_Target> $targets
	 * @param string[]                             $kit_target_aliases {@see Style_Target::kit_hosted()}.
	 * @param string[]                             $kit_keys           Settings stored on the active kit.
	 */
	public function __construct( string $widget_type, string $description, array $settings, string $default_target, array $targets, array $kit_target_aliases = [], array $kit_keys = [] ) {
		$this->widget_type = $widget_type;
		$this->description = $description;
		$this->settings = $settings;
		$this->default_target = $default_target;
		$this->targets = $targets;
		$this->kit_target_aliases = $kit_target_aliases;
		$this->kit_keys = $kit_keys;
	}

	public function get_settings_host(): V3_Map_Settings_Host {
		if ( empty( $this->kit_target_aliases ) ) {
			return new Node_Settings_Host();
		}

		if ( count( $this->kit_target_aliases ) === count( $this->targets ) ) {
			return new Kit_Settings_Host();
		}

		return new Split_Settings_Host( $this->kit_keys );
	}

	/**
	 * Replacing a widget's own style keeps its site-wide styles unless the CSS restyles them.
	 *
	 * @param array<string, mixed> $settings_patch
	 */
	public function for_replace( array $settings_patch ): self {
		$host = $this->get_settings_host();

		if ( ! $host instanceof Split_Settings_Host || ! empty( $host->site_settings( $settings_patch ) ) ) {
			return $this;
		}

		return $this->without_kit_targets();
	}

	public function without_kit_targets(): self {
		$map = clone $this;
		$map->targets = array_diff_key( $this->targets, array_flip( $this->kit_target_aliases ) );
		$map->kit_target_aliases = [];

		return $map;
	}

	public function get_widget_type(): string {
		return $this->widget_type;
	}

	public function get_description(): string {
		return $this->description;
	}

	/**
	 * @return array<string, Compiled_V3_Setting>
	 */
	public function get_settings(): array {
		return $this->settings;
	}

	/**
	 * @return array<string, array<string, mixed>>
	 */
	public function get_setting_schemas(): array {
		return array_map(
			fn( Compiled_V3_Setting $setting ) => $setting->get_schema(),
			$this->settings
		);
	}

	public function get_default_target(): string {
		return $this->default_target;
	}

	/**
	 * @return array<string, Compiled_Style_Target>
	 */
	public function get_targets(): array {
		return $this->targets;
	}

	/**
	 * @return Compiled_Style_Binding[]
	 */
	public function get_style_bindings(): array {
		return array_merge( [], ...array_values( array_map(
			fn( Compiled_Style_Target $target ) => $target->get_bindings(),
			$this->targets
		) ) );
	}
}
