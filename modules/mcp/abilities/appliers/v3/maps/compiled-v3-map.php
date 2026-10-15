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
	 * @param string                               $widget_type
	 * @param string                               $description
	 * @param array<string, Compiled_V3_Setting>   $settings
	 * @param string                               $default_target
	 * @param array<string, Compiled_Style_Target> $targets
	 */
	public function __construct( string $widget_type, string $description, array $settings, string $default_target, array $targets ) {
		$this->widget_type = $widget_type;
		$this->description = $description;
		$this->settings = $settings;
		$this->default_target = $default_target;
		$this->targets = $targets;
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
